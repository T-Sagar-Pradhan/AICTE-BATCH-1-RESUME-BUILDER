"""
AI module - Uses OpenAI ChatGPT for all AI features.
"""
import openai
from app.config import settings
import structlog
import json
import re

logger = structlog.get_logger()

client = openai.OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)
MODEL = settings.AI_MODEL


def extract_json(text: str):
    """Extract JSON from model response text."""
    json_match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if json_match:
        return json.loads(json_match.group(1))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
    if json_match:
        return json.loads(json_match.group(1))
    raise ValueError("Could not extract JSON from response")


def chat_completion(messages, temperature=0.7, max_tokens=4096):
    """Make a ChatGPT API call."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


async def generate_resume_content(
    skills: list,
    education: list,
    projects: list,
    experience: list,
    target_job: str,
    additional_context: str = ""
):
    prompt = f"""You are an expert resume writer. Generate professional, ATS-optimized resume content.

Target Job: {target_job}
Skills: {', '.join(skills)}
Education: {json.dumps(education)}
Projects: {json.dumps(projects)}
Experience: {json.dumps(experience)}
Additional Context: {additional_context}

Return JSON:
{{
  "professional_summary": "3-4 sentence summary",
  "enhanced_skills": ["skill1", "skill2"],
  "enhanced_projects": [{{"name": "name", "description": "desc", "highlights": ["h1"]}}],
  "enhanced_experience": [{{"company": "name", "description": ["bullet1", "bullet2"]}}],
  "achievement_statements": ["achievement1"],
  "keywords": ["keyword1"]
}}"""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return extract_json(result)
    except Exception as e:
        logger.error("AI resume generation failed", error=str(e))
        raise


async def generate_cover_letter(
    resume_data: dict,
    job_description: str,
    company_name: str,
    job_title: str,
    tone: str = "professional"
):
    prompt = f"""Write a compelling cover letter.

Candidate: {json.dumps(resume_data)}
Company: {company_name}
Position: {job_title}
Job Description: {job_description}
Tone: {tone}

Write a complete personalized cover letter (350-450 words). Return ONLY the letter text."""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return result.strip()
    except Exception as e:
        logger.error("AI cover letter failed", error=str(e))
        raise


async def generate_interview_questions(
    target_role: str,
    difficulty: str,
    question_types: list,
    resume_context: str = "",
    num_questions: int = 10
):
    prompt = f"""Generate {num_questions} interview questions for: {target_role}
Difficulty: {difficulty}
Types: {', '.join(question_types)}
Candidate Background: {resume_context}

Return JSON array:
[{{"question": "...", "suggested_answer": "...", "question_type": "technical|hr|project|behavioral", "difficulty": "{difficulty}", "topic": "..."}}]"""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return extract_json(result)
    except Exception as e:
        logger.error("AI interview questions failed", error=str(e))
        raise


async def chat_with_advisor(
    message: str,
    context_type: str,
    chat_history: list,
    user_context: str = ""
):
    messages = [
        {"role": "system", "content": f"""You are CareerForge AI, an expert career advisor. Help with resume writing, career guidance, interview prep, job search strategies, and skill development. Context: {context_type}. User: {user_context}. Be encouraging, specific, and actionable."""}
    ]
    for msg in chat_history[-10:]:
        messages.append({"role": msg["role"] if msg["role"] != "assistant" else "assistant", "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    try:
        result = chat_completion(messages)
        return result.strip()
    except Exception as e:
        logger.error("AI chat failed", error=str(e))
        raise


async def analyze_skill_gaps(current_skills: list, target_role: str, experience_level: str = "entry"):
    prompt = f"""Analyze skill gaps:
Current Skills: {', '.join(current_skills)}
Target Role: {target_role}
Level: {experience_level}

Return JSON:
{{"missing_skills": [], "recommended_learning": [{{"skill": "", "priority": "high|medium|low", "resources": [], "estimated_time": ""}}], "career_roadmap": [{{"phase": "", "goals": [], "skills_to_develop": []}}], "job_readiness_score": 75, "strengths": [], "quick_wins": []}}"""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return extract_json(result)
    except Exception as e:
        logger.error("AI skill gap failed", error=str(e))
        raise


async def rewrite_resume(resume_data: dict, target_role: str):
    prompt = f"""Rewrite this resume for {target_role}. Improve summary, skills, experience descriptions with action verbs and metrics.

Resume: {json.dumps(resume_data)}

Return improved resume in same JSON structure."""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return extract_json(result)
    except Exception as e:
        logger.error("AI resume rewrite failed", error=str(e))
        raise
