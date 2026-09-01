"""Investor profile engine — Conservative and Aggressive personas."""

from typing import Any, Dict

_PROFILES: Dict[str, Dict[str, Any]] = {
    "conservative": {
        "id":                    "profile_conservative",
        "name":                  "Conservative Investor",
        "riskTolerance":         "Conservative",
        "investmentHorizon":     "5+ Years",
        "maxSectorConcentration": 20,
        "sectorExposures":       {"Technology": 22, "Financials": 35, "Energy": 18, "Pharma": 15, "Cash": 10},
        "portfolio": [
            {"symbol": "TCS",      "quantity": 100, "avgPrice": 3210.0},
            {"symbol": "HDFCBANK", "quantity": 250, "avgPrice": 1580.0},
            {"symbol": "RELIANCE", "quantity":  90, "avgPrice": 2750.0},
        ],
        "behaviorSignals": {
            "frequentTrading":    False,
            "panicSellingHistory": False,
            "holdingPreference":  "Long-Term Dividend & Stability",
        },
    },
    "aggressive": {
        "id":                    "profile_aggressive",
        "name":                  "Aggressive Growth Investor",
        "riskTolerance":         "Aggressive",
        "investmentHorizon":     "1-3 Years",
        "maxSectorConcentration": 40,
        "sectorExposures":       {"Technology": 8, "Automotive": 28, "Energy": 32, "Financials": 24, "Cash": 8},
        "portfolio": [
            {"symbol": "TATAMOTORS", "quantity": 600, "avgPrice": 880.0},
            {"symbol": "RELIANCE",   "quantity": 200, "avgPrice": 2690.0},
            {"symbol": "INFY",       "quantity": 150, "avgPrice": 1780.0},
        ],
        "behaviorSignals": {
            "frequentTrading":    True,
            "panicSellingHistory": False,
            "holdingPreference":  "High Beta & Momentum Breakouts",
        },
    },
}


class UserProfileEngine:
    def get_profile(self, profile_type: str = "conservative") -> Dict[str, Any]:
        return _PROFILES.get(profile_type.lower(), _PROFILES["conservative"])

    def list_profiles(self):
        return [{"id": v["id"], "name": v["name"], "riskTolerance": v["riskTolerance"]}
                for v in _PROFILES.values()]
