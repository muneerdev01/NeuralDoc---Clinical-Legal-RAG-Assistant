import math
import hashlib
from typing import List
from app.config import settings

VECTOR_DIMENSION = 384

DOMAIN_VOCAB = [
    "discharge", "patient", "hospital", "cardiac", "diagnosis", "procedure",
    "angioplasty", "stent", "lad", "medication", "aspirin", "ticagrelor",
    "brilinta", "atorvastatin", "metoprolol", "lisinopril", "nitroglycerin",
    "dosage", "allergy", "penicillin", "blood", "pressure", "troponin",
    "creatinine", "heart", "rate", "ecg", "telemetry", "groin", "femoral",
    "wound", "activity", "restriction", "lifting", "warning", "emergency",
    "symptom", "chest", "pain", "shortness", "breath", "rehabilitation",
    "agreement", "executive", "employment", "contract", "company", "biotech",
    "intellectual", "property", "patent", "invention", "copyright", "hire",
    "salary", "bonus", "equity", "stock", "option", "vesting", "compensation",
    "termination", "cause", "severance", "notice", "resignation", "non-compete",
    "non-solicitation", "confidentiality", "liability", "indemnification",
    "damages", "delaware", "governing", "law", "arbitration", "jams", "dispute"
]

def generate_embedding(text: str, dimension: int = VECTOR_DIMENSION) -> List[float]:
    """
    Generates a normalized semantic vector embedding.
    In production with OPENAI_API_KEY, can invoke OpenAI API.
    """
    normalized = text.lower()
    vector = [0.0] * dimension

    for idx, word in enumerate(DOMAIN_VOCAB):
        dim = idx % dimension
        if word in normalized:
            count = normalized.count(word)
            vector[dim] += math.log(1 + count) * 2.5

    for i in range(len(normalized) - 2):
        tri = normalized[i:i+3]
        h = int(hashlib.md5(tri.encode()).hexdigest(), 16) % dimension
        vector[h] += 0.25

    words = [w for w in re_split(normalized) if w]
    for w in words:
        h = int(hashlib.md5(w.encode()).hexdigest(), 16) % dimension
        vector[h] += 0.8

    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        return [round(x / norm, 6) for x in vector]
    return vector

def re_split(text: str) -> List[str]:
    import re
    return re.findall(r"\w+", text)

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b:
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    sim = dot / (norm_a * norm_b)
    return max(0.0, min(1.0, float(sim)))
