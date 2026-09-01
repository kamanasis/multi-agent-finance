"""
Synthesis Agent — combines Technical, Fundamental, and Sentiment agent outputs
into a single personalised, explainable intelligence result.

Uses Groq LLM for high-quality natural language synthesis.
Falls back to a deterministic weighted-score algorithm.
"""

from __future__ import annotations

import json
import logging
import os
import time
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE    = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "qwen/qwen3.6-27b"
GROQ_FALLBACK = "groq/compound-mini"
TIMEOUT      = 25

# Signal → numeric weight
_SIGNAL_SCORE: Dict[str, float] = {
    "bullish":            1.0,
    "positive":           1.0,
    "moderately_bullish": 0.6,
    "neutral":            0.0,
    "cautious":           -0.5,
    "caution":            -0.5,
    "bearish":            -1.0,
    "negative":           -1.0,
    "unavailable":        0.0,
}

_CLASSIFICATION_LABELS = ["BULLISH", "MODERATELY BULLISH", "NEUTRAL", "CAUTION", "BEARISH"]


def _groq_chat(system: str, user: str) -> str | None:
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        return None

    def _call(model: str) -> str | None:
        payload: dict = {
            "model":       model,
            "messages":    [{"role": "system", "content": system},
                            {"role": "user",   "content": user}],
            "temperature": 0.15,
            "max_tokens":  1000,
        }
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
            logger.warning(f"Groq synthesis failed [{model}]: {exc}")
            return None

    result = _call(GROQ_MODEL)
    if result is None:
        result = _call(GROQ_FALLBACK)
    return result


def _parse_json(text: str) -> Dict | None:
    import re
    text = text.strip()
    if "```" in text:
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if m:
            text = m.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        return None


# ─── Synthesis Agent ─────────────────────────────────────────────────────────

class SynthesisAgent:

    _SYSTEM = """You are a senior investment intelligence synthesis agent for a retail investor platform.
You receive structured outputs from three specialist agents (Technical, Fundamental, Sentiment)
plus the investor's personal risk profile and portfolio context.

Your job:
1. Evaluate agent agreement / disagreement
2. Weigh evidence quality and confidence
3. Produce a personalised, explainable investment intelligence summary

Return ONLY valid JSON with this exact schema — no prose outside the JSON:
{
  "classification": "BULLISH"|"MODERATELY BULLISH"|"NEUTRAL"|"CAUTION"|"BEARISH",
  "confidence": <float 0-1>,
  "action_recommendation": str,         // e.g. "Consider with stop-loss at 5% below entry"
  "summary": str,                        // 2-3 sentences, plain language
  "key_reasons": [str, ...],             // 3-5 bullet reasons
  "risks": [str, ...],                   // 2-4 risk factors
  "portfolio_impact": str,               // impact on THIS investor's portfolio
  "agent_agreement": str,                // e.g. "2 of 3 agents aligned"
  "conflict_detected": bool,
  "conflict_reason": str,                // empty string if no conflict
  "confidence_impact_note": str,         // explain any confidence adjustment
  "data_quality": "good"|"degraded"|"insufficient"
}

RULES:
- Never fabricate sources or invent financial data.
- Confidence is evidence-strength, NOT probability of profit.
- Personalise action_recommendation and portfolio_impact to the user's risk profile.
- If agents conflict, reduce confidence and explain the tension.
- Keep language professional but accessible for retail investors."""

    def _compute_rule_based(
        self,
        symbol: str,
        technical: Dict,
        fundamental: Dict,
        sentiment: Dict,
        profile: Dict,
        degraded: bool,
    ) -> Dict[str, Any]:
        """Deterministic weighted synthesis — fallback when Groq unavailable."""
        t_sig  = technical.get("signal",  "neutral")
        f_sig  = fundamental.get("signal","neutral")
        s_sig  = sentiment.get("signal",  "neutral")
        t_conf = float(technical.get("confidence",  0.6))
        f_conf = float(fundamental.get("confidence", 0.6))
        s_conf = float(sentiment.get("confidence",  0.6))

        # Weighted average (technical 35%, fundamental 40%, sentiment 25%)
        weighted = (
            _SIGNAL_SCORE.get(t_sig, 0) * t_conf * 0.35 +
            _SIGNAL_SCORE.get(f_sig, 0) * f_conf * 0.40 +
            _SIGNAL_SCORE.get(s_sig, 0) * s_conf * 0.25
        )
        avg_conf = t_conf * 0.35 + f_conf * 0.40 + s_conf * 0.25

        # Map weighted score → classification
        if weighted >= 0.55:
            classification = "BULLISH"
        elif weighted >= 0.20:
            classification = "MODERATELY BULLISH"
        elif weighted <= -0.55:
            classification = "BEARISH"
        elif weighted <= -0.20:
            classification = "CAUTION"
        else:
            classification = "NEUTRAL"

        # Conflict detection
        pos_signals  = {"bullish", "positive", "moderately_bullish"}
        neg_signals  = {"bearish", "negative", "caution", "cautious"}
        all_sigs     = {t_sig, f_sig, s_sig}
        has_conflict = bool(all_sigs & pos_signals) and bool(all_sigs & neg_signals)

        if has_conflict:
            avg_conf = max(0.45, avg_conf - 0.14)
            conflict_reason = (
                f"Technical signal ({t_sig}) and sentiment ({s_sig}) or fundamental ({f_sig}) "
                "are directionally opposed, introducing short-term uncertainty."
            )
        else:
            conflict_reason = ""

        if degraded:
            avg_conf = max(0.40, avg_conf - 0.20)
            classification = f"PARTIAL ANALYSIS — {classification}"
            data_quality = "degraded"
        else:
            data_quality = "good" if f_sig != "neutral" else "degraded"

        # Personalise recommendation
        risk = profile.get("riskTolerance", "moderate").lower()
        tech_exp = profile.get("sectorExposures", {}).get("Technology", 15)
        sector   = profile.get("sector_focus", "")

        if classification in ("BULLISH", "MODERATELY BULLISH"):
            if risk == "conservative" and tech_exp > 20:
                rec = "WATCH — Consider accumulating on dips; current sector concentration is elevated."
            elif risk == "aggressive":
                rec = "CONSIDER — Strong signal alignment supports position initiation."
            else:
                rec = "CONSIDER with defined stop-loss. Monitor weekly for signal change."
        elif classification == "CAUTION":
            rec = "HOLD / REDUCE — Existing positions should be reviewed."
        elif classification == "BEARISH":
            rec = "AVOID — Wait for signal reversal before considering exposure."
        else:
            rec = "NEUTRAL — No actionable signal. Monitor for clearer direction."

        agreement_count = sum([
            _SIGNAL_SCORE.get(t_sig, 0) * _SIGNAL_SCORE.get(f_sig, 0) > 0,
            _SIGNAL_SCORE.get(t_sig, 0) * _SIGNAL_SCORE.get(s_sig, 0) > 0,
            _SIGNAL_SCORE.get(f_sig, 0) * _SIGNAL_SCORE.get(s_sig, 0) > 0,
        ])
        agreement_str = f"{min(agreement_count + 1, 3)} of 3 agents aligned"

        portfolio_impact = (
            f"For a {risk.capitalize()} investor with {tech_exp}% technology sector exposure: "
            f"{'Caution advised — sector limit approached.' if tech_exp > 20 else 'Portfolio capacity available.'}"
        )

        return {
            "classification":       classification,
            "confidence":           round(avg_conf, 3),
            "action_recommendation": rec,
            "summary":              f"{symbol} shows a {classification} signal with {avg_conf:.0%} synthesis confidence based on {agreement_str}.",
            "key_reasons":          [
                f"Technical agent: {t_sig} ({t_conf:.0%} confidence)",
                f"Fundamental RAG: {f_sig} ({f_conf:.0%} confidence, {fundamental.get('sources_count', 0)} sources)",
                f"Sentiment agent: {s_sig} ({s_conf:.0%} confidence, {sentiment.get('headlines_analysed', 0)} headlines)",
            ],
            "risks":                ["Signal conflict risk." if has_conflict else "Market volatility.", "Macro uncertainty."],
            "portfolio_impact":     portfolio_impact,
            "agent_agreement":      agreement_str,
            "conflict_detected":    has_conflict,
            "conflict_reason":      conflict_reason,
            "confidence_impact_note": f"Confidence adjusted due to {'agent conflict (−14%)' if has_conflict else 'standard aggregation'}.",
            "data_quality":         data_quality,
        }

    def synthesize(
        self,
        symbol: str,
        technical: Dict[str, Any],
        fundamental: Dict[str, Any],
        sentiment: Dict[str, Any],
        user_profile: Dict[str, Any],
        degraded_mode: bool = False,
    ) -> Dict[str, Any]:
        t0 = time.time()

        # ── Build user_prompt for Groq ────────────────────────────────────────
        def _sig_block(agent_dict: Dict) -> str:
            return (
                f"  signal: {agent_dict.get('signal')}\n"
                f"  confidence: {agent_dict.get('confidence')}\n"
                f"  findings: {json.dumps(agent_dict.get('findings', []))}\n"
                f"  reasoning_summary: {agent_dict.get('reasoning_summary', '')}"
            )

        user_prompt = (
            f"Symbol: {symbol}\n\n"
            f"TECHNICAL AGENT:\n{_sig_block(technical)}\n\n"
            f"FUNDAMENTAL AGENT:\n{_sig_block(fundamental)}\n"
            f"  sources_count: {fundamental.get('sources_count', 0)}\n\n"
            f"SENTIMENT AGENT:\n{_sig_block(sentiment)}\n"
            f"  headlines_analysed: {sentiment.get('headlines_analysed', 0)}\n\n"
            f"USER PROFILE:\n"
            f"  riskTolerance: {user_profile.get('riskTolerance')}\n"
            f"  investmentHorizon: {user_profile.get('investmentHorizon')}\n"
            f"  sectorExposures: {json.dumps(user_profile.get('sectorExposures', {}))}\n\n"
            f"degraded_mode: {degraded_mode}\n\n"
            "Produce the synthesis JSON."
        )

        llm_raw = _groq_chat(self._SYSTEM, user_prompt)
        parsed  = _parse_json(llm_raw) if llm_raw else None

        if parsed and "classification" in parsed:
            result = parsed
            powered_by = "groq_llm"
        else:
            result = self._compute_rule_based(symbol, technical, fundamental, sentiment, user_profile, degraded_mode)
            powered_by = "rule_engine"

        # ── Build reasoning trace ─────────────────────────────────────────────
        ts = time.strftime("%H:%M:%S")
        trace = [
            {"time": ts, "status": "success", "event": "Market data & SEBI corpus ingested"},
            {"time": ts, "status": "success", "event": f"Technical Agent → {technical.get('signal','?').upper()} ({technical.get('confidence',0):.0%})"},
            {"time": ts, "status": "success", "event": f"Fundamental RAG Agent → {fundamental.get('signal','?').upper()} ({fundamental.get('sources_count',0)} sources grounded)"},
            {"time": ts, "status": "success", "event": f"Sentiment Specialist → {sentiment.get('signal','?').upper()} ({sentiment.get('headlines_analysed',0)} headlines, {sentiment.get('powered_by','?')})"},
        ]
        if result.get("conflict_detected"):
            trace.append({"time": ts, "status": "warning", "event": f"Signal conflict detected — {result.get('conflict_reason', '')}".rstrip()})
        if degraded_mode:
            trace.append({"time": ts, "status": "warning", "event": "Degraded data mode active — confidence reduced, partial analysis only"})
        trace.append({"time": ts, "status": "success", "event": f"Synthesis complete → {result['classification']} ({result['confidence']:.0%}) via {powered_by}"})

        latency = round(time.time() - t0, 3)
        return {
            "symbol":                  symbol,
            "classification":          result["classification"],
            "confidence":              round(float(result.get("confidence", 0.6)), 3),
            "action_recommendation":   result.get("action_recommendation", "Monitor"),
            "summary":                 result.get("summary", ""),
            "key_reasons":             result.get("key_reasons", []),
            "risks":                   result.get("risks", []),
            "portfolio_impact":        result.get("portfolio_impact", ""),
            "agent_agreement":         result.get("agent_agreement", ""),
            "conflict_detected":       bool(result.get("conflict_detected", False)),
            "conflict_reason":         result.get("conflict_reason", ""),
            "confidence_impact_note":  result.get("confidence_impact_note", ""),
            "data_quality":            result.get("data_quality", "degraded" if degraded_mode else "good"),
            "degraded_mode":           degraded_mode,
            "sources":                 fundamental.get("sources", []),
            "reasoning_trace":         trace,
            "powered_by":              powered_by,
            "synthesis_latency_sec":   latency,
            "total_pipeline_latency":  round(
                technical.get("latency_sec", 0) +
                fundamental.get("latency_sec", 0) +
                sentiment.get("latency_sec", 0) +
                latency, 3
            ),
        }
