export type DocumentCategory = 'clinical' | 'legal' | 'general';

export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'ready'
  | 'failed';

export interface DocumentMetadata {
  id: string;
  title: string;
  filename: string;
  category: DocumentCategory;
  author?: string;
  fileSize: number;
  pageCount: number;
  processingStatus: ProcessingStatus;
  processingProgress?: number; // 0-100
  processingStep?: string;
  chunkCount: number;
  uploadedAt: string;
  updatedAt: string;
  rawText?: string;
  summary?: string;
  collectionId?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  category: DocumentCategory;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  section?: string;
  embedding?: number[];
  tokenCount: number;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  createdAt: string;
}

export interface SourceCitation {
  id: string;
  documentId: string;
  documentTitle: string;
  category: DocumentCategory;
  page: number;
  chunkId: string;
  similarity: number;
  excerpt: string;
  section?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: SourceCitation[];
  isGrounded?: boolean;
  latencyMs?: number;
  category?: DocumentCategory;
  isDemo?: boolean;
  debugInfo?: {
    query: string;
    topK: number;
    threshold: number;
    retrievedCount: number;
    rawScores: number[];
    executionTimeMs: number;
  };
}

export interface RAGSettings {
  topK: number;
  similarityThreshold: number;
  chunkSize: number;
  chunkOverlap: number;
  embeddingProvider: 'demo' | 'openai' | 'huggingface';
  embeddingModel: string;
  llmProvider: 'demo' | 'gemini' | 'openai';
  llmModel: string;
  debugMode: boolean;
  clinicalGuardrailsEnabled: boolean;
}

export interface QueryLog {
  id: string;
  userQuestion: string;
  answer: string;
  createdAt: string;
  latencyMs: number;
  documentCount: number;
  sourcesCount: number;
  grounded: boolean;
  category?: DocumentCategory;
}

export interface RAGQueryResult {
  answer: string;
  grounded: boolean;
  sources: SourceCitation[];
  latencyMs: number;
  debugInfo?: {
    query: string;
    topK: number;
    threshold: number;
    retrievedCount: number;
    rawScores: number[];
    executionTimeMs: number;
  };
}
