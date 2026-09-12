import time
from fastapi import APIRouter, HTTPException
from app.schemas.queries import QueryRequest, QueryResponse, SourceCitationModel, DebugInfoModel
from app.rag.embeddings import generate_embedding
from app.rag.guardrails import (
    sanitize_query,
    check_confidence_threshold,
    validate_citations,
    EXACT_FALLBACK_STRING
)
from app.services.vector_store import db
from app.services.llm import llm_service

router = APIRouter(prefix="/api/v1", tags=["rag"])

@router.post("/query", response_model=QueryResponse)
async def query_rag(req: QueryRequest):
    start_time = time.time()

    # 1. Sanitize & check injection
    clean_question, _ = sanitize_query(req.question)

    # 2. Embed question
    query_emb = generate_embedding(clean_question)

    # 3. Match documents via pgvector similarity
    matches = db.match_documents(
        query_embedding=query_emb,
        match_count=req.top_k,
        filter_document_ids=req.document_ids,
        similarity_threshold=req.similarity_threshold
    )

    raw_scores = [m["similarity"] for m in matches]

    # 4. Guardrail: Confidence check
    if not check_confidence_threshold(matches, req.similarity_threshold):
        latency = int((time.time() - start_time) * 1000)
        return QueryResponse(
            answer=EXACT_FALLBACK_STRING,
            grounded=False,
            sources=[],
            latency_ms=latency,
            debug_info=DebugInfoModel(
                query=clean_question,
                top_k=req.top_k,
                threshold=req.similarity_threshold,
                retrieved_count=0,
                raw_scores=raw_scores,
                execution_time_ms=latency
            )
        )

    # 5. Generate LLM Answer
    answer, grounded = await llm_service.generate_rag_answer(
        question=clean_question,
        matches=matches,
        category=req.category or "general"
    )

    # 6. Format Sources & Citations
    sources = []
    if grounded and answer != EXACT_FALLBACK_STRING:
        for m in matches:
            c = m["chunk"]
            sources.append(SourceCitationModel(
                id=f"cite-{c['id']}",
                document_id=c["document_id"],
                document_title=c.get("document_title", "Document"),
                category=c.get("category", "general"),
                page=c["page_number"],
                chunk_id=c["id"],
                similarity=m["similarity"],
                excerpt=c["content"][:240] + "..." if len(c["content"]) > 240 else c["content"],
                section=c.get("section")
            ))

    latency = int((time.time() - start_time) * 1000)

    return QueryResponse(
        answer=answer,
        grounded=grounded and answer != EXACT_FALLBACK_STRING,
        sources=sources,
        latency_ms=latency,
        debug_info=DebugInfoModel(
            query=clean_question,
            top_k=req.top_k,
            threshold=req.similarity_threshold,
            retrieved_count=len(matches),
            raw_scores=raw_scores,
            execution_time_ms=latency
        )
    )
