"""
market_normalizer.py
Robust 2-tier market identifier for NAMIS:
  Layer 1: Fast offline fuzzy matching (difflib) - 0ms, zero-cost, no network.
  Layer 2: Google Gemini AI API fallback (Free Tier) - handles extreme corruptions/typos.
"""

import os
import re
import difflib
from typing import Optional, Tuple

CANONICAL_MARKETS = {
    "pettah": "Pettah Wholesale Market (Colombo)",
    "peliyagoda": "Peliyagoda Dedicated Economic Center",
    "dambulla": "Dambulla Dedicated Economic Center",
    "kandy": "Kandy Central Market",
    "keppetipola": "Keppetipola Dedicated Economic Center",
    "meegoda": "Meegoda Dedicated Economic Center",
    "norochchole": "Norochchole Dedicated Economic Center",
    "thambuththegama": "Thambuththegama Dedicated Economic Center",
    "nuwara-eliya": "Nuwara Eliya Dedicated Economic Center",
    "bandarawela": "Bandarawela Dedicated Economic Center",
    "veyangoda": "Veyangoda Dedicated Economic Center",
    "manning": "Manning Market (Colombo)",
}

# Common OCR typo aliases observed across 10 years of HARTI PDFs
KNOWN_ALIASES = {
    "petha": "pettah",
    "pettahs": "pettah",
    "akeppetipola": "keppetipola",
    "akappetipola": "keppetipola",
    "kappetipola": "keppetipola",
    "makappetipola": "keppetipola",
    "t'thegama": "thambuththegama",
    "thambuththegam": "thambuththegama",
    "hambuththegam": "thambuththegama",
    "ambuththega": "thambuththegama",
    "norochcholet": "norochchole",
    "norochchole t": "norochchole",
    "norochcholteh": "norochchole",
    "megoda": "meegoda",
    "nuwaraeliya": "nuwara-eliya",
}


def clean_raw_header(raw_header: str) -> str:
    """Strip date patterns (YYYY.MM.DD, DD/MM/YYYY) and metadata words."""
    cleaned = re.sub(r"\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}|\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}", "", raw_header)
    cleaned = re.sub(r"(?i)\bmarket\b|\bcenter\b|\bdec\b", "", cleaned)
    cleaned = re.sub(r"[^a-zA-Z\s\-]", "", cleaned)
    return cleaned.strip().lower()


def match_fuzzy(cleaned_name: str) -> Optional[str]:
    """Layer 1: Fast local fuzzy match using alias table & difflib."""
    if not cleaned_name:
        return None

    # Exact alias check
    if cleaned_name in KNOWN_ALIASES:
        return KNOWN_ALIASES[cleaned_name]

    # Substring check against canonical keys
    for key in CANONICAL_MARKETS:
        if key in cleaned_name or cleaned_name in key:
            return key

    # Levenshtein distance match with high cutoff (70% similarity)
    all_targets = list(CANONICAL_MARKETS.keys()) + list(KNOWN_ALIASES.keys())
    matches = difflib.get_close_matches(cleaned_name, all_targets, n=1, cutoff=0.7)
    if matches:
        matched = matches[0]
        return KNOWN_ALIASES.get(matched, matched)

    return None


def match_with_gemini(raw_text: str, api_key: Optional[str] = None) -> Optional[str]:
    """Layer 2: Fallback to Google Gemini Free Tier API for ambiguous strings."""
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        return None

    try:
        import requests
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
        prompt = f"""
You are an agricultural market data cleaner for Sri Lanka.
Map the following corrupted or OCR-scanned market header string to EXACTLY ONE of the valid canonical market IDs:
{list(CANONICAL_MARKETS.keys())}

If it cannot be mapped to any of these markets, respond with UNKNOWN.
Input string: "{raw_text}"

Respond with ONLY the exact canonical market slug (e.g. pettah, dambulla, peliyagoda) and nothing else.
"""
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=5)
        if res.status_code == 200:
            result = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip().lower()
            if result in CANONICAL_MARKETS:
                return result
    except Exception as e:
        print(f"[Gemini Fallback Error]: {e}")

    return None


def resolve_market(raw_header: str, use_ai: bool = False) -> Tuple[Optional[str], str]:
    """
    Main entry point:
    Returns (canonical_id, method_used).
    Example: resolve_market("2024.11.13 Pettahs Market") -> ("pettah", "fuzzy")
    """
    cleaned = clean_raw_header(raw_header)
    
    # 1. Try local fast fuzzy match
    local_match = match_fuzzy(cleaned)
    if local_match:
        return local_match, "local_fuzzy"

    # 2. Try Gemini AI fallback if enabled
    if use_ai and os.getenv("GEMINI_API_KEY"):
        ai_match = match_with_gemini(raw_header)
        if ai_match:
            return ai_match, "gemini_ai"

    return None, "unmatched"


if __name__ == "__main__":
    # Test cases
    test_inputs = [
        "2024.11.13 Peliyagoda",
        "pettahs",
        "petha",
        "hambuththegam",
        "2021/01/20 dambulla market",
        "akeppetipola",
        "norochcholet",
        "nuwaraeliya",
        "kandymarket",
    ]
    print("Testing Market Normalizer:")
    for inp in test_inputs:
        matched_id, method = resolve_market(inp)
        print(f"  '{inp}' -> '{matched_id}' (via {method})")
