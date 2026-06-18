import re
import zipfile
import io
import json
from typing import Optional


def generate_slug(name: str, user_id: str) -> str:
    """Generate URL slug from name."""
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', name).lower()
    slug = re.sub(r'\s+', '-', slug.strip())
    short_id = str(user_id).replace('-', '')[:6]
    return f"{slug}-{short_id}"


def generate_portfolio_html(portfolio_data: dict, theme: str = "dark") -> str:
    """Generate complete portfolio HTML website."""

    themes = {
        "dark": {
            "bg": "#0F172A",
            "card_bg": "#1E293B",
            "text": "#F8FAFC",
            "muted": "#94A3B8",
            "accent": "#6366F1",
            "border": "#334155",
            "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        "light": {
            "bg": "#F8FAFC",
            "card_bg": "#FFFFFF",
            "text": "#1E293B",
            "muted": "#64748B",
            "accent": "#2563EB",
            "border": "#E2E8F0",
            "gradient": "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)"
        },
        "cyberpunk": {
            "bg": "#0A0A0A",
            "card_bg": "#111111",
            "text": "#00FF88",
            "muted": "#00CC66",
            "accent": "#FF006E",
            "border": "#00FF88",
            "gradient": "linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)"
        },
        "professional": {
            "bg": "#F9FAFB",
            "card_bg": "#FFFFFF",
            "text": "#111827",
            "muted": "#6B7280",
            "accent": "#059669",
            "border": "#D1FAE5",
            "gradient": "linear-gradient(135deg, #059669 0%, #065F46 100%)"
        }
    }

    t = themes.get(theme, themes["dark"])

    name = portfolio_data.get("personal_details", {}).get("name", "Developer")
    tagline = portfolio_data.get("tagline", "Full Stack Developer | Building the future")
    about = portfolio_data.get("about", "Passionate developer with a love for creating innovative solutions.")
    skills = portfolio_data.get("skills", [])
    projects = portfolio_data.get("projects", [])
    experience = portfolio_data.get("experience", [])
    education = portfolio_data.get("education", [])
    contact = portfolio_data.get("contact", {})
    github_url = portfolio_data.get("github_url", "")
    linkedin_url = portfolio_data.get("linkedin_url", "")

    # Skills HTML
    skills_html = ""
    if skills:
        skill_items = []
        for skill in skills[:20]:
            skill_name = skill if isinstance(skill, str) else skill.get("name", str(skill))
            skill_items.append(f'''
                <span style="
                    background: {t["card_bg"]};
                    color: {t["accent"]};
                    border: 1px solid {t["accent"]};
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    display: inline-block;
                    margin: 4px;
                ">{skill_name}</span>
            ''')
        skills_html = "".join(skill_items)

    # Projects HTML
    projects_html = ""
    for proj in projects[:6]:
        techs = proj.get("technologies", [])
        tech_tags = " ".join([
            f'<span style="background: {t["accent"]}22; color: {t["accent"]}; padding: 2px 10px; border-radius: 12px; font-size: 12px;">{tech}</span>'
            for tech in techs[:4]
        ])
        github_link = f'<a href="{proj.get("github_url", "#")}" style="color: {t["accent"]}; text-decoration: none; font-size: 13px;">GitHub →</a>' if proj.get("github_url") else ""
        live_link = f'<a href="{proj.get("live_url", "#")}" style="color: {t["muted"]}; text-decoration: none; font-size: 13px; margin-left: 12px;">Live Demo →</a>' if proj.get("live_url") else ""

        projects_html += f'''
            <div style="
                background: {t["card_bg"]};
                border: 1px solid {t["border"]};
                border-radius: 12px;
                padding: 24px;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
                <h3 style="color: {t["text"]}; margin: 0 0 8px; font-size: 18px;">{proj.get("name", "Project")}</h3>
                <p style="color: {t["muted"]}; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">{proj.get("description", "")}</p>
                <div style="margin-bottom: 16px;">{tech_tags}</div>
                <div>{github_link}{live_link}</div>
            </div>
        '''

    # Experience HTML
    experience_html = ""
    for exp in experience[:4]:
        end = "Present" if exp.get("is_current") else exp.get("end_date", "")
        date_range = f"{exp.get('start_date', '')} - {end}"
        descriptions = exp.get("description", []) or []
        desc_items = "".join([f'<li style="margin-bottom: 4px;">{d}</li>' for d in descriptions[:3]])

        experience_html += f'''
            <div style="
                border-left: 3px solid {t["accent"]};
                padding-left: 20px;
                margin-bottom: 28px;
            ">
                <h3 style="color: {t["text"]}; margin: 0; font-size: 16px;">{exp.get("position", "")}</h3>
                <p style="color: {t["accent"]}; margin: 4px 0; font-weight: 600;">{exp.get("company", "")}</p>
                <p style="color: {t["muted"]}; font-size: 13px; margin: 0 0 10px;">{date_range}</p>
                <ul style="color: {t["muted"]}; font-size: 14px; padding-left: 16px; margin: 0;">
                    {desc_items}
                </ul>
            </div>
        '''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name} - Portfolio</title>
    <meta name="description" content="{tagline}">
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: {t["bg"]};
            color: {t["text"]};
            line-height: 1.6;
        }}
        nav {{
            position: fixed; top: 0; width: 100%;
            background: {t["bg"]}cc;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid {t["border"]};
            z-index: 100;
            padding: 0 5%;
        }}
        nav ul {{ display: flex; list-style: none; justify-content: flex-end; gap: 28px; padding: 16px 0; }}
        nav a {{ color: {t["muted"]}; text-decoration: none; font-size: 14px; transition: color 0.2s; }}
        nav a:hover {{ color: {t["accent"]}; }}
        section {{ padding: 80px 5%; max-width: 1100px; margin: 0 auto; }}
        h2 {{ font-size: 32px; margin-bottom: 40px; }}
        h2 span {{ color: {t["accent"]}; }}
        .grid-2 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }}
        .btn {{
            display: inline-block; padding: 12px 28px;
            background: {t["gradient"]}; color: white;
            text-decoration: none; border-radius: 8px;
            font-weight: 600; font-size: 15px;
            transition: opacity 0.2s;
        }}
        .btn:hover {{ opacity: 0.9; }}
        footer {{
            text-align: center; padding: 40px;
            color: {t["muted"]}; font-size: 14px;
            border-top: 1px solid {t["border"]};
        }}
        @media (max-width: 768px) {{
            section {{ padding: 60px 6%; }}
            h2 {{ font-size: 24px; }}
        }}
    </style>
</head>
<body>
    <nav>
        <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <!-- Hero -->
    <div style="
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        text-align: center; padding: 100px 5% 60px;
        background: radial-gradient(ellipse at top, {t["accent"]}15 0%, transparent 70%);
    ">
        <div>
            <p style="color: {t["accent"]}; font-size: 16px; margin-bottom: 16px; letter-spacing: 2px; text-transform: uppercase;">
                Hello, I'm
            </p>
            <h1 style="font-size: clamp(36px, 6vw, 72px); font-weight: 800; margin-bottom: 16px; letter-spacing: -1px;">
                {name}
            </h1>
            <p style="font-size: clamp(18px, 3vw, 24px); color: {t["muted"]}; margin-bottom: 40px; max-width: 600px;">
                {tagline}
            </p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <a href="#contact" class="btn">Get In Touch</a>
                <a href="#projects" style="
                    display: inline-block; padding: 12px 28px;
                    border: 1px solid {t["accent"]}; color: {t["accent"]};
                    text-decoration: none; border-radius: 8px; font-weight: 600;
                ">View Projects</a>
            </div>
            {"" if not github_url else f'<div style="margin-top: 24px;"><a href="{github_url}" style="color: {t["muted"]}; font-size: 13px; text-decoration: none;">GitHub</a></div>'}
        </div>
    </div>

    <!-- About -->
    <section id="about">
        <h2><span>About</span> Me</h2>
        <div style="
            background: {t["card_bg"]}; border: 1px solid {t["border"]};
            border-radius: 16px; padding: 40px; max-width: 800px;
        ">
            <p style="font-size: 16px; color: {t["muted"]}; line-height: 1.8;">{about}</p>
        </div>
    </section>

    <!-- Skills -->
    <section id="skills">
        <h2>Technical <span>Skills</span></h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            {skills_html}
        </div>
    </section>

    <!-- Projects -->
    <section id="projects">
        <h2>Featured <span>Projects</span></h2>
        <div class="grid-2">
            {projects_html}
        </div>
    </section>

    <!-- Experience -->
    <section id="experience">
        <h2>Work <span>Experience</span></h2>
        {experience_html}
    </section>

    <!-- Contact -->
    <section id="contact">
        <h2>Get In <span>Touch</span></h2>
        <div style="
            background: {t["card_bg"]}; border: 1px solid {t["border"]};
            border-radius: 16px; padding: 40px; max-width: 600px;
        ">
            <p style="color: {t["muted"]}; margin-bottom: 24px; font-size: 16px;">
                I'm always open to new opportunities. Let's connect!
            </p>
            {f'<p style="margin-bottom: 12px;"><a href="mailto:{contact.get("email", "")}" style="color: {t["accent"]}; text-decoration: none;">📧 {contact.get("email", "")}</a></p>' if contact.get("email") else ""}
            {f'<p style="margin-bottom: 12px;"><a href="{linkedin_url}" style="color: {t["accent"]}; text-decoration: none;">💼 LinkedIn</a></p>' if linkedin_url else ""}
            {f'<p style="margin-bottom: 12px;"><a href="{github_url}" style="color: {t["accent"]}; text-decoration: none;">🐙 GitHub</a></p>' if github_url else ""}
        </div>
    </section>

    <footer>
        <p>Built with ❤️ using CareerForge AI | © 2024 {name}</p>
    </footer>
</body>
</html>'''


def create_portfolio_zip(portfolio_data: dict, theme: str = "dark") -> bytes:
    """Create a ZIP file containing the portfolio website."""
    html_content = generate_portfolio_html(portfolio_data, theme)

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("index.html", html_content)
        zf.writestr("README.md", f"""# {portfolio_data.get('personal_details', {}).get('name', 'Portfolio')} - Portfolio Website

Generated by CareerForge AI

## Setup
1. Open `index.html` in your browser
2. Or deploy to GitHub Pages, Netlify, or Vercel

## Deployment to GitHub Pages
1. Create a new repository
2. Upload all files
3. Go to Settings → Pages → Deploy from main branch
""")

    buffer.seek(0)
    return buffer.read()
