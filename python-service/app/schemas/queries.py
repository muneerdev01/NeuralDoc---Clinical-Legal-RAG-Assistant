from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SourceCitationModel(BaseModel):
    id: str
    document_id: str
    document_title: str
    category: str
    page: int
    chunk_id: str
    similarity: float
    excerpt: str
    section: Optional[str] = None

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    document_ids: Optional[List[str]] = Field(default=None, description="Filter to specific documents")
    collection_id: Optional[str] = Field(default=None, description="Filter to collection")
    top_k: int = Field(default=4, ge=1, le=20)
    similarity_threshold: float = Field(default=0.65, ge=0.0, le=1.0)
    category: Optional[str] = Field(default=None, description="clinical, legal, general")

class DebugInfoModel(BaseModel):
    query: str
    top_k: int
    threshold: float
    retrieved_count: int
    raw_scores: List[float]
    execution_time_ms: int

class QueryResponse(BaseModel):
    answer: str
    grounded: bool
    sources: List[SourceCitationModel]
    latency_ms: int
    debug_info: Optional[DebugInfoModel] = None
