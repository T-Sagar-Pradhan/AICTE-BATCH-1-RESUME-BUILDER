import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.config import settings
import structlog

logger = structlog.get_logger()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)


async def upload_file(
    file_content: bytes,
    public_id: str,
    folder: str = "careerforge",
    resource_type: str = "auto"
) -> dict:
    """Upload file to Cloudinary."""
    try:
        result = cloudinary.uploader.upload(
            file_content,
            public_id=public_id,
            folder=folder,
            resource_type=resource_type,
            overwrite=True,
            invalidate=True
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "format": result.get("format"),
            "size": result.get("bytes")
        }
    except Exception as e:
        logger.error("Cloudinary upload failed", error=str(e))
        raise


async def upload_pdf(file_content: bytes, public_id: str, folder: str = "resumes") -> dict:
    """Upload PDF to Cloudinary."""
    return await upload_file(file_content, public_id, folder=f"careerforge/{folder}", resource_type="raw")


async def upload_image(file_content: bytes, public_id: str, folder: str = "avatars") -> dict:
    """Upload image to Cloudinary."""
    return await upload_file(file_content, public_id, folder=f"careerforge/{folder}", resource_type="image")


async def delete_file(public_id: str, resource_type: str = "auto") -> bool:
    """Delete file from Cloudinary."""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception as e:
        logger.error("Cloudinary delete failed", error=str(e))
        return False


def get_optimized_url(public_id: str, width: int = 800, quality: str = "auto") -> str:
    """Get optimized URL for images."""
    return cloudinary.CloudinaryImage(public_id).build_url(
        width=width,
        quality=quality,
        fetch_format="auto"
    )
