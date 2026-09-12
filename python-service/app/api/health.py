from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "demo_mode": settings.demo_mode,
        "embedding_provider": settings.embedding_provider,
        "llm_provider": settings.llm_provider
    }
