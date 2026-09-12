import io
from typing import List, Dict, Any, Tuple
import datetime
from app.rag.chunking import recursive_text_chunk
from app.rag.embeddings import generate_embedding
from app.services.vector_store import db

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extracts text page by page using PyMuPDF (fitz) or fallback.
    """
    pages = []
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            pages.append((page_num + 1, text.strip()))
    except Exception as e:
        # Fallback raw extraction
        raw_text = pdf_bytes.decode("utf-8", errors="ignore")
        pages.append((1, raw_text))

    return pages

def process_document(
    document_id: str,
    title: str,
    filename: str,
    category: str,
    file_bytes: bytes,
    chunk_size: int = 1000,
    chunk_overlap: int = 150
) -> Dict[str, Any]:
    pages = extract_text_from_pdf_bytes(file_bytes) if filename.lower().endswith(".pdf") else [(1, file_bytes.decode("utf-8", errors="ignore"))]
    
    all_chunks = []
    chunk_offset = 0

    for page_num, text in pages:
        if not text:
            continue
        chunks, next_idx = recursive_text_chunk(
            text=text,
            page_number=page_num,
            document_id=document_id,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            start_index=chunk_offset
        )
        for c in chunks:
            c["category"] = category
            c["document_title"] = title
            c["embedding"] = generate_embedding(c["content"])
            all_chunks.append(c)
        chunk_offset = next_idx

    now = datetime.datetime.utcnow().isoformat() + "Z"
    doc_meta = {
        "id": document_id,
        "title": title,
        "filename": filename,
        "category": category,
        "file_size": len(file_bytes),
        "page_count": len(pages),
        "processing_status": "ready",
        "chunk_count": len(all_chunks),
        "uploaded_at": now,
        "updated_at": now,
        "summary": f"{title} ({category.upper()}): {len(pages)} pages, {len(all_chunks)} chunks indexed."
    }

    db.insert_document(doc_meta)
    db.insert_chunks(all_chunks)

    return {"document": doc_meta, "chunks": all_chunks}
