import re
from typing import List, Dict, Any, Tuple

DEFAULT_SEPARATORS = [
    "\n\nSECTION ",
    "\n\nARTICLE ",
    "\n\n",
    "\n",
    ". ",
    "; ",
    " ",
    ""
]

def recursive_text_chunk(
    text: str,
    page_number: int,
    document_id: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 150,
    start_index: int = 0
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Recursively splits text into chunks while preserving page boundaries and metadata.
    """
    raw_chunks = _split_recursively(text, chunk_size, chunk_overlap, DEFAULT_SEPARATORS)
    chunks = []
    current_idx = start_index

    for chunk_text in raw_chunks:
        trimmed = chunk_text.strip()
        if not trimmed:
            continue

        first_line = trimmed.split("\n")[0][:60]
        section = first_line if any(k in first_line.upper() for k in ["SECTION", "ARTICLE", "DIAGNOSIS", "PROCEDURE", "MEDICATION"]) else f"Page {page_number}"

        chunks.append({
            "id": f"{document_id}-p{page_number}-c{current_idx}",
            "document_id": document_id,
            "content": trimmed,
            "page_number": page_number,
            "chunk_index": current_idx,
            "section": section,
            "token_count": len(trimmed) // 4 + 1
        })
        current_idx += 1

    return chunks, current_idx

def _split_recursively(text: str, chunk_size: int, chunk_overlap: int, separators: List[str]) -> List[str]:
    final_chunks = []
    separator = separators[-1]
    new_separators = []

    for i, sep in enumerate(separators):
        if sep == "" or sep in text:
            separator = sep
            new_separators = separators[i + 1:]
            break

    splits = list(text) if separator == "" else text.split(separator)
    current_doc = []
    current_len = 0

    for piece in splits:
        piece_len = len(piece)
        if current_len + piece_len + (len(separator) if current_doc else 0) > chunk_size:
            if current_doc:
                doc = separator.join(current_doc)
                if len(doc) > chunk_size and new_separators:
                    sub = _split_recursively(doc, chunk_size, chunk_overlap, new_separators)
                    final_chunks.extend(sub)
                else:
                    final_chunks.append(doc)

                while current_len > chunk_overlap and current_doc:
                    removed = current_doc.pop(0)
                    current_len -= len(removed) + (len(separator) if current_doc else 0)

        current_doc.append(piece)
        current_len += piece_len + (len(separator) if len(current_doc) > 1 else 0)

    if current_doc:
        doc = separator.join(current_doc)
        if len(doc) > chunk_size and new_separators:
            sub = _split_recursively(doc, chunk_size, chunk_overlap, new_separators)
            final_chunks.extend(sub)
        else:
            final_chunks.append(doc)

    return final_chunks
