"""
Specialist Agents — Technical, Fundamental (RAG), Sentiment.

Each agent returns a structured JSON-serialisable dict (the "agent contract").
LLM calls use Groq (free tier). Sentiment uses HuggingFace FinBERT (free).
Both APIs degrade gracefully when keys are absent.
"""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

from rag_retriever import get_document_store, DocumentStore

load_dotenv()
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
HF_TOKEN     = os.getenv("HF_TOKEN", "")

GROQ_BASE    = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "qwen/qwen3.6-27b"                  # available on free Groq tier
GROQ_FALLBACK = "groq/compound-mini"               # secondary fallback
HF_FINBERT   = "https://api-inference.huggingface.co/models/ProsusAI/finbert"
TIMEOUT      = 20


# ─── Shared LLM helpers ───────────────────────────────────────────────────────

def _groq_chat(system: str, user: str, temperature: float = 0.1) -> Optional[str]:
    """Call Groq chat completions. Returns raw text or None on failure.
    Tries GROQ_MODEL first, then GROQ_FALLBACK.
    Qwen reasoning models require thinking:False to produce plain JSON output.
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        logger.info("Groq key not set — skipping LLM call.")
        return None

    def _call(model: str) -> Optional[str]:
        payload: dict = {
            "model":       model,
            "messages":    [{"role": "system", "content": system},
                            {"role": "user",   "content": user}],
            "temperature": temperature,
            "max_tokens":  1000,
        }
        # Qwen3 family supports disabling chain-of-thought for clean JSON
        if "qwen" in model.lower():
            payload["thinking"] = {"type": "disabled"}
        try:
            resp = httpx.post(
                GROQ_BASE,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}",
                         "Content-Type": "application/json"},
                json=payload,
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.warning(f"Groq call failed [{model}]: {exc}")
            return None

    result = _call(GROQ_MODEL)
    if result is None:
        result = _call(GROQ_FALLBACK)
    return result


def _parse_json_block(text: str) -> Optional[Dict]:
    """Extract JSON object from LLM output that may contain markdown fences."""
    text = text.strip()
    # Strip ```json ... ``` fences
    if "```" in text:
        import re
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if m:
            text = m.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        return None


# ─── Technical Agent ─────────────────────────────────────────────────────────

class TechnicalAgent:
    """
    Evaluates price momentum, RSI, MACD, SMA crossovers, and volume.
    Uses Groq LLM to produce concise, structured findings.
    Falls back to rule-based heuristics when LLM is unavailable.
    """

    _SYSTEM = (
        "You are a specialist technical analysis agent for an investment research platform. "
        "Analyse the provided market indicators and return a JSON object ONLY — no prose outside JSON.\n"
        "JSON schema:\n"
        "{\n"
        '  "signal": "bullish"|"moderately_bullish"|"neutral"|"caution"|"bearish",\n'
        '  "confidence": <float 0-1>,\n'
        '  "findings": [{"title": str, "detail": str}, ...],\n'  
        '  "reasoning_summary": str\n'
        "}\n"
        "Base confidence on the strength and agreement of indicators. "
        "Never fabricate data beyond what is provided."
    )

    def _rule_based(self, md: Dict[str, Any]) -> Dict[str, Any]:
        """Deterministic fallback when Groq is unavailable."""
        rsi   = md.get("rsi_14", 50.0)
        price = md.get("price", 0)
        sma50 = md.get("sma_50") or price
        macd  = md.get("macd", {})
        vol_r = md.get("volume_ratio", 1.0)
        chg   = md.get("change_pct", 0.0)

        findings: List[Dict] = []
        score = 0  # range roughly -4 … +4

        # RSI
        if rsi > 65:
            score += 2
            findings.append({"title": "Strong Upward Momentum", "detail": f"RSI {rsi} is above 65, indicating bullish momentum."})
        elif rsi > 55:
            score += 1
            findings.append({"title": "Positive Momentum", "detail": f"RSI {rsi} is above neutral midpoint."})
        elif rsi < 35:
            score -= 2
            findings.append({"title": "Oversold Territory", "detail": f"RSI {rsi} signals potential selling exhaustion."})
        elif rsi < 45:
            score -= 1
            findings.append({"title": "Weakening Momentum", "detail": f"RSI {rsi} is below neutral midpoint."})

        # Price vs SMA-50
        if price > sma50:
            score += 1
            findings.append({"title": "Trading Above 50-Day SMA", "detail": f"Price ₹{price} is above 50-day SMA ₹{sma50}."})
        else:
            score -= 1
            findings.append({"title": "Below 50-Day SMA", "detail": f"Price ₹{price} is below 50-day SMA ₹{sma50}."})

        # MACD histogram
        hist = macd.get("histogram", 0)
        if hist > 0:
            score += 1
            findings.append({"title": "MACD Histogram Positive", "detail": "MACD histogram is positive — bullish crossover momentum."})
        elif hist < 0:
            score -= 1
            findings.append({"title": "MACD Histogram Negative", "detail": "MACD histogram is negative — bearish momentum."})

        # Volume
        if vol_r > 1.4:
            findings.append({"title": "Above-Average Volume", "detail": f"Volume is {vol_r:.1f}× the 20-day average — institutional activity likely."})

        # Map score → signal
        if score >= 3:
            signal, conf = "bullish", 0.84
        elif score >= 1:
            signal, conf = "moderately_bullish", 0.72
        elif score <= -3:
            signal, conf = "bearish", 0.80
        elif score <= -1:
            signal, conf = "caution", 0.68
        else:
            signal, conf = "neutral", 0.60

        return {
            "signal":           signal,
            "confidence":       conf,
            "findings":         findings,
            "reasoning_summary": f"Rule-based: RSI={rsi}, SMA50 {'above' if price > sma50 else 'below'}, MACD hist={hist:+.2f}, vol_ratio={vol_r:.1f}×.",
        }

    def analyze(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        sym = market_data.get("symbol", "UNKNOWN")

        user_prompt = (
            f"Stock: {sym}\n"
            f"Price: {market_data.get('price')}  Change: {market_data.get('change_pct')}%\n"
            f"RSI-14: {market_data.get('rsi_14')}\n"
            f"MACD: value={market_data.get('macd',{}).get('value')}  "
            f"signal={market_data.get('macd',{}).get('signal')}  "
            f"histogram={market_data.get('macd',{}).get('histogram')}\n"
            f"SMA-50: {market_data.get('sma_50')}  SMA-200: {market_data.get('sma_200')}\n"
            f"Volume ratio (vs 20d avg): {market_data.get('volume_ratio',1.0):.2f}×\n"
            f"MA signal: {market_data.get('moving_average_signal')}\n"
            "Analyse the above and return the JSON."
        )

        llm_raw = _groq_chat(self._SYSTEM, user_prompt)
        parsed  = _parse_json_block(llm_raw) if llm_raw else None
        if parsed and "signal" in parsed:
            result = parsed
        else:
            result = self._rule_based(market_data)

        return {
            "agent":         "technical",
            "name":          "Technical Momentum Specialist",
            "signal":        result.get("signal", "neutral"),
            "confidence":    round(float(result.get("confidence", 0.60)), 3),
            "findings":      result.get("findings", []),
            "reasoning_summary": result.get("reasoning_summary", ""),
            "metrics": {
                "rsi_14":       market_data.get("rsi_14"),
                "volume_ratio": market_data.get("volume_ratio"),
                "ma_signal":    market_data.get("moving_average_signal"),
            },
            "powered_by":    "groq_llm" if parsed else "rule_engine",
            "sources_count": 1,
            "latency_sec":   round(time.time() - t0, 3),
            "timestamp":     time.strftime("%H:%M:%S"),
        }


# ─── Fundamental Agent ───────────────────────────────────────────────────────

class FundamentalAgent:
    """
    Retrieves evidence from the RAG document store, then uses Groq LLM to
    produce a grounded fundamental analysis with explicit source citations.
    """

    _SYSTEM = (
        "You are a specialist fundamental analysis agent with access to retrieved financial documents. "
        "Your task is to produce a structured JSON analysis using ONLY the provided evidence — "
        "do not invent facts or create citations not present in the context.\n"
        "JSON schema:\n"
        "{\n"
        '  "signal": "positive"|"neutral"|"cautious"|"negative",\n'
        '  "confidence": <float 0-1>,\n'
        '  "findings": [{"title": str, "detail": str, "citation": str}, ...],\n'
        '  "reasoning_summary": str\n'
        "}\n"
        "If evidence is insufficient, lower confidence and state evidence gap."
    )

    def __init__(self) -> None:
        self._store: DocumentStore = get_document_store()

    def analyze(self, symbol: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        t0 = time.time()
        query = "revenue growth operating margin cash flow debt earnings guidance"

        retrieved = self._store.retrieve(query=query, symbol=symbol, top_k=3)

        if not retrieved:
            # No documents for this symbol — degrade gracefully
            return {
                "agent":         "fundamental",
                "name":          "Fundamental RAG Analyst",
                "signal":        "neutral",
                "confidence":    0.40,
                "findings":      [{"title": "Evidence Gap", "detail": "No SEBI/earnings documents found for this symbol in the corpus.", "citation": ""}],
                "sources":       [],
                "sources_count": 0,
                "reasoning_summary": "Insufficient document evidence. Analysis based on market data only.",
                "powered_by":    "fallback",
                "latency_sec":   round(time.time() - t0, 3),
                "timestamp":     time.strftime("%H:%M:%S"),
            }

        # Build context block for LLM
        context_parts = []
        for i, doc in enumerate(retrieved, 1):
            context_parts.append(
                f"[Source {i}] {doc['title']} (p.{doc['page']}, {doc['date']})\n"
                f"Section: {doc['section']}\n"
                f"Text: {doc['excerpt']}\n"
                f"Citation: {doc['citation']}"
            )
        context_str = "\n\n".join(context_parts)

        user_prompt = (
            f"Stock: {symbol}\n"
            f"P/E Ratio: {market_data.get('pe_ratio', 'N/A')}\n\n"
            f"Retrieved Documents:\n{context_str}\n\n"
            "Based solely on the above documents, produce the fundamental analysis JSON."
        )

        llm_raw = _groq_chat(self._SYSTEM, user_prompt)
        parsed  = _parse_json_block(llm_raw) if llm_raw else None

        if parsed and "signal" in parsed:
            # Inject citations from retrieved docs into findings
            findings = parsed.get("findings", [])
            for i, f in enumerate(findings):
                if i < len(retrieved) and not f.get("citation"):
                    f["citation"] = retrieved[i]["citation"]
            result = parsed
            result["findings"] = findings
        else:
            # Rule-based fallback: summarise retrieved chunk headlines
            findings = [
                {
                    "title":    doc["section"],
                    "detail":   doc["excerpt"][:200] + "…",
                    "citation": doc["citation"],
                }
                for doc in retrieved[:2]
            ]
            pe = market_data.get("pe_ratio")
            signal = "cautious" if (pe and pe > 30) else "positive"
            result = {
                "signal":           signal,
                "confidence":       0.72,
                "findings":         findings,
                "reasoning_summary": "Rule-based: derived from RAG document summaries.",
            }

        return {
            "agent":             "fundamental",
            "name":              "Fundamental RAG Analyst",
            "signal":            result.get("signal", "neutral"),
            "confidence":        round(float(result.get("confidence", 0.60)), 3),
            "findings":          result.get("findings", []),
            "sources":           retrieved,
            "sources_count":     len(retrieved),
            "reasoning_summary": result.get("reasoning_summary", ""),
            "powered_by":        "groq_llm" if parsed else "rule_engine",
            "latency_sec":       round(time.time() - t0, 3),
            "timestamp":         time.strftime("%H:%M:%S"),
        }


# ─── Sentiment Agent ─────────────────────────────────────────────────────────

class SentimentAgent:
    """
    Classifies news sentiment using HuggingFace FinBERT (ProsusAI/finbert).
    Falls back to keyword heuristics when HF token is absent.
    """

    def _hf_classify(self, texts: List[str]) -> Optional[List[Dict]]:
        """Returns list of {"label": str, "score": float} or None."""
        if not HF_TOKEN or HF_TOKEN == "your_huggingface_token_here":
            return None
        try:
            resp = httpx.post(
                HF_FINBERT,
                headers={"Authorization": f"Bearer {HF_TOKEN}"},
                json={"inputs": texts[:5]},   # FinBERT handles short texts best
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
            # FinBERT returns [[{label, score}, ...], ...] — one list per input
            if isinstance(data, list) and data and isinstance(data[0], list):
                # Pick highest-score label per input
                return [max(item, key=lambda x: x["score"]) for item in data]
            return None
        except Exception as exc:
            logger.warning(f"HuggingFace FinBERT call failed: {exc}")
            return None

    def _keyword_heuristic(self, headlines: List[str]) -> Dict[str, Any]:
        """Very simple keyword-based sentiment as last-resort fallback."""
        positive_kw = ["growth", "profit", "beat", "strong", "surges", "upgrade", "positive", "gains", "record"]
        negative_kw = ["loss", "miss", "weak", "falls", "downgrade", "warning", "decline", "drops", "layoff"]
        pos = neg = 0
        for h in headlines:
            h_lower = h.lower()
            pos += sum(1 for w in positive_kw if w in h_lower)
            neg += sum(1 for w in negative_kw if w in h_lower)
        if pos > neg + 1:
            return {"signal": "bullish",  "confidence": 0.65}
        if neg > pos + 1:
            return {"signal": "bearish",  "confidence": 0.62}
        return     {"signal": "neutral",  "confidence": 0.55}

    def analyze(self, symbol: str, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        t0 = time.time()
        headlines = [a["title"] for a in articles if a.get("title")]

        findings: List[Dict] = []
        powered_by = "finbert_hf"

        if headlines:
            hf_results = self._hf_classify(headlines)
            if hf_results:
                # Aggregate FinBERT labels
                label_map = {"positive": 1, "negative": -1, "neutral": 0}
                scores    = [label_map.get(r["label"].lower(), 0) * r["score"] for r in hf_results]
                agg_score = sum(scores) / len(scores) if scores else 0.0
                raw_conf  = float(sum(r["score"] for r in hf_results) / len(hf_results))

                if agg_score > 0.15:
                    signal, conf = "bullish", min(raw_conf, 0.90)
                elif agg_score < -0.15:
                    signal, conf = "bearish", min(raw_conf, 0.87)
                else:
                    signal, conf = "neutral", min(raw_conf, 0.75)

                findings = [
                    {"title": "FinBERT Sentiment Analysis",
                     "detail": f"Classified {len(headlines)} headlines. Aggregate sentiment score: {agg_score:+.3f}."},
                ]
                for i, (h, r) in enumerate(zip(headlines[:3], hf_results[:3])):
                    findings.append({"title": f"Headline {i+1}", "detail": f"{h} → {r['label']} ({r['score']:.0%})"})
            else:
                powered_by = "keyword_heuristic"
                heuristic  = self._keyword_heuristic(headlines)
                signal, conf = heuristic["signal"], heuristic["confidence"]
                findings = [
                    {"title": "News Sentiment (Keyword Heuristic)", "detail": f"Analysed {len(headlines)} headlines via keyword scoring."},
                    {"title": "Top Headlines",
                     "detail": "; ".join(headlines[:3])},
                ]
        else:
            signal, conf, powered_by = "neutral", 0.45, "no_data"
            findings = [{"title": "No News Found", "detail": "No recent news articles retrieved for this symbol."}]

        return {
            "agent":             "sentiment",
            "name":              "Sentiment & News Specialist",
            "signal":            signal,
            "confidence":        round(conf, 3),
            "findings":          findings,
            "headlines_analysed": len(headlines),
            "articles":          articles[:5],
            "powered_by":        powered_by,
            "sources_count":     len(articles),
            "latency_sec":       round(time.time() - t0, 3),
            "timestamp":         time.strftime("%H:%M:%S"),
        }
