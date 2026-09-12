# NeuralDoc — Clinical & Legal Document Intelligence + RAG Assistant

A production-grade, document-grounded AI assistant designed for clinical discharge summaries, lab reports, executive contracts, and legal agreements. NeuralDoc demonstrates end-to-end Retrieval-Augmented Generation (RAG) backed by PostgreSQL **pgvector**, recursive text chunking, dense semantic embeddings, strict hallucination guardrails, and verifiable source citations.

---

## 1. Key Capabilities

* **PDF & Document Extraction**: Extracts text page-by-page preserving structural page boundaries for exact source attribution.

* **Recursive Semantic Chunking**: Hierarchical splitting (`\n\nSECTION`, `\n\n`, `\n`, sentences) with configurable token size (800–1200) and overlap (100–200).

* **pgvector Vector Database**: Native PostgreSQL vector search via cosine distance (`<=>`) accelerated by HNSW indexing (`m=16, ef_construction=64`).

* **Strict Hallucination Guardrails**:

  * **Threshold Guardrail**: If similarity falls below the configured threshold (default `0.65`), strictly returns:

    > `"Information not available in document."`
  * **Citation Requirement**: Factual assertions must map to an authentic retrieved chunk ID and page.
  * **Prompt Injection Defense**: Sanitizes untrusted user inputs and document overrides such as `"Ignore previous instructions"`.

* **Clickable Source Citations**: Every answer provides `[Document — Page X]` citation pills that immediately highlight the source excerpt in the dedicated Sources panel.

* **Dual Mode Intelligence**:

  * **Clinical Mode**: Quick actions for discharge instructions, medications, stent/procedure details, and red-flag symptoms.
  * **Legal Mode**: Quick actions for termination notice conditions, liability caps, and IP assignment clauses.

* **Zero-Key Demo Mode**: Fully functional out of the box with pre-indexed synthetic cardiology records and executive employment contracts.

---

## 2. System Architecture

```text
[ Uploaded PDF / TXT ] ──► [ Page-by-Page Extraction ]
                                  │
                                  ▼
                       [ Recursive Text Chunking ]
                                  │
                                  ▼
                     [ 384-d / 1536-d Dense Embeddings ]
                                  │
                                  ▼
                     [ Supabase PostgreSQL + pgvector ]
                       (HNSW Index on vector_cosine_ops)
                                  │
       [ User Question ] ──► [ Question Embedding ]
                                  │
                                  ▼
                         [ Cosine Similarity Search ]
                         (public.match_documents RPC)
                                  │
                                  ▼
                       [ Minimum Threshold Check ]
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
      Score < Threshold                       Score >= Threshold
              │                                       │
              ▼                                       ▼
 "Information not available              [ Top-K Context Assembly ]
       in document."                                  │
                                                      ▼
                                          [ Strict System Prompt ]
                                                      │
                                                      ▼
                                           [ LLM Grounded Output ]
                                                      │
                                                      ▼
                                           [ Verifiable Citations ]
```

---

## 3. Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Backend Service (Python)**: Python 3.12, FastAPI, PyMuPDF, Pydantic, Uvicorn
* **Vector Database**: Supabase PostgreSQL with `pgvector`
* **Embedding Models**: 384-dimensional dense vectors (BAAI/bge-small / MiniLM) or OpenAI `text-embedding-3-small` (1536-d)
* **Deployment**: Vercel (Frontend), Render / Cloud Run (FastAPI), Supabase (Database)

---

## 4. Supabase pgvector Database Schema

### SQL Migration (`supabase/migrations/20250101_init_neuraldoc_pgvector.sql`)

```sql
-- 1. Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Chunks Table with vector column
CREATE TABLE public.document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(384),
    page_number INT NOT NULL DEFAULT 1,
    chunk_index INT NOT NULL DEFAULT 0,
    section TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. HNSW Vector Index for Nearest Neighbor Search
CREATE INDEX idx_document_chunks_embedding_hnsw
ON public.document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Stored Procedure: match_documents
CREATE OR REPLACE FUNCTION public.match_documents (
    query_embedding vector(384),
    match_count INT DEFAULT 4,
    filter_doc_ids TEXT[] DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.65
)
RETURNS TABLE (
    chunk_id TEXT,
    document_id TEXT,
    content TEXT,
    page_number INT,
    section TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id AS chunk_id,
        dc.document_id,
        dc.content,
        dc.page_number,
        dc.section,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE
        (filter_doc_ids IS NULL OR dc.document_id = ANY(filter_doc_ids))
        AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
```

---

## 5. Environment Variables

Create a `.env.example` file:

```env
# ==========================================
# NeuralDoc Demo Configuration
# ==========================================

# Application Mode
NEXT_PUBLIC_DEMO_MODE=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key

# Python FastAPI Service (Optional)
PYTHON_SERVICE_URL=https://your-demo-python-service.onrender.com
PYTHON_SERVICE_API_KEY=demo-python-api-key

# Model Providers
LLM_PROVIDER=demo
LLM_API_KEY=demo-llm-key
LLM_MODEL=gpt-4o-mini

EMBEDDING_PROVIDER=demo
EMBEDDING_API_KEY=demo-embedding-key
EMBEDDING_MODEL=text-embedding-3-small
```

> **Important:** The values above are **demo placeholders only**. They are not real API credentials and must not be used as production secrets.

For an actual deployment, replace the placeholder values with valid credentials through the deployment platform's environment-variable settings.

### Environment Variable Reference

| Variable                        | Purpose                             | Demo Value               |
| ------------------------------- | ----------------------------------- | ------------------------ |
| `NEXT_PUBLIC_DEMO_MODE`         | Enables portfolio/demo mode         | `true`                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                | Demo placeholder         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key          | Demo placeholder         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-side Supabase administration | Demo placeholder         |
| `PYTHON_SERVICE_URL`            | FastAPI backend URL                 | Demo placeholder         |
| `PYTHON_SERVICE_API_KEY`        | Optional backend authentication     | Demo placeholder         |
| `LLM_PROVIDER`                  | LLM provider                        | `demo`                   |
| `LLM_API_KEY`                   | LLM API credential                  | Demo placeholder         |
| `LLM_MODEL`                     | LLM model name                      | `gpt-4o-mini`            |
| `EMBEDDING_PROVIDER`            | Embedding provider                  | `demo`                   |
| `EMBEDDING_API_KEY`             | Embedding API credential            | Demo placeholder         |
| `EMBEDDING_MODEL`               | Embedding model name                | `text-embedding-3-small` |

---

## 6. Demo Environment & API Keys

NeuralDoc is primarily a **portfolio and demonstration project**. The repository is designed to support a zero-key demo experience using synthetic documents, simulated responses, and demo configuration.

The demo environment is intended to demonstrate:

* PDF/document ingestion
* Text extraction
* Recursive chunking
* Vector embeddings
* pgvector semantic retrieval
* RAG context assembly
* Hallucination guardrails
* Source citations
* Clinical and legal document workflows
* FastAPI + Next.js integration

### Demo Mode

Set:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

When Demo Mode is enabled, NeuralDoc can use pre-indexed synthetic documents and simulated RAG responses without requiring real external AI credentials.

### Demo Keys

The following values are examples of **fake/demo credentials** used only to illustrate the expected configuration:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key

PYTHON_SERVICE_API_KEY=demo-python-api-key

LLM_PROVIDER=demo
LLM_API_KEY=demo-llm-key

EMBEDDING_PROVIDER=demo
EMBEDDING_API_KEY=demo-embedding-key
```

These values are intentionally non-functional placeholders.

**Do not copy real API keys into this README or commit them to Git.**

### Real Deployment

For a real deployment:

1. Create your Supabase project.
2. Configure Supabase URL and API keys.
3. Configure the Python FastAPI service.
4. Add LLM and embedding provider credentials if required.
5. Store secrets in Vercel/Render environment variables.
6. Keep Demo Mode enabled for portfolio demonstrations if external services are not required.

### Security Rules

Never expose private credentials through `NEXT_PUBLIC_*` variables.

In particular:

```text
SUPABASE_SERVICE_ROLE_KEY
LLM_API_KEY
EMBEDDING_API_KEY
PYTHON_SERVICE_API_KEY
```

must remain server-side/private.

Never commit:

```text
.env
.env.local
.env.production
```

or any file containing real credentials.

Add them to `.gitignore`:

```gitignore
.env
.env.local
.env.production
.env.*.local
```

---

## 7. Demo Data & Privacy

NeuralDoc uses **synthetic demonstration data** for clinical and legal workflows.

Example demo documents include:

* Synthetic cardiology discharge summary
* Synthetic medication information
* Synthetic procedure documentation
* Synthetic executive employment agreement
* Synthetic legal clauses
* Synthetic document chunks and citations

These documents are fictional and exist only for demonstrating the RAG workflow.

**Do not upload real patient records, personally identifiable medical information, confidential contracts, or other sensitive documents into the public demo environment.**

---

## 8. Local Quickstart

### Running Frontend

```bash
npm install

npm run dev

# App launches on http://localhost:3000
```

### Running Python FastAPI Service

```bash
cd python-service

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Python RAG Tests

```bash
cd python-service

pytest tests/
```

---

## 9. Medical & Legal Safety Notice

> **Disclaimer:** NeuralDoc is a document-grounded AI demonstration. It does not provide medical diagnosis or legal advice. Always verify important information against the original document and consult a qualified professional.

Clinical and legal responses are intended to demonstrate document-grounded retrieval only. The system should not be relied upon as a substitute for qualified medical, legal, or professional judgment.

---

## 10. Production Security Notice

Although NeuralDoc demonstrates a production-style architecture, this repository is primarily intended for **portfolio and educational demonstration purposes**.

Before using the system with real data:

* Replace all demo credentials.
* Configure secure production environment variables.
* Enable appropriate Supabase Row Level Security policies.
* Restrict CORS to trusted frontend origins.
* Protect private FastAPI endpoints.
* Add authentication and authorization.
* Enable HTTPS.
* Apply appropriate document-access controls.
* Do not store sensitive documents in a public demo environment.
* Review applicable privacy, medical-data, and legal-data requirements.

**Demo credentials are placeholders and must never be considered secure production credentials.**

---

## 11. Deployment

### Frontend — Vercel

The Next.js frontend can be deployed to Vercel.

Configure the required environment variables in the Vercel project settings rather than committing secrets to Git.

### Backend — Render / Cloud Run

The Python FastAPI service can be deployed independently using Render or another Python-compatible hosting provider.

The frontend communicates with the FastAPI service through:

```env
PYTHON_SERVICE_URL=https://your-demo-python-service.onrender.com
```

### Database — Supabase

Supabase provides PostgreSQL, `pgvector`, database functions, and vector similarity search.

For the portfolio demo, the application can operate in Demo Mode without requiring every external service to be continuously available.

---

## 12. Project Goal

NeuralDoc demonstrates how modern AI applications can combine:

**Document Intelligence → Chunking → Embeddings → Vector Search → RAG → Guardrails → Citations → Professional UI**

The project is designed to showcase practical AI engineering skills including document processing, semantic search, vector databases, backend API development, frontend integration, and trustworthy AI patterns.
