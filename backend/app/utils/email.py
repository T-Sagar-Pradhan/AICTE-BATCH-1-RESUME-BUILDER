import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import structlog

logger = structlog.get_logger()


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP. Returns True on success."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not configured, skipping email", to=to_email, subject=subject)
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = settings.FROM_EMAIL
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

        logger.info("Email sent", to=to_email, subject=subject)
        return True
    except Exception as e:
        logger.error("Email send failed", error=str(e), to=to_email)
        return False


def send_password_reset_email(to_email: str, reset_url: str, name: str = "User") -> bool:
    subject = "Reset your CareerForge AI password"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 background: #0f172a; color: #f8fafc; padding: 40px; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px;">
        <h2 style="color: #6366f1; margin-top: 0;">CareerForge AI</h2>
        <h3 style="color: #f8fafc;">Reset your password</h3>
        <p style="color: #94a3b8;">Hi {name},</p>
        <p style="color: #94a3b8;">
          We received a request to reset your password. Click the button below to set a new one.
          This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}"
             style="background: #6366f1; color: white; padding: 14px 32px;
                    border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </div>
        <p style="color: #475569; font-size: 13px;">
          If you didn't request this, ignore this email — your password won't change.
        </p>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #334155; font-size: 12px; text-align: center;">
          CareerForge AI · Helping you land your dream job
        </p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)


def send_welcome_email(to_email: str, name: str) -> bool:
    subject = "Welcome to CareerForge AI 🚀"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 background: #0f172a; color: #f8fafc; padding: 40px; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px;">
        <h2 style="color: #6366f1; margin-top: 0;">CareerForge AI 🚀</h2>
        <h3 style="color: #f8fafc;">Welcome aboard, {name}!</h3>
        <p style="color: #94a3b8;">
          You're now part of CareerForge AI — the platform that helps you build better resumes,
          ace interviews, and land your dream job.
        </p>
        <p style="color: #94a3b8; font-weight: 600;">Here's what you can do:</p>
        <ul style="color: #94a3b8; line-height: 2;">
          <li>📄 Build ATS-optimized resumes in minutes</li>
          <li>📊 Analyze your resume's ATS score</li>
          <li>✉️ Generate personalized cover letters</li>
          <li>🌐 Create your portfolio website automatically</li>
          <li>🧠 Prepare for interviews with AI-generated questions</li>
          <li>💬 Chat with your AI career advisor</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{settings.FRONTEND_URL}/dashboard"
             style="background: #6366f1; color: white; padding: 14px 32px;
                    border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Go to Dashboard →
          </a>
        </div>
        <hr style="border-color: #334155; margin: 24px 0;">
        <p style="color: #334155; font-size: 12px; text-align: center;">
          CareerForge AI · Helping you land your dream job
        </p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)
