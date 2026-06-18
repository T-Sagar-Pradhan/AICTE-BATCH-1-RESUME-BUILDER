from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
import io
import json
from typing import Optional


def generate_resume_pdf(resume_data: dict, template: str = "modern") -> bytes:
    """Generate PDF from resume data."""
    buffer = io.BytesIO()

    if template == "modern":
        pdf_bytes = generate_modern_pdf(resume_data, buffer)
    elif template == "ats_friendly":
        pdf_bytes = generate_ats_pdf(resume_data, buffer)
    elif template == "minimal":
        pdf_bytes = generate_minimal_pdf(resume_data, buffer)
    else:
        pdf_bytes = generate_modern_pdf(resume_data, buffer)

    return pdf_bytes


def generate_modern_pdf(resume_data: dict, buffer: io.BytesIO) -> bytes:
    """Generate modern styled resume PDF."""
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    # Color scheme
    primary_color = colors.HexColor('#2563EB')  # Blue
    secondary_color = colors.HexColor('#1E293B')  # Dark
    accent_color = colors.HexColor('#64748B')  # Gray

    styles = getSampleStyleSheet()

    # Custom styles
    name_style = ParagraphStyle(
        'Name',
        parent=styles['Normal'],
        fontSize=24,
        fontName='Helvetica-Bold',
        textColor=secondary_color,
        spaceAfter=4,
        alignment=TA_CENTER
    )

    contact_style = ParagraphStyle(
        'Contact',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Helvetica',
        textColor=accent_color,
        alignment=TA_CENTER,
        spaceAfter=8
    )

    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontSize=12,
        fontName='Helvetica-Bold',
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9.5,
        fontName='Helvetica',
        textColor=secondary_color,
        spaceAfter=3,
        leading=14
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=9.5,
        fontName='Helvetica',
        textColor=secondary_color,
        leftIndent=15,
        spaceAfter=2,
        leading=13
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica-Bold',
        textColor=secondary_color,
        spaceAfter=1
    )

    story = []

    # Header - Name
    personal = resume_data.get("personal_details", {}) or {}
    name = personal.get("name", "Your Name")
    story.append(Paragraph(name, name_style))

    # Contact info
    contact_parts = []
    if personal.get("email"):
        contact_parts.append(personal["email"])
    if personal.get("phone"):
        contact_parts.append(personal["phone"])
    if personal.get("location"):
        contact_parts.append(personal["location"])
    if personal.get("linkedin"):
        contact_parts.append(personal["linkedin"])
    if personal.get("github"):
        contact_parts.append(personal["github"])

    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), contact_style))

    story.append(HRFlowable(width="100%", thickness=2, color=primary_color))
    story.append(Spacer(1, 4))

    # Summary
    summary = resume_data.get("summary") or resume_data.get("ai_summary")
    if summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))
        story.append(Paragraph(summary, body_style))

    # Experience
    experience = resume_data.get("experience", []) or []
    if experience:
        story.append(Paragraph("EXPERIENCE", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))

        for exp in experience:
            # Company and dates on same line
            company = exp.get("company", "")
            position = exp.get("position", "")
            start = exp.get("start_date", "")
            end = "Present" if exp.get("is_current") else exp.get("end_date", "")
            date_str = f"{start} - {end}" if start else ""
            location = exp.get("location", "")

            story.append(Paragraph(f"<b>{position}</b>", subtitle_style))

            info_line = company
            if location:
                info_line += f" | {location}"
            if date_str:
                info_line += f" | {date_str}"
            story.append(Paragraph(info_line, ParagraphStyle(
                'Info', parent=body_style, textColor=accent_color, fontSize=9
            )))

            descriptions = exp.get("description", []) or []
            for desc in descriptions:
                if desc:
                    story.append(Paragraph(f"• {desc}", bullet_style))

            story.append(Spacer(1, 4))

    # Education
    education = resume_data.get("education", []) or []
    if education:
        story.append(Paragraph("EDUCATION", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))

        for edu in education:
            institution = edu.get("institution", "")
            degree = edu.get("degree", "")
            field = edu.get("field", "")
            end_date = edu.get("end_date", "")
            gpa = edu.get("gpa", "")

            degree_line = degree
            if field:
                degree_line += f" in {field}"
            story.append(Paragraph(f"<b>{degree_line}</b>", subtitle_style))

            info = institution
            if end_date:
                info += f" | {end_date}"
            if gpa:
                info += f" | GPA: {gpa}"
            story.append(Paragraph(info, ParagraphStyle(
                'Info', parent=body_style, textColor=accent_color, fontSize=9
            )))

            story.append(Spacer(1, 4))

    # Skills
    skills = resume_data.get("skills", []) or []
    if skills:
        story.append(Paragraph("SKILLS", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))

        if isinstance(skills[0], dict):
            for skill_group in skills:
                category = skill_group.get("category", "")
                skill_list = skill_group.get("skills", [])
                if category:
                    story.append(Paragraph(
                        f"<b>{category}:</b> {', '.join(skill_list)}", body_style
                    ))
        else:
            story.append(Paragraph(", ".join(str(s) for s in skills), body_style))

    # Projects
    projects = resume_data.get("projects", []) or []
    if projects:
        story.append(Paragraph("PROJECTS", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))

        for proj in projects:
            name = proj.get("name", "")
            desc = proj.get("description", "")
            technologies = proj.get("technologies", [])
            highlights = proj.get("highlights", [])
            github = proj.get("github_url", "")
            live = proj.get("live_url", "")

            proj_header = name
            if github:
                proj_header += f" | GitHub: {github}"
            story.append(Paragraph(f"<b>{proj_header}</b>", subtitle_style))

            if technologies:
                story.append(Paragraph(
                    f"Technologies: {', '.join(technologies)}",
                    ParagraphStyle('Tech', parent=body_style, textColor=accent_color, fontSize=9)
                ))

            if desc:
                story.append(Paragraph(f"• {desc}", bullet_style))

            for hl in highlights:
                if hl:
                    story.append(Paragraph(f"• {hl}", bullet_style))

            story.append(Spacer(1, 4))

    # Certifications
    certifications = resume_data.get("certifications", []) or []
    if certifications:
        story.append(Paragraph("CERTIFICATIONS", section_header_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=accent_color))
        story.append(Spacer(1, 4))

        for cert in certifications:
            name = cert.get("name", "")
            issuer = cert.get("issuer", "")
            date = cert.get("date", "")
            cert_line = name
            if issuer:
                cert_line += f" - {issuer}"
            if date:
                cert_line += f" ({date})"
            story.append(Paragraph(f"• {cert_line}", bullet_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_ats_pdf(resume_data: dict, buffer: io.BytesIO) -> bytes:
    """Generate ATS-optimized minimal PDF."""
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch
    )

    styles = getSampleStyleSheet()
    story = []

    personal = resume_data.get("personal_details", {}) or {}

    # Simple header
    story.append(Paragraph(
        personal.get("name", "Your Name"),
        ParagraphStyle('Name', parent=styles['Normal'], fontSize=18, fontName='Helvetica-Bold', spaceAfter=6)
    ))

    contact_parts = [
        personal.get("email", ""),
        personal.get("phone", ""),
        personal.get("location", "")
    ]
    story.append(Paragraph(
        " | ".join(p for p in contact_parts if p),
        ParagraphStyle('Contact', parent=styles['Normal'], fontSize=10, spaceAfter=12)
    ))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))

    section_style = ParagraphStyle(
        'Section', parent=styles['Normal'],
        fontSize=12, fontName='Helvetica-Bold', spaceBefore=12, spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=10, spaceAfter=3
    )

    # Summary
    summary = resume_data.get("summary")
    if summary:
        story.append(Paragraph("SUMMARY", section_style))
        story.append(Paragraph(summary, body_style))

    # Experience, Education, Skills, Projects (same as modern but simpler styling)
    _add_sections_ats(story, resume_data, section_style, body_style)

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def _add_sections_ats(story, resume_data, section_style, body_style):
    """Add content sections with ATS-friendly formatting."""
    experience = resume_data.get("experience", []) or []
    if experience:
        story.append(Paragraph("EXPERIENCE", section_style))
        for exp in experience:
            story.append(Paragraph(
                f"{exp.get('position', '')} at {exp.get('company', '')}",
                ParagraphStyle('JobTitle', fontSize=11, fontName='Helvetica-Bold')
            ))
            for desc in (exp.get("description") or []):
                story.append(Paragraph(f"• {desc}", body_style))

    education = resume_data.get("education", []) or []
    if education:
        story.append(Paragraph("EDUCATION", section_style))
        for edu in education:
            story.append(Paragraph(
                f"{edu.get('degree', '')} - {edu.get('institution', '')} ({edu.get('end_date', '')})",
                body_style
            ))

    skills = resume_data.get("skills", []) or []
    if skills:
        story.append(Paragraph("SKILLS", section_style))
        if skills and isinstance(skills[0], str):
            story.append(Paragraph(", ".join(skills), body_style))


def generate_minimal_pdf(resume_data: dict, buffer: io.BytesIO) -> bytes:
    """Alias to ATS PDF for minimal template."""
    return generate_ats_pdf(resume_data, buffer)
