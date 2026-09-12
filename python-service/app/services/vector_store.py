from typing import List, Dict, Any, Optional
from app.rag.embeddings import generate_embedding, cosine_similarity

class InMemoryPGVectorStore:
    """
    In-memory vector store matching the PostgreSQL pgvector match_documents function.
    In cloud deployment with Supabase, queries the PostgreSQL pgvector extension via RPC.
    """
    def __init__(self):
        self.chunks: Dict[str, Dict[str, Any]] = {}
        self.documents: Dict[str, Dict[str, Any]] = {}

    def insert_document(self, doc: Dict[str, Any]):
        self.documents[doc["id"]] = doc

    def insert_chunks(self, chunks: List[Dict[str, Any]]):
        for c in chunks:
            if "embedding" not in c or not c["embedding"]:
                c["embedding"] = generate_embedding(c["content"])
            self.chunks[c["id"]] = c

    def delete_document(self, document_id: str):
        if document_id in self.documents:
            del self.documents[document_id]
        self.chunks = {k: v for k, v in self.chunks.items() if v.get("document_id") != document_id}

    def match_documents(
        self,
        query_embedding: List[float],
        match_count: int = 4,
        filter_document_ids: Optional[List[str]] = None,
        similarity_threshold: float = 0.65
    ) -> List[Dict[str, Any]]:
        results = []

        for chunk_id, chunk in self.chunks.items():
            doc_id = chunk.get("document_id")
            if filter_document_ids and doc_id not in filter_document_ids:
                continue

            chunk_emb = chunk.get("embedding")
            if not chunk_emb:
                continue

            sim = cosine_similarity(query_embedding, chunk_emb)
            if sim >= similarity_threshold:
                results.append({
                    "chunk": chunk,
                    "similarity": round(sim, 4)
                })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:match_count]

db = InMemoryPGVectorStore()
