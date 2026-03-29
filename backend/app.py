import json
import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "src" / "data" / "merchantData.json"

# ── Language registry ─────────────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "english",
    "hindi",
    "bengali",
    "tamil",
    "telugu",
    "french",
    "spanish",
}

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VyapaarSathi AI Backend",
    description="Lightweight merchant assistant backend.",
    version="1.0.0",
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
    txns = data.get("transactions", [])
    daily = data.get("dailySales", [])
    inventory = data.get("inventory", [])
    returns = data.get("returns", [])
    feedback = data.get("customerFeedback", [])
    info = data.get("merchantInfo", {})

    total_sales = sum(t["amount"] for t in txns)
    txn_count = len(txns)
    repeat_count = sum(1 for t in txns if t.get("customerType") == "repeat")
    new_count = txn_count - repeat_count
    repeat_pct = round(repeat_count / txn_count * 100) if txn_count else 0

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

    weekly_total = sum(d["sales"] for d in daily)
    weekly_people = sum(d.get("footfall", 0) for d in daily)
    avg_sales = round(weekly_total / len(daily)) if daily else 0
    avg_footfall = round(weekly_people / len(daily)) if daily else 0
    best_day = max(daily, key=lambda d: d["sales"])["day"] if daily else "N/A"

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
        "location": info.get("location", ""),
        "store_type": info.get("type", ""),
        "total_sales": total_sales,
        "txn_count": txn_count,
        "repeat_count": repeat_count,
        "new_count": new_count,
        "repeat_pct": repeat_pct,
        "peak_hour": peak_hour,
        "top_category": top_category,
        "avg_sales": avg_sales,
        "avg_footfall": avg_footfall,
        "best_day": best_day,
        "low_stock": low_stock,
        "top_items": top_items_str,
        "return_summary": return_summary,
        "pos_fb": pos_fb,
        "neg_fb": neg_fb,
    }

STATS: dict[str, Any] = _compute_stats(merchant_data)
logger.info("Stats ready: %s", STATS)

# ── Lightweight response generator ────────────────────────────────────────────
def _generate_base_answer(question: str) -> str:
    q = question.lower()
    s = STATS

    if "how is my business" in q or "business doing" in q or "summary" in q:
        return (
            f"Your business is performing steadily with ₹{s['total_sales']} in sales across "
            f"{s['txn_count']} transactions. Your best-performing category is {s['top_category']}, "
            f"and your busiest time is around {s['peak_hour']}. Focus on repeat customers and "
            f"keeping best-selling products available."
        )

    if "most customers" in q or "peak" in q or "busy" in q:
        return (
            f"You get the most customer activity around {s['peak_hour']}. "
            f"Your best day this week is {s['best_day']}. Consider placing staff and fast-moving "
            f"products around that time to improve service and sales."
        )

    if "improve" in q or "grow" in q or "increase sales" in q:
        return (
            f"To improve sales, focus on your strongest category: {s['top_category']}. "
            f"Also improve areas customers mention often, such as {', '.join(s['neg_fb']) if s['neg_fb'] else 'service speed and stock planning'}. "
            f"Keeping your top items ready and reducing complaints can increase repeat business."
        )

    if "stock" in q or "inventory" in q or "reorder" in q:
        low_stock_text = ", ".join(s["low_stock"]) if s["low_stock"] else "No urgent low-stock items right now."
        return (
            f"You should prioritize stocking your best-selling items: {s['top_items']}. "
            f"Low stock items currently are: {low_stock_text}. "
            f"Restocking these on time can prevent missed sales."
        )

    if "repeat customer" in q or "loyal" in q:
        return (
            f"You have {s['repeat_count']} repeat customers, which is about {s['repeat_pct']}% of your total transactions. "
            f"That is a strong signal of customer loyalty. You can improve this further with offers, better service, and faster checkout."
        )

    return (
        f"Your store is doing best in {s['top_category']} and sees peak activity around {s['peak_hour']}. "
        f"You should keep top-selling products available, monitor customer feedback, and focus on repeat customers to grow consistently."
    )

# ── Translation layer ─────────────────────────────────────────────────────────
def _translate_answer(answer: str, language_key: str) -> str:
    translations = {
        "hindi": (
            "आपका व्यवसाय स्थिर रूप से चल रहा है। "
            "बिक्री, ग्राहकों और स्टॉक के आधार पर आप सही दिशा में हैं। "
            "टॉप प्रोडक्ट्स उपलब्ध रखें, पीक समय पर ध्यान दें और दोबारा आने वाले ग्राहकों को बढ़ाने पर फोकस करें।"
        ),
        "bengali": (
            "আপনার ব্যবসা স্থিতিশীলভাবে চলছে। "
            "বিক্রি, গ্রাহক এবং স্টকের ভিত্তিতে আপনি সঠিক পথে আছেন। "
            "সবচেয়ে বিক্রি হওয়া পণ্য প্রস্তুত রাখুন এবং নিয়মিত গ্রাহকদের ধরে রাখার দিকে নজর দিন।"
        ),
        "tamil": (
            "உங்கள் வியாபாரம் நிலையாக செயல்பட்டு வருகிறது. "
            "விற்பனை, வாடிக்கையாளர்கள் மற்றும் ஸ்டாக்கை பார்த்தால் நீங்கள் நல்ல நிலையில் உள்ளீர்கள். "
            "அதிகம் விற்கப்படும் பொருட்களை தயார் வைத்திருங்கள் மற்றும் மீண்டும் வரும் வாடிக்கையாளர்களில் கவனம் செலுத்துங்கள்."
        ),
        "telugu": (
            "మీ వ్యాపారం స్థిరంగా కొనసాగుతోంది. "
            "అమ్మకాలు, కస్టమర్లు మరియు స్టాక్ ఆధారంగా మీరు మంచి దిశలో ఉన్నారు. "
            "బాగా అమ్ముడయ్యే వస్తువులను సిద్ధంగా ఉంచండి మరియు మళ్లీ వచ్చే కస్టమర్లపై దృష్టి పెట్టండి."
        ),
        "french": (
            "Votre activité fonctionne de manière stable. "
            "Concentrez-vous sur vos produits les plus vendus, vos heures de pointe et la fidélisation des clients."
        ),
        "spanish": (
            "Tu negocio está funcionando de manera estable. "
            "Concéntrate en tus productos más vendidos, las horas pico y la fidelización de clientes."
        ),
    }

    if language_key == "english":
        return answer

    return translations.get(language_key, answer)

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

    base_answer = _generate_base_answer(question)
    final_answer = _translate_answer(base_answer, language_key)
    return AskResponse(answer=final_answer)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "backend": "running",
        "supported_languages": sorted(SUPPORTED_LANGUAGES),
        "ai_mode": "lightweight_local_logic",
    }