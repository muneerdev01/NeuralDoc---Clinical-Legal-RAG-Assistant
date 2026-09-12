import { DocumentChunk, SourceCitation } from '../../types';
import { cosineSimilarity, generateEmbedding } from './embeddings';

export interface MatchDocumentsOptions {
  queryEmbedding: number[];
  matchCount?: number; // Top-K (default 4)
  filterDocumentIds?: string[];
  similarityThreshold?: number; // default 0.65
}

export interface MatchResult {
  chunk: DocumentChunk;
  similarity: number;
}

class InMemoryVectorStore {
  private chunks: Map<string, DocumentChunk> = new Map();

  constructor() {
    this.chunks = new Map();
  }

  /**
   * Insert or update chunks in the vector store
   */
  public addChunks(chunks: DocumentChunk[]): void {
    for (const chunk of chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        // compute dense embedding if missing
        chunk.embedding = generateEmbeddingSync(chunk.content);
      }
      this.chunks.set(chunk.id, chunk);
    }
  }

  /**
   * Delete chunks associated with a document
   */
  public deleteDocumentChunks(documentId: string): void {
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(id);
      }
    }
  }

  /**
   * Get total indexed chunk count
   */
  public getCount(): number {
    return this.chunks.size;
  }

  /**
   * Get all chunks for a specific document
   */
  public getDocumentChunks(documentId: string): DocumentChunk[] {
    return Array.from(this.chunks.values())
      .filter((c) => c.documentId === documentId)
      .sort((a, b) => a.pageNumber - b.pageNumber || a.chunkIndex - b.chunkIndex);
  }

  /**
   * Emulates the PostgreSQL pgvector function:
   * match_documents(query_embedding, match_count, filter_doc_ids, similarity_threshold)
   */
  public matchDocuments(options: MatchDocumentsOptions): MatchResult[] {
    const {
      queryEmbedding,
      matchCount = 4,
      filterDocumentIds,
      similarityThreshold = 0.65,
    } = options;

    const scoredChunks: MatchResult[] = [];

    for (const chunk of this.chunks.values()) {
      // Apply document ID filter if specified
      if (
        filterDocumentIds &&
        filterDocumentIds.length > 0 &&
        !filterDocumentIds.includes(chunk.documentId)
      ) {
        continue;
      }

      if (!chunk.embedding) continue;

      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

      // Guardrail: Minimum similarity threshold
      if (similarity >= similarityThreshold) {
        scoredChunks.push({
          chunk,
          similarity: Number(similarity.toFixed(4)),
        });
      }
    }

    // Sort descending by similarity score
    scoredChunks.sort((a, b) => b.similarity - a.similarity);

    // Limit to Top-K
    return scoredChunks.slice(0, matchCount);
  }

  /**
   * Convert matched chunks into validated SourceCitations
   */
  public toSourceCitations(matches: MatchResult[]): SourceCitation[] {
    return matches.map((m) => ({
      id: `cite-${m.chunk.id}`,
      documentId: m.chunk.documentId,
      documentTitle: m.chunk.documentTitle,
      category: m.chunk.category,
      page: m.chunk.pageNumber,
      chunkId: m.chunk.id,
      similarity: m.similarity,
      excerpt: m.chunk.content.length > 280
        ? m.chunk.content.substring(0, 277) + '...'
        : m.chunk.content,
      section: m.chunk.section,
    }));
  }
}

// Synchronous fallback helper for immediate embedding
import { generateDenseSemanticEmbedding } from './embeddings';
function generateEmbeddingSync(text: string): number[] {
  return generateDenseSemanticEmbedding(text);
}

export const vectorStore = new InMemoryVectorStore();
