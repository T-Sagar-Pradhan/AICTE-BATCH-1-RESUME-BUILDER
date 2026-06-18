import pdfplumber
import re
from typing import Optional
import structlog

logger = structlog.get_logger()

# ATS Keywords by category
ATS_KEYWORDS = {
    "action_verbs": [
        "developed", "implemented", "designed", "built", "created", "managed",
        "led", "optimized", "improved", "increased", "reduced", "achieved",
        "delivered", "launched", "collaborated", "analyzed", "architected",
        "deployed", "automated", "integrated", "streamlined", "mentored"
    ],
    "tech_skills": [
        "python", "javascript", "typescript", "react", "node.js", "java",
        "sql", "nosql", "mongodb", "postgresql", "docker", "kubernetes",
        "aws", "azure", "gcp", "machine learning", "deep learning", "api",
        "rest", "graphql", "git", "ci/cd", "agile", "scrum", "microservices",
        "fastapi", "django", "flask", "spring", "tensorflow", "pytorch"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem-solving",
        "analytical", "collaborative", "innovative", "adaptable"
    ],
    "education_keywords": [
        "bachelor", "master", "phd", "degree", "university", "college",
        "gpa", "certification", "coursework"
    ]
}

REQUIRED_SECTIONS = [
    "education", "experience", "skills", "projects",
    "contact", "summary", "objective", "certifications", "achievements"
]


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file."""
    text = ""
    try:
        import io
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error("PDF extraction failed", error=str(e))
        # Try PyPDF2 as fallback
        try:
            import io
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e2:
            logger.error("PyPDF2 extraction also failed", error=str(e2))
    return text


def analyze_ats(text: str) -> dict:
    """Analyze resume text for ATS compatibility."""
    text_lower = text.lower()
    words = text_lower.split()

    # 1. Formatting Score
    formatting_score = calculate_formatting_score(text)

    # 2. Skills Score
    skills_result = analyze_skills(text_lower)
    skills_score = skills_result["score"]

    # 3. Keyword Score
    keyword_result = analyze_keywords(text_lower)
    keyword_score = keyword_result["score"]

    # 4. Readability Score
    readability_score = calculate_readability(text, words)

    # 5. Structure Score
    structure_result = analyze_structure(text_lower)
    structure_score = structure_result["score"]

    # Overall score (weighted)
    overall_score = (
        formatting_score * 0.20 +
        skills_score * 0.25 +
        keyword_score * 0.25 +
        readability_score * 0.15 +
        structure_score * 0.15
    )

    # Generate recommendations
    recommendations = generate_recommendations(
        formatting_score, skills_result, keyword_result, readability_score, structure_result
    )

    # Extract contact info
    contact_info = extract_contact_info(text)

    return {
        "overall_score": round(overall_score, 1),
        "formatting_score": round(formatting_score, 1),
        "skills_score": round(skills_score, 1),
        "keyword_score": round(keyword_score, 1),
        "readability_score": round(readability_score, 1),
        "structure_score": round(structure_score, 1),
        "detected_skills": skills_result["detected"],
        "missing_keywords": keyword_result["missing"],
        "weak_sections": structure_result["weak_sections"],
        "formatting_issues": structure_result["formatting_issues"],
        "recommendations": recommendations,
        "sections_found": structure_result["sections_found"],
        "contact_info": contact_info
    }


def calculate_formatting_score(text: str) -> float:
    score = 100.0
    issues = []

    # Check for common formatting problems
    if len(re.findall(r'[^\x00-\x7F]', text)) > 10:
        score -= 15
        issues.append("Special characters detected")

    if len(re.findall(r'\t', text)) > 20:
        score -= 10
        issues.append("Excessive tabs - use spaces")

    # Check length
    word_count = len(text.split())
    if word_count < 200:
        score -= 20
        issues.append("Resume too short")
    elif word_count > 1200:
        score -= 10
        issues.append("Resume may be too long")

    # Check for tables (hard for ATS)
    if text.count('|') > 5:
        score -= 15
        issues.append("Tables detected - ATS may not parse correctly")

    return max(score, 0)


def analyze_skills(text_lower: str) -> dict:
    detected = []
    for skill in ATS_KEYWORDS["tech_skills"] + ATS_KEYWORDS["soft_skills"]:
        if skill in text_lower:
            detected.append(skill)

    # Score based on skill density
    score = min(100, len(detected) * 5)
    return {"score": score, "detected": detected}


def analyze_keywords(text_lower: str) -> dict:
    found = []
    missing = []

    important_keywords = [
        "experience", "education", "skills", "project", "achievement",
        "certification", "leadership", "collaboration", "innovation"
    ]

    action_verb_count = sum(1 for verb in ATS_KEYWORDS["action_verbs"] if verb in text_lower)

    for kw in important_keywords:
        if kw in text_lower:
            found.append(kw)
        else:
            missing.append(kw)

    # Score: action verbs + keyword presence
    score = min(100, (action_verb_count * 4) + (len(found) / len(important_keywords) * 60))
    return {"score": score, "found": found, "missing": missing}


def calculate_readability(text: str, words: list) -> float:
    score = 100.0
    sentences = re.split(r'[.!?]+', text)

    if sentences:
        avg_sentence_length = len(words) / max(len(sentences), 1)
        if avg_sentence_length > 30:
            score -= 20
        elif avg_sentence_length < 5:
            score -= 10

    # Bullet points indicate good readability
    bullet_count = len(re.findall(r'[•\-*]\s', text))
    if bullet_count < 5:
        score -= 15
    elif bullet_count > 30:
        score -= 5

    return max(score, 0)


def analyze_structure(text_lower: str) -> dict:
    sections_found = []
    weak_sections = []
    formatting_issues = []

    for section in REQUIRED_SECTIONS:
        if section in text_lower:
            sections_found.append(section)
        else:
            if section in ["education", "skills", "experience"]:
                weak_sections.append(f"Missing critical section: {section}")

    # Check for contact info
    if "@" not in text_lower:
        weak_sections.append("No email address found")
        formatting_issues.append("Add email address")

    if not re.search(r'\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4}', text_lower):
        weak_sections.append("No phone number found")

    score = (len(sections_found) / len(REQUIRED_SECTIONS)) * 100
    score -= len(weak_sections) * 5

    return {
        "score": max(score, 0),
        "sections_found": sections_found,
        "weak_sections": weak_sections,
        "formatting_issues": formatting_issues
    }


def generate_recommendations(
    formatting_score: float,
    skills_result: dict,
    keyword_result: dict,
    readability_score: float,
    structure_result: dict
) -> list:
    recommendations = []

    if formatting_score < 70:
        recommendations.append("Use a clean, single-column format for better ATS parsing")
        recommendations.append("Avoid tables, graphics, and special characters")

    if skills_result["score"] < 60:
        recommendations.append("Add more relevant technical skills to improve ATS matching")
        recommendations.append("Include programming languages, frameworks, and tools")

    if keyword_result["score"] < 60:
        recommendations.append("Use more action verbs (developed, implemented, achieved)")
        recommendations.append("Add industry-specific keywords from job descriptions")

    if readability_score < 70:
        recommendations.append("Use bullet points to describe responsibilities and achievements")
        recommendations.append("Keep sentences concise (15-20 words)")

    if len(structure_result["sections_found"]) < 5:
        recommendations.append("Add all key sections: Summary, Experience, Education, Skills, Projects")

    if not recommendations:
        recommendations.append("Great resume! Tailor keywords to each specific job description")

    return recommendations


def extract_contact_info(text: str) -> dict:
    contact = {}

    # Email
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', text)
    if email_match:
        contact["email"] = email_match.group()

    # Phone
    phone_match = re.search(r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        contact["phone"] = phone_match.group()

    # LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text, re.IGNORECASE)
    if linkedin_match:
        contact["linkedin"] = linkedin_match.group()

    # GitHub
    github_match = re.search(r'github\.com/[\w-]+', text, re.IGNORECASE)
    if github_match:
        contact["github"] = github_match.group()

    return contact


def calculate_job_match(resume_text: str, job_description: str) -> dict:
    """Calculate match between resume and job description."""
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # Extract keywords from JD
    jd_words = set(re.findall(r'\b[a-z]{3,}\b', jd_lower))
    resume_words = set(re.findall(r'\b[a-z]{3,}\b', resume_lower))

    # Stop words to filter
    stop_words = {
        "the", "and", "for", "are", "was", "will", "with", "this",
        "that", "have", "has", "had", "our", "your", "you", "we",
        "they", "them", "their", "from", "not", "but", "all", "can"
    }

    jd_keywords = jd_words - stop_words
    matching_keywords = jd_keywords & resume_words
    missing_keywords = jd_keywords - resume_words

    # Extract skill-like terms from JD
    tech_terms = re.findall(
        r'\b(?:python|javascript|react|node|java|sql|docker|kubernetes|aws|azure|'
        r'typescript|mongodb|postgresql|graphql|api|rest|machine learning|'
        r'tensorflow|pytorch|fastapi|django|flask|spring|angular|vue)\b',
        jd_lower
    )
    resume_skills = [t for t in tech_terms if t in resume_lower]
    missing_skills = [t for t in tech_terms if t not in resume_lower]

    # Calculate match score
    if len(jd_keywords) > 0:
        keyword_match_rate = len(matching_keywords) / len(jd_keywords)
    else:
        keyword_match_rate = 0

    # Weight skill matches higher
    skill_match_rate = len(resume_skills) / max(len(tech_terms), 1)
    match_score = (keyword_match_rate * 0.5 + skill_match_rate * 0.5) * 100

    suggestions = []
    if missing_skills:
        for skill in missing_skills[:5]:
            suggestions.append(f"Add '{skill}' to your skills section")

    top_missing = sorted(missing_keywords, key=lambda x: len(x), reverse=True)[:10]

    return {
        "match_score": round(min(match_score, 100), 1),
        "matching_skills": list(set(resume_skills)),
        "missing_skills": list(set(missing_skills)),
        "missing_keywords": list(top_missing),
        "suggestions": suggestions,
        "strengths": [f"You have: {s}" for s in resume_skills[:3]]
    }
