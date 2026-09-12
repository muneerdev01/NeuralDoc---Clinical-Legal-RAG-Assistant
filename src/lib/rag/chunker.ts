import { DocumentCategory, DocumentChunk } from '../../types';

export interface ChunkingOptions {
  chunkSize?: number; // target character/token length (e.g. 800 - 1200)
  chunkOverlap?: number; // overlap between chunks (e.g. 100 - 200)
  separators?: string[];
}

const DEFAULT_SEPARATORS = [
  '\n\nSECTION ',
  '\n\nARTICLE ',
  '\n\n',
  '\n',
  '. ',
  '; ',
  ' ',
  '',
];

/**
 * Recursive character/token text splitter.
 * Preserves page boundaries and section context wherever possible.
 */
export function recursiveTextChunk(
  text: string,
  pageNumber: number,
  documentId: string,
  documentTitle: string,
  category: DocumentCategory,
  startIndex: number = 0,
  options: ChunkingOptions = {}
): { chunks: DocumentChunk[]; nextIndex: number } {
  const chunkSize = options.chunkSize || 1000;
  const chunkOverlap = options.chunkOverlap || 150;
  const separators = options.separators || DEFAULT_SEPARATORS;

  const rawSplits = splitTextRecursively(text, chunkSize, chunkOverlap, separators);
  const chunks: DocumentChunk[] = [];
  let currentIndex = startIndex;

  for (const rawContent of rawSplits) {
    const trimmed = rawContent.trim();
    if (!trimmed) continue;

    // Detect section header if present
    const firstLine = trimmed.split('\n')[0].substring(0, 60);
    const section = firstLine.length > 5 && (firstLine.includes('SECTION') || firstLine.includes('PAGE') || firstLine.includes('DIAGNOSIS') || firstLine.includes('PROCEDURE') || firstLine.includes('MEDICATION') || firstLine.includes('TERMS'))
      ? firstLine
      : `Page ${pageNumber} - Part ${currentIndex + 1}`;

    const approxTokens = Math.ceil(trimmed.length / 4);

    chunks.push({
      id: `${documentId}-p${pageNumber}-c${currentIndex}`,
      documentId,
      documentTitle,
      category,
      content: trimmed,
      pageNumber,
      chunkIndex: currentIndex,
      section,
      tokenCount: approxTokens,
      createdAt: new Date().toISOString(),
    });

    currentIndex++;
  }

  return { chunks, nextIndex: currentIndex };
}

function splitTextRecursively(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separators: string[]
): string[] {
  const finalChunks: string[] = [];

  // Find the highest-priority separator present in text
  let separator = separators[separators.length - 1];
  let newSeparators: string[] = [];

  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === '' || text.includes(sep)) {
      separator = sep;
      newSeparators = separators.slice(i + 1);
      break;
    }
  }

  const splits = separator === '' ? text.split('') : text.split(separator);
  let currentDoc: string[] = [];
  let currentLen = 0;

  for (const piece of splits) {
    const pieceLen = piece.length;
    if (currentLen + pieceLen + (currentDoc.length > 0 ? separator.length : 0) > chunkSize) {
      if (currentDoc.length > 0) {
        const doc = currentDoc.join(separator);
        if (doc.length > chunkSize && newSeparators.length > 0) {
          // Recurse with finer separator
          const subChunks = splitTextRecursively(doc, chunkSize, chunkOverlap, newSeparators);
          finalChunks.push(...subChunks);
        } else {
          finalChunks.push(doc);
        }

        // Apply overlap from end of current doc
        while (currentLen > chunkOverlap && currentDoc.length > 0) {
          const removed = currentDoc.shift()!;
          currentLen -= removed.length + (currentDoc.length > 0 ? separator.length : 0);
        }
      }
    }

    currentDoc.push(piece);
    currentLen += pieceLen + (currentDoc.length > 1 ? separator.length : 0);
  }

  if (currentDoc.length > 0) {
    const doc = currentDoc.join(separator);
    if (doc.length > chunkSize && newSeparators.length > 0) {
      const subChunks = splitTextRecursively(doc, chunkSize, chunkOverlap, newSeparators);
      finalChunks.push(...subChunks);
    } else {
      finalChunks.push(doc);
    }
  }

  return finalChunks;
}
