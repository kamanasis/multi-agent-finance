"""
Market Data Provider — yfinance (free, no API key).
RSI / MACD / SMA computed manually with numpy — no pandas-ta needed.
"""

import time
import logging
from typing import Any, Dict, List, Optional

import numpy as np

try:
    import yfinance as yf
    import pandas as pd
    YFINANCE_OK = True
except ImportError:
    YFINANCE_OK = False

logger = logging.getLogger(__name__)

# NSE tickers: key = short symbol used by the app, value = Yahoo Finance ticker
SYMBOL_MAP: Dict[str, str] = {
    "TCS":        "TCS.NS",
    "INFY":       "INFY.NS",
    "RELIANCE":   "RELIANCE.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "WIPRO":      "WIPRO.NS",
    "ICICIBANK":  "ICICIBANK.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
}

# Sector / display name map (static — these never change)
STOCK_META: Dict[str, Dict[str, str]] = {
    "TCS":        {"name": "Tata Consultancy Services", "sector": "Technology"},
    "INFY":       {"name": "Infosys Limited",            "sector": "Technology"},
    "RELIANCE":   {"name": "Reliance Industries",        "sector": "Energy & Retail"},
    "HDFCBANK":   {"name": "HDFC Bank",                  "sector": "Financial Services"},
    "TATAMOTORS": {"name": "Tata Motors",                "sector": "Automotive"},
    "WIPRO":      {"name": "Wipro Limited",              "sector": "Technology"},
    "ICICIBANK":  {"name": "ICICI Bank",                 "sector": "Financial Services"},
    "BAJFINANCE": {"name": "Bajaj Finance",              "sector": "Financial Services"},
}


# ─── Technical Indicator Helpers ─────────────────────────────────────────────

def _rsi(close: np.ndarray, period: int = 14) -> float:
    """Wilder's RSI — pure numpy, no external dependency."""
    if len(close) < period + 1:
        return 50.0
    delta = np.diff(close)
    gains = np.where(delta > 0, delta, 0.0)
    losses = np.where(delta < 0, -delta, 0.0)
    avg_gain = float(np.mean(gains[:period]))
    avg_loss = float(np.mean(losses[:period]))
    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def _ema(close: np.ndarray, period: int) -> np.ndarray:
    """Exponential moving average."""
    ema = np.zeros_like(close, dtype=float)
    k = 2 / (period + 1)
    ema[0] = close[0]
    for i in range(1, len(close)):
        ema[i] = close[i] * k + ema[i - 1] * (1 - k)
    return ema


def _macd(close: np.ndarray) -> Dict[str, float]:
    """MACD (12, 26, 9) — pure numpy."""
    if len(close) < 35:
        return {"value": 0.0, "signal": 0.0, "histogram": 0.0}
    ema12 = _ema(close, 12)
    ema26 = _ema(close, 26)
    macd_line = ema12 - ema26
    signal_line = _ema(macd_line, 9)
    hist = macd_line - signal_line
    return {
        "value":     round(float(macd_line[-1]), 3),
        "signal":    round(float(signal_line[-1]), 3),
        "histogram": round(float(hist[-1]), 3),
    }


def _sma(close: np.ndarray, period: int) -> Optional[float]:
    if len(close) < period:
        return None
    return round(float(np.mean(close[-period:])), 2)


def _ma_signal(price: float, sma50: Optional[float], sma200: Optional[float], rsi: float) -> str:
    if sma50 and sma200:
        if price > sma50 > sma200:
            return "STRONG_UPTREND"
        if price > sma50:
            return "BULLISH_CROSSOVER"
        if price < sma50 < sma200:
            return "STRONG_DOWNTREND"
    if rsi < 35:
        return "SHORT_TERM_PULLBACK"
    if rsi > 65:
        return "BULLISH_MOMENTUM"
    return "NEUTRAL_CONSOLIDATION"


# ─── Main Provider ────────────────────────────────────────────────────────────

class MarketDataProvider:

    def _build_from_history(self, symbol: str, hist: "pd.DataFrame") -> Dict[str, Any]:
        """Convert yfinance DataFrame → our standardised market dict."""
        close = hist["Close"].values.astype(float)
        volume_arr = hist["Volume"].values.astype(float)

        price      = round(float(close[-1]), 2)
        prev_close = round(float(close[-2]), 2) if len(close) > 1 else price
        change_pct = round(((price - prev_close) / prev_close) * 100, 2) if prev_close else 0.0
        volume     = int(volume_arr[-1])
        avg_vol    = int(np.mean(volume_arr[-20:])) if len(volume_arr) >= 20 else volume

        rsi   = _rsi(close)
        macd  = _macd(close)
        sma50 = _sma(close, 50)
        sma200 = _sma(close, 200)

        sparkline = [round(float(c), 2) for c in close[-30:]]

        high_52w = round(float(hist["High"].values.max()), 2)
        low_52w  = round(float(hist["Low"].values.min()), 2)

        meta = STOCK_META.get(symbol, {"name": symbol, "sector": "Unknown"})

        # Rough P/E proxy — not available without info; leave as None
        return {
            "symbol":               symbol,
            "name":                 meta["name"],
            "sector":               meta["sector"],
            "price":                price,
            "prev_close":           prev_close,
            "change_pct":           change_pct,
            "volume":               volume,
            "volume_avg_20d":       avg_vol,
            "volume_ratio":         round(volume / avg_vol, 2) if avg_vol else 1.0,
            "high_52w":             high_52w,
            "low_52w":              low_52w,
            "pe_ratio":             None,  # fetched separately when needed
            "rsi_14":               rsi,
            "macd":                 macd,
            "sma_50":               sma50,
            "sma_200":              sma200,
            "moving_average_signal": _ma_signal(price, sma50, sma200, rsi),
            "sparkline":            sparkline,
            "last_updated":         time.strftime("%Y-%m-%d %H:%M:%S IST"),
            "data_quality":         "live",
        }

    def _fallback(self, symbol: str) -> Dict[str, Any]:
        """Return shape-correct stub so the pipeline never crashes."""
        meta = STOCK_META.get(symbol, {"name": symbol, "sector": "Unknown"})
        return {
            "symbol":               symbol,
            "name":                 meta["name"],
            "sector":               meta["sector"],
            "price":                0.0,
            "prev_close":           0.0,
            "change_pct":           0.0,
            "volume":               0,
            "volume_avg_20d":       0,
            "volume_ratio":         1.0,
            "high_52w":             0.0,
            "low_52w":              0.0,
            "pe_ratio":             None,
            "rsi_14":               50.0,
            "macd":                 {"value": 0.0, "signal": 0.0, "histogram": 0.0},
            "sma_50":               None,
            "sma_200":              None,
            "moving_average_signal": "DATA_UNAVAILABLE",
            "sparkline":            [],
            "last_updated":         time.strftime("%Y-%m-%d %H:%M:%S IST"),
            "data_quality":         "unavailable",
        }

    def get_stock_data(self, symbol: str) -> Dict[str, Any]:
        symbol = symbol.upper()
        if not YFINANCE_OK:
            logger.warning("yfinance not available — returning unavailable stub.")
            return self._fallback(symbol)

        yf_sym = SYMBOL_MAP.get(symbol, symbol + ".NS")
        try:
            hist = yf.Ticker(yf_sym).history(period="1y", interval="1d", auto_adjust=True)
            if hist.empty:
                logger.warning(f"Empty history for {yf_sym}")
                return self._fallback(symbol)
            return self._build_from_history(symbol, hist)
        except Exception as exc:
            logger.error(f"yfinance error [{symbol}]: {exc}")
            return self._fallback(symbol)

    def list_all_stocks(self) -> List[Dict[str, Any]]:
        """Return a lightweight summary list (sparkline = last 7 days only)."""
        results = []
        for sym in SYMBOL_MAP:
            d = self.get_stock_data(sym)
            results.append({
                "symbol":       d["symbol"],
                "name":         d["name"],
                "sector":       d["sector"],
                "price":        d["price"],
                "change_pct":   d["change_pct"],
                "volume":       d["volume"],
                "rsi_14":       d["rsi_14"],
                "sparkline":    d["sparkline"][-7:],
                "data_quality": d["data_quality"],
            })
        return results
