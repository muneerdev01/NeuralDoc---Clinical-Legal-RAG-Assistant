-- ==============================================================================
-- NeuralDoc: Supabase PostgreSQL Schema with pgvector
-- Clinical & Legal Document Intelligence + Semantic Retrieval
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('clinical', 'legal', 'general')),
    author TEXT,
    file_size BIGINT NOT NULL DEFAULT 0,
    page_count INT NOT NULL DEFAULT 1,
    processing_status TEXT NOT NULL DEFAULT 'ready' 
        CHECK (processing_status IN ('idle', 'uploading', 'extracting', 'chunking', 'embedding', 'indexing', 'ready', 'failed')),
    storage_path TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Document Chunks Table (with pgvector embedding column)
-- Default dimension: 384 (supports BAAI/bge-small, all-MiniLM-L6-v2, and NeuralDoc dense vectorizer)
-- If using OpenAI text-embedding-3-small, alter dimension to 1536.
CREATE TABLE IF NOT EXISTS public.document_chunks (
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

-- 4. Create Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Collection-Document Link Table
CREATE TABLE IF NOT EXISTS public.collection_documents (
    collection_id TEXT NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, document_id)
);

-- 6. Create Queries Audit Log Table
CREATE TABLE IF NOT EXISTS public.queries (
    id TEXT PRIMARY KEY,
    user_question TEXT NOT NULL,
    answer TEXT NOT NULL,
    grounded BOOLEAN NOT NULL DEFAULT true,
    latency_ms INT NOT NULL DEFAULT 0,
    document_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Create Query Sources Attribution Table
CREATE TABLE IF NOT EXISTS public.query_sources (
    id TEXT PRIMARY KEY,
    query_id TEXT NOT NULL REFERENCES public.queries(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_id TEXT NOT NULL REFERENCES public.document_chunks(id) ON DELETE CASCADE,
    similarity_score NUMERIC(6, 4) NOT NULL,
    page_number INT NOT NULL
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION
-- ==============================================================================

-- HNSW Vector Index for fast cosine similarity nearest-neighbor lookups
-- m = 16: max connections per layer
-- ef_construction = 64: search queue size during build
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
ON public.document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- BTree indexes for fast foreign key filtering
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_page ON public.document_chunks(document_id, page_number);
CREATE INDEX IF NOT EXISTS idx_query_sources_query ON public.query_sources(query_id);

-- ==============================================================================
-- STORED PROCEDURE: match_documents
-- Performs cosine vector similarity search with Top-K and threshold filtering
-- ==============================================================================
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
        -- Cosine similarity: 1 - cosine distance (<=>)
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE
        (filter_doc_ids IS NULL OR dc.document_id = ANY(filter_doc_ids))
        AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY dc.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_sources ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users in demo mode
CREATE POLICY "Allow public read access to documents"
ON public.documents FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to chunks"
ON public.document_chunks FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to collections"
ON public.collections FOR SELECT
USING (true);

CREATE POLICY "Allow insert for document processing"
ON public.documents FOR ALL
USING (true);

CREATE POLICY "Allow insert for document chunks"
ON public.document_chunks FOR ALL
USING (true);

CREATE POLICY "Allow query logging"
ON public.queries FOR ALL
USING (true);

CREATE POLICY "Allow query sources logging"
ON public.query_sources FOR ALL
USING (true);
