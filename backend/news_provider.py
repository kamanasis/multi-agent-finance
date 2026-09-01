"""
Financial News Provider — multi-source with automatic fallback chain.

Priority order:
  1. yfinance .news  (free, no key, already installed — Yahoo Finance)
  2. Finnhub         (free tier: 60 req/min, financial-specific, optional)
  3. GNews           (free tier: 100 req/day, generic, optional)
  4. Static fallback (always works, labelled as illustrative)
"""

import logging
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

FINNHUB_KEY  = os.getenv("FINNHUB_KEY",    "")
GNEWS_KEY    = os.getenv("GNEWS_API_KEY",  "")
TIMEOUT_SEC  = 8

try:
    import yfinance as yf
    YFINANCE_OK = True
except ImportError:
    YFINANCE_OK = False


# ─── Normalised article schema ────────────────────────────────────────────────

def _make_article(title: str, description: str, source: str,
                  url: str = "", published_at: str = "", is_fallback: bool = False) -> Dict[str, Any]:
    return {
        "title":       title,
        "description": description,
        "source":      source,
        "url":         url,
        "publishedAt": published_at,
        "is_fallback": is_fallback,
    }


# ─── Source 1: yfinance (Yahoo Finance) ──────────────────────────────────────

def _fetch_yfinance(symbol: str, company_name: str) -> Optional[List[Dict]]:
    """
    Uses yfinance Ticker.news — no API key, no rate limit.
    Returns Yahoo Finance news articles for the given NSE symbol.
    """
    if not YFINANCE_OK:
        return None
    try:
        yf_symbol = symbol + ".NS"
        ticker = yf.Ticker(yf_symbol)
        raw_news = ticker.news or []          # list of dicts from Yahoo Finance

        if not raw_news:
            # Try without .NS suffix (some symbols work both ways)
            ticker = yf.Ticker(symbol)
            raw_news = ticker.news or []

        if not raw_news:
            return None

        articles = []
        for item in raw_news[:8]:
            content = item.get("content", {})
            # yfinance >= 0.2.38 wraps everything in a "content" dict
            if isinstance(content, dict):
                title       = content.get("title", item.get("title", ""))
                description = content.get("summary", content.get("description", ""))
                url         = content.get("canonicalUrl", {}).get("url", "") if isinstance(content.get("canonicalUrl"), dict) else content.get("clickThroughUrl", {}).get("url", "")
                provider    = content.get("provider", {}).get("displayName", "") if isinstance(content.get("provider"), dict) else ""
                pub_ts      = content.get("pubDate", "")
            else:
                # Older yfinance format
                title       = item.get("title", "")
                description = item.get("summary", "")
                url         = item.get("link", "")
                provider    = item.get("publisher", "Yahoo Finance")
                pub_ts_raw  = item.get("providerPublishTime", 0)
                pub_ts      = datetime.fromtimestamp(pub_ts_raw, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if pub_ts_raw else ""

            if not title:
                continue

            articles.append(_make_article(
                title       = title,
                description = description,
                source      = provider or "Yahoo Finance",
                url         = url,
                published_at= pub_ts,
            ))

        return articles or None
    except Exception as exc:
        logger.warning(f"yfinance news fetch failed [{symbol}]: {exc}")
        return None


# ─── Source 2: Finnhub ───────────────────────────────────────────────────────

def _fetch_finnhub(symbol: str) -> Optional[List[Dict]]:
    """
    Finnhub /company-news endpoint — financial-grade, includes sentiment scores.
    Free tier: 60 calls/min.  Sign up at https://finnhub.io (no credit card).
    """
    if not FINNHUB_KEY or FINNHUB_KEY == "your_finnhub_key_here":
        return None
    try:
        today      = time.strftime("%Y-%m-%d")
        from_date  = time.strftime("%Y-%m-%d", time.gmtime(time.time() - 7 * 86400))  # 7 days back
        resp = httpx.get(
            "https://finnhub.io/api/v1/company-news",
            params={"symbol": symbol, "from": from_date, "to": today, "token": FINNHUB_KEY},
            timeout=TIMEOUT_SEC,
        )
        resp.raise_for_status()
        raw = resp.json()
        if not raw:
            return None
        articles = [
            _make_article(
                title       = item.get("headline", ""),
                description = item.get("summary", ""),
                source      = item.get("source", "Finnhub"),
                url         = item.get("url", ""),
                published_at= datetime.fromtimestamp(item["datetime"], tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if item.get("datetime") else "",
            )
            for item in raw[:8] if item.get("headline")
        ]
        return articles or None
    except Exception as exc:
        logger.warning(f"Finnhub fetch failed [{symbol}]: {exc}")
        return None


# ─── Source 3: GNews ─────────────────────────────────────────────────────────

def _fetch_gnews(symbol: str, company_name: str) -> Optional[List[Dict]]:
    if not GNEWS_KEY or GNEWS_KEY == "your_gnews_api_key_here":
        return None
    try:
        resp = httpx.get(
            "https://gnews.io/api/v4/search",
            params={"q": f"{company_name} NSE India", "lang": "en",
                    "country": "in", "max": 6, "sortby": "publishedAt",
                    "token": GNEWS_KEY},
            timeout=TIMEOUT_SEC,
        )
        resp.raise_for_status()
        raw = resp.json().get("articles", [])
        articles = [
            _make_article(
                title       = a.get("title", ""),
                description = a.get("description", ""),
                source      = a.get("source", {}).get("name", "GNews"),
                url         = a.get("url", ""),
                published_at= a.get("publishedAt", ""),
            )
            for a in raw if a.get("title")
        ]
        return articles or None
    except Exception as exc:
        logger.warning(f"GNews fetch failed [{symbol}]: {exc}")
        return None


# ─── Source 4: Static fallback ────────────────────────────────────────────────

_FALLBACK_TEMPLATES = [
    "{name} continues to navigate evolving market dynamics in its core operating segments.",
    "Institutional investors maintain monitoring positions in {name} amid broader sector trends.",
    "{name} management focuses on capital efficiency and long-term value creation.",
]

def _static_fallback(company_name: str) -> List[Dict]:
    return [
        _make_article(
            title       = t.format(name=company_name),
            description = "",
            source      = "Market Intelligence Desk",
            is_fallback = True,
        )
        for t in _FALLBACK_TEMPLATES
    ]


# ─── Main Provider ────────────────────────────────────────────────────────────

class NewsProvider:
    """
    Waterfall news fetcher: yfinance → Finnhub → GNews → static fallback.
    Returns a standardised response dict every time.
    """

    def fetch_news(self, symbol: str, company_name: str, max_articles: int = 6) -> Dict[str, Any]:
        """
        Returns:
          {
            "articles": [...],
            "source":   "yfinance" | "finnhub" | "gnews" | "fallback",
            "symbol":   str,
            "total":    int,
          }
        """
        # 1. Finnhub — financial-grade, prioritized if key is present
        articles = _fetch_finnhub(symbol)
        if articles:
            logger.info(f"[{symbol}] News source: finnhub ({len(articles)} articles)")
            return {"articles": articles[:max_articles], "source": "finnhub",
                    "symbol": symbol, "total": len(articles)}

        # 2. yfinance (Yahoo Finance) — fallback if finnhub fails/no key
        articles = _fetch_yfinance(symbol, company_name)
        if articles:
            logger.info(f"[{symbol}] News source: yfinance ({len(articles)} articles)")
            return {"articles": articles[:max_articles], "source": "yfinance",
                    "symbol": symbol, "total": len(articles)}

        # 3. GNews — generic news, optional key
        articles = _fetch_gnews(symbol, company_name)
        if articles:
            logger.info(f"[{symbol}] News source: gnews ({len(articles)} articles)")
            return {"articles": articles[:max_articles], "source": "gnews",
                    "symbol": symbol, "total": len(articles)}

        # 4. Static fallback — always works
        logger.info(f"[{symbol}] News source: static fallback")
        return {"articles": _static_fallback(company_name)[:max_articles],
                "source": "fallback", "symbol": symbol, "total": 0}
