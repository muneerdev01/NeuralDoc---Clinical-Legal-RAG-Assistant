import re
from typing import List, Dict, Any, Tuple

EXACT_FALLBACK_STRING = "Information not available in document."

DISCLAIMER_TEXT = "NeuralDoc is a document-grounded AI demonstration. It does not provide medical diagnosis or legal advice. Always verify important information against the original document and consult a qualified professional."

SUSPICIOUS_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+system\s+prompt",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"jailbreak",
    r"override\s+guardrails",
    r"act\s+as\s+a\s+licensed\s+(physician|lawyer|doctor)"
]

def sanitize_query(query: str) -> Tuple[str, bool]:
    is_suspicious = False
    clean = query.strip()
    for pat in SUSPICIOUS_PATTERNS:
        if re.search(pat, clean, re.IGNORECASE):
            is_suspicious = True
            clean = re.sub(pat, "[REDACTED]", clean, flags=re.IGNORECASE)
    return clean, is_suspicious

def check_confidence_threshold(matches: List[Dict[str, Any]], threshold: float = 0.65) -> bool:
    if not matches:
        return False
    return any(m.get("similarity", 0.0) >= threshold for m in matches)

def validate_citations(citations: List[Dict[str, Any]], valid_chunk_ids: set) -> List[Dict[str, Any]]:
    return [c for c in citations if c.get("chunk_id") in valid_chunk_ids and c.get("page", 0) > 0]
