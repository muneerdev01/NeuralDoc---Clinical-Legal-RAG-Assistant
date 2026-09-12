from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    filename: str
    category: str = Field(default="general", description="clinical, legal, or general")
    author: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: str
    file_size: int
    page_count: int
    processing_status: str
    chunk_count: int
    uploaded_at: str
    updated_at: str
    summary: Optional[str] = None
    collection_id: Optional[str] = None

class ChunkResponse(BaseModel):
    id: str
    document_id: str
    content: str
    page_number: int
    chunk_index: int
    section: Optional[str] = None
    token_count: int
    created_at: str

class DocumentSummaryResponse(BaseModel):
    document_id: str
    title: str
    category: str
    summary: str
    source_pages: List[int]
