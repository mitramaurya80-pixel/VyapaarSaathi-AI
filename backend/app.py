"""
VyapaarSathi AI Backend  –  v0.4.0
Uses a local Ollama model (mannix/llama3.1-8b-abliterated) for inference.
No API key required — just `ollama serve` running on the same machine.
"""

import json
import logging
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).resolve().parent
DATA_PATH    = BASE_DIR.parent / "src" / "data" / "merchantData.json"

OLLAMA_URL   = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "mannix/llama3.1-8b-abliterated"

# ── Language registry ─────────────────────────────────────────────────────────
LANGUAGE_INSTRUCTIONS: dict[str, str] = {
    "english": "Respond in clear, concise English.",
    "hindi":   "Respond entirely in Hindi using Devanagari script. Do not use English words.",
    "bengali": "Respond entirely in Bengali using Bengali script. Do not use English words.",
    "tamil":   "Respond entirely in Tamil using Tamil script. Do not use English words.",
    "telugu":  "Respond entirely in Telugu using Telugu script. Do not use English words.",
    "french":  "Respond in clear, concise French.",
    "spanish": "Respond in clear, concise Spanish.",
}

SUPPORTED_LANGUAGES: set[str] = set(LANGUAGE_INSTRUCTIONS.keys())

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VyapaarSathi AI Backend",
    description="Local-LLM merchant assistant via Ollama.",
    version="0.4.0",
)


# ── Schemas ───────────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str
    language: str = "English"

class AskResponse(BaseModel):
    answer: str


# ── Merchant data ─────────────────────────────────────────────────────────────
def _load_merchant_data() -> dict[str, Any]:
    try:
        with DATA_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError as exc:
        raise RuntimeError(f"Merchant data not found at {DATA_PATH}") from exc

merchant_data: dict[str, Any] = _load_merchant_data()


# ── Pre-computed stats ────────────────────────────────────────────────────────
def _compute_stats(data: dict[str, Any]) -> dict[str, Any]:
    txns      = data.get("transactions", [])
    daily     = data.get("dailySales",   [])
    inventory = data.get("inventory",    [])
    returns   = data.get("returns",      [])
    feedback  = data.get("customerFeedback", [])
    info      = data.get("merchantInfo", {})

    total_sales  = sum(t["amount"] for t in txns)
    txn_count    = len(txns)
    repeat_count = sum(1 for t in txns if t.get("customerType") == "repeat")
    new_count    = txn_count - repeat_count
    repeat_pct   = round(repeat_count / txn_count * 100) if txn_count else 0

    hour_counts: dict[str, int] = {}
    for t in txns:
        h = t["time"].split(":")[0]
        hour_counts[h] = hour_counts.get(h, 0) + 1
    peak_hour = (max(hour_counts, key=hour_counts.get) + ":00") if hour_counts else "N/A"

    cat_revenue: dict[str, int] = {}
    for t in txns:
        c = t.get("category", "Unknown")
        cat_revenue[c] = cat_revenue.get(c, 0) + t["amount"]
    top_category = max(cat_revenue, key=cat_revenue.get) if cat_revenue else "N/A"

    weekly_total  = sum(d["sales"] for d in daily)
    weekly_people = sum(d.get("footfall", 0) for d in daily)
    avg_sales     = round(weekly_total  / len(daily)) if daily else 0
    avg_footfall  = round(weekly_people / len(daily)) if daily else 0
    best_day      = max(daily, key=lambda d: d["sales"])["day"] if daily else "N/A"

    low_stock = [
        f"{i['item']} (have {i['stock']}, reorder at {i['reorderLevel']})"
        for i in inventory if i["stock"] < i["reorderLevel"]
    ]
    top_items = sorted(inventory, key=lambda i: i["unitsSoldThisWeek"], reverse=True)[:3]
    top_items_str = ", ".join(
        f"{i['item']} ({i['unitsSoldThisWeek']} units)" for i in top_items
    )
    return_summary = "; ".join(
        f"{r['item']}: {r['count']} ({r['reason']})" for r in returns
    ) or "None"

    pos_fb = [f["theme"] for f in feedback if f["sentiment"] == "positive"]
    neg_fb = [f["theme"] for f in feedback if f["sentiment"] == "negative"]

    return {
        "merchant_name": info.get("name", "Your Store"),
        "location":      info.get("location", ""),
        "store_type":    info.get("type", ""),
        "total_sales":   total_sales,
        "txn_count":     txn_count,
        "repeat_count":  repeat_count,
        "new_count":     new_count,
        "repeat_pct":    repeat_pct,
        "peak_hour":     peak_hour,
        "top_category":  top_category,
        "avg_sales":     avg_sales,
        "avg_footfall":  avg_footfall,
        "best_day":      best_day,
        "low_stock":     low_stock,
        "top_items":     top_items_str,
        "return_summary": return_summary,
        "pos_fb":        pos_fb,
        "neg_fb":        neg_fb,
    }


STATS: dict[str, Any] = _compute_stats(merchant_data)
logger.info("Stats ready: %s", STATS)


# ── Prompt builder ────────────────────────────────────────────────────────────
def _build_system_prompt(language_key: str) -> str:
    s    = STATS
    lang = LANGUAGE_INSTRUCTIONS.get(language_key, LANGUAGE_INSTRUCTIONS["english"])

    low_stock_lines = (
        "\n".join(f"  - {item}" for item in s["low_stock"])
        if s["low_stock"] else "  - None"
    )

    return f"""You are VyapaarSathi, a friendly AI business advisor for small Indian shop owners.
{lang}
Keep answers to 3-5 sentences. Use the Rupee symbol for amounts. Be warm and practical.

=== STORE DATA ===
Store      : {s['merchant_name']} | {s['store_type']} | {s['location']}
Sales today: Rs.{s['total_sales']} across {s['txn_count']} transactions
Customers  : {s['new_count']} new + {s['repeat_count']} repeat ({s['repeat_pct']}% loyal)
Peak hour  : {s['peak_hour']} | Best day: {s['best_day']}
Top earner : {s['top_category']} category
Best sellers: {s['top_items']}
Daily avg  : Rs.{s['avg_sales']} sales | {s['avg_footfall']} customers
Low stock  :
{low_stock_lines}
Returns    : {s['return_summary']}
Praise     : {', '.join(s['pos_fb']) or 'None'}
Complaints : {', '.join(s['neg_fb']) or 'None'}
=================
Only use the data above. Never invent numbers."""


# ── Ollama call ───────────────────────────────────────────────────────────────
async def _ask_ollama(system: str, question: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "options": {
            "temperature": 0.3,      # lower = more factual, less hallucination
            "num_predict": 300,
            "top_p": 0.9,
            "repeat_penalty": 1.15,
        },
        "messages": [
            {"role": "system",  "content": system},
            {"role": "user",    "content": question},
        ],
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(OLLAMA_URL, json=payload)
            resp.raise_for_status()
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Cannot reach Ollama. Is `ollama serve` running on port 11434?",
            )
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Ollama returned {exc.response.status_code}: {exc.response.text}",
            )

    data = resp.json()
    return data["message"]["content"].strip()


# ── Endpoint ──────────────────────────────────────────────────────────────────
@app.post("/api/ask", response_model=AskResponse)
async def ask_ai(request: AskRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    language_key = request.language.strip().lower()
    if language_key not in SUPPORTED_LANGUAGES:
        logger.warning("Unknown language '%s' — falling back to English.", language_key)
        language_key = "english"

    system = _build_system_prompt(language_key)
    answer = await _ask_ollama(system, question)
    return AskResponse(answer=answer)


# ── Health / model check ──────────────────────────────────────────────────────
@app.get("/health")
async def health():
    """Ping Ollama to confirm the model is loaded."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get("http://localhost:11434/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
        loaded = OLLAMA_MODEL in models
    except Exception:
        models, loaded = [], False

    return {
        "status":              "ok" if loaded else "model_not_found",
        "ollama_model":        OLLAMA_MODEL,
        "model_loaded":        loaded,
        "available_models":    models,
        "supported_languages": sorted(SUPPORTED_LANGUAGES),
    }