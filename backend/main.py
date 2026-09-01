"""
FastAPI main application.
All heavy initialisation (document store, market provider) happens at startup.
"""

from __future__ import annotations

import logging
import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)

# ── Service imports ────────────────────────────────────────────────────────────
from data_market        import MarketDataProvider
from news_provider      import NewsProvider
from rag_retriever      import get_document_store
from agents_specialists import TechnicalAgent, FundamentalAgent, SentimentAgent
from agents_synthesis   import SynthesisAgent
from profiling_engine   import UserProfileEngine
from metrics_logger     import log_session, get_performance_report

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title    = "PS-01 Multi-Agent Financial Intelligence API",
    version  = "2.0.0",
    description = (
        "Backend API for a multi-agent investment research system. "
        "Powers real-time technical, RAG-grounded fundamental, and FinBERT sentiment agents."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Singleton service instances ───────────────────────────────────────────────
_market   = MarketDataProvider()
_news     = NewsProvider()
_doc_store = None   # lazy — built on first request to avoid cold-start delay
_tech_agent  = TechnicalAgent()
_fund_agent  = FundamentalAgent()
_sent_agent  = SentimentAgent()
_synth_agent = SynthesisAgent()
_profiles    = UserProfileEngine()


def _get_doc_store():
    global _doc_store
    if _doc_store is None:
        _doc_store = get_document_store()
    return _doc_store


# ── Request / Response models ─────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    symbol:       str  = "TCS"
    profile_type: str  = "conservative"
    degraded_mode: bool = False


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "status":  "online",
        "system":  "PS-01 Multi-Agent Autonomous Financial Intelligence System",
        "version": "2.0.0",
        "docs":    "/docs",
    }


@app.get("/api/stocks", tags=["Market"])
def list_stocks():
    """Return lightweight list of all tracked NSE stocks."""
    return _market.list_all_stocks()


@app.get("/api/stock/{symbol}", tags=["Market"])
def get_stock(symbol: str):
    """Return full market data for a single symbol."""
    return _market.get_stock_data(symbol.upper())


@app.get("/api/profiles", tags=["Profile"])
def list_profiles():
    return _profiles.list_profiles()


@app.get("/api/profile", tags=["Profile"])
def get_profile(type: str = Query("conservative", description="conservative | aggressive")):
    return _profiles.get_profile(type)


@app.get("/api/documents", tags=["RAG"])
def list_documents():
    """Return metadata for all documents in the RAG corpus."""
    return _get_doc_store().all_documents_metadata()


@app.get("/api/documents/search", tags=["RAG"])
def search_documents(q: str = Query(..., description="Free-text query"), symbol: str = Query(None)):
    """Retrieve top document chunks matching a query, optionally filtered by symbol."""
    return _get_doc_store().retrieve(query=q, symbol=symbol, top_k=5)


@app.get("/api/performance", tags=["Metrics"])
def performance():
    return get_performance_report()


@app.post("/api/analyze", tags=["Analysis"])
def run_analysis(req: AnalyzeRequest):
    """
    Full multi-agent analysis pipeline:
    1. Fetch live market data (yfinance)
    2. Fetch live news (GNews)
    3. Run Technical Agent  (Groq LLM | rule engine)
    4. Run Fundamental Agent (Groq LLM + RAG | rule engine)
    5. Run Sentiment Agent  (HuggingFace FinBERT | keyword heuristic)
    6. Run Synthesis Agent  (Groq LLM | weighted algorithm)
    7. Apply user profile personalisation
    8. Log session metrics
    """
    symbol = req.symbol.upper()

    # 1. Market data
    market_data = _market.get_stock_data(symbol)

    # 2. News
    news_result = _news.fetch_news(symbol, market_data.get("name", symbol))

    # 3-5. Specialist agents (parallel execution)
    with ThreadPoolExecutor(max_workers=3) as executor:
        f_tech = executor.submit(_tech_agent.analyze, market_data)
        f_fund = executor.submit(_fund_agent.analyze, symbol, market_data)
        f_sent = executor.submit(_sent_agent.analyze, symbol, news_result["articles"])

        tech_result = f_tech.result()
        fund_result = f_fund.result()
        sent_result = f_sent.result()

    # 6. Synthesis + personalisation
    user_profile = _profiles.get_profile(req.profile_type)
    synth_result = _synth_agent.synthesize(
        symbol       = symbol,
        technical    = tech_result,
        fundamental  = fund_result,
        sentiment    = sent_result,
        user_profile = user_profile,
        degraded_mode = req.degraded_mode,
    )

    # 7. Log metrics
    log_session(
        symbol         = symbol,
        classification = synth_result["classification"],
        agent_agreement= synth_result["agent_agreement"],
        total_latency  = synth_result["total_pipeline_latency"],
        citations_count= len(synth_result["sources"]),
        data_quality   = synth_result["data_quality"],
    )

    return {
        "market_data":  market_data,
        "news":         news_result,
        "agents": {
            "technical":   tech_result,
            "fundamental": fund_result,
            "sentiment":   sent_result,
        },
        "synthesis":    synth_result,
        "user_profile": user_profile,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", 8000)), reload=True)
