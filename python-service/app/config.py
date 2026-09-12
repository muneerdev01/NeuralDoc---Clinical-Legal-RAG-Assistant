import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "NeuralDoc RAG Assistant Service"
    version: str = "1.0.0"
    debug: bool = False
    
    # Mode
    demo_mode: bool = True
    
    # Supabase / Database
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    
    # LLM Provider ('demo', 'openai', 'gemini')
    llm_provider: str = "demo"
    llm_api_key: Optional[str] = None
    llm_model: str = "gpt-4o-mini"
    
    # Embeddings Provider ('demo', 'openai', 'huggingface')
    embedding_provider: str = "demo"
    embedding_api_key: Optional[str] = None
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 384
    
    # RAG Defaults
    default_top_k: int = 4
    default_similarity_threshold: float = 0.65
    default_chunk_size: int = 1000
    default_chunk_overlap: int = 150
    
    # CORS
    allowed_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
