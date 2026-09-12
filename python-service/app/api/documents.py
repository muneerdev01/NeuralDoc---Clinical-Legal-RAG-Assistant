from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
import uuid
from app.services.document_processor import process_document
from app.services.vector_store import db
from app.schemas.documents import DocumentResponse, DocumentSummaryResponse

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("general"),
    title: Optional[str] = Form(None)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")

    valid_extensions = (".pdf", ".txt", ".md", ".docx")
    if not file.filename.lower().endswith(valid_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Allowed: {valid_extensions}"
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    doc_title = title or file.filename.replace(".pdf", "").replace("_", " ")

    res = process_document(
        document_id=doc_id,
        title=doc_title,
        filename=file.filename,
        category=category,
        file_bytes=content
    )

    return res["document"]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str):
    if document_id not in db.documents:
        raise HTTPException(status_code=404, detail="Document not found.")
    return db.documents[document_id]

@router.post("/{document_id}/summary", response_model=DocumentSummaryResponse)
async def get_document_summary(document_id: str):
    if document_id not in db.documents:
        raise HTTPException(status_code=404, detail="Document not found.")
    doc = db.documents[document_id]
    chunks = [c for c in db.chunks.values() if c.get("document_id") == document_id]
    pages = sorted(list(set(c.get("page_number", 1) for c in chunks)))

    return DocumentSummaryResponse(
        document_id=document_id,
        title=doc["title"],
        category=doc["category"],
        summary=doc.get("summary", "Document processed."),
        source_pages=pages
    )

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    if document_id not in db.documents:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete_document(document_id)
    return {"message": "Document and associated pgvector chunks deleted."}
