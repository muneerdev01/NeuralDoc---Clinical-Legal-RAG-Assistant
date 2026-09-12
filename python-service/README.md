# NeuralDoc Python Service (FastAPI + RAG Pipeline)

A high-performance Python microservice for PDF extraction, recursive chunking, embedding generation, pgvector semantic search, and hallucination-guarded RAG retrieval.

## Features
- **PyMuPDF Extraction**: Extracts page-by-page text preserving boundary metadata.
- **Recursive Text Chunking**: Splits hierarchical sections with configurable chunk size (~800-1200) and overlap (100-200).
- **pgvector Search**: Vector cosine similarity querying matching the PostgreSQL `match_documents` RPC interface.
- **Strict Guardrails**: Enforces exact fallback `"Information not available in document."` when similarity is below threshold or context is ungrounded.
- **Prompt Injection Defense**: Sanitizes untrusted user instructions and document content overrides.

## Local Development

```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests

```bash
pytest tests/
```

## Render / Cloud Run Deployment

This service includes a Dockerfile. To deploy on Render:
1. Create a **New Web Service** pointing to this directory.
2. Select **Docker** environment.
3. Set environment variables:
   - `LLM_PROVIDER`: `demo` or `openai`
   - `EMBEDDING_PROVIDER`: `demo` or `openai`
   - `PORT`: `8000`
