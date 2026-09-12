from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.api.query import router as query_router

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="NeuralDoc: Clinical & Legal Document Intelligence + RAG Assistant API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(documents_router)
app.include_router(query_router)

@app.get("/")
async def root():
    return {
        "message": "NeuralDoc API is operational",
        "docs_url": "/docs",
        "demo_mode": settings.demo_mode
    }
