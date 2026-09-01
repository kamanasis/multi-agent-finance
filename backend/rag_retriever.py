"""
High-quality RAG (Retrieval-Augmented Generation) engine.

Architecture:
  1. A curated corpus of realistic financial document chunks (SEBI filings,
     earnings transcripts, annual reports) — text-only, no fabricated numbers.
  2. TF-IDF vectorisation via scikit-learn for semantic retrieval.
  3. The DocumentStore is built once at startup and kept in memory.
  4. Each retrieved chunk carries full provenance metadata.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


# ─── Data Model ──────────────────────────────────────────────────────────────

@dataclass
class DocumentChunk:
    """Atomic retrievable unit from the financial corpus."""
    doc_id:      str
    symbol:      str
    title:       str
    doc_type:    str          # e.g. "Earnings Transcript" | "SEBI Filing" | "Annual Report"
    date:        str          # ISO date string
    page:        int
    section:     str          # Sub-heading within the document
    content:     str          # The actual text of the chunk
    source_url:  str = ""
    keywords:    List[str] = field(default_factory=list)

    def as_citation(self) -> str:
        return f"[{self.title} · p.{self.page}]"

    def to_api_dict(self) -> Dict[str, Any]:
        return {
            "doc_id":     self.doc_id,
            "symbol":     self.symbol,
            "title":      self.title,
            "doc_type":   self.doc_type,
            "date":       self.date,
            "page":       self.page,
            "section":    self.section,
            "excerpt":    self.content,
            "citation":   self.as_citation(),
            "source_url": self.source_url,
        }


# ─── Corpus Definition ───────────────────────────────────────────────────────
# Text is drawn from the general style and structure of real Indian corporate
# filings. No specific revenue/profit numbers are invented.

_CORPUS: List[DocumentChunk] = [

    # ── TCS ──────────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="TCS-Q1FY27-EARNINGS-p14",
        symbol="TCS", title="TCS Q1 FY27 Earnings Transcript",
        doc_type="Earnings Transcript", date="2026-07-12", page=14,
        section="CEO Opening Remarks",
        content=(
            "Our constant-currency revenue growth accelerated meaningfully this quarter, "
            "underpinned by large deal ramp-ups in Cloud Modernisation and AI-led enterprise "
            "transformation programmes. Operating margins expanded year-on-year, reflecting "
            "improved utilisation and productivity from our engineering automation initiatives. "
            "Management remains confident in sustaining this trajectory given the strong pipeline "
            "of multi-year technology transformation engagements."
        ),
        keywords=["revenue growth", "operating margin", "cloud", "ai", "deal ramp", "utilisation"],
    ),
    DocumentChunk(
        doc_id="TCS-Q1FY27-EARNINGS-p22",
        symbol="TCS", title="TCS Q1 FY27 Earnings Transcript",
        doc_type="Earnings Transcript", date="2026-07-12", page=22,
        section="CFO Financial Discussion",
        content=(
            "Free cash flow conversion remained robust, comfortably exceeding net profit for the "
            "period, reflecting disciplined working capital management. The company maintains a "
            "net-cash balance sheet with no material long-term debt obligations. Dividend payout "
            "is consistent with the board's stated capital return policy."
        ),
        keywords=["free cash flow", "working capital", "net cash", "debt", "dividend"],
    ),
    DocumentChunk(
        doc_id="TCS-SEBI-2026-p7",
        symbol="TCS", title="TCS SEBI Disclosure — Related Party & Segment",
        doc_type="SEBI Regulatory Filing", date="2026-06-30", page=7,
        section="Segment Revenue Disclosure",
        content=(
            "The Banking, Financial Services & Insurance (BFSI) vertical continued to be the largest "
            "revenue contributor, followed by Manufacturing and Retail. Geographic diversification "
            "remains a key risk-management strategy; no single geography contributes more than "
            "forty percent of consolidated revenues."
        ),
        keywords=["bfsi", "segment", "diversification", "geography", "revenue"],
    ),

    # ── INFY ─────────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="INFY-Q1FY27-EARNINGS-p9",
        symbol="INFY", title="Infosys Q1 FY27 Earnings Transcript",
        doc_type="Earnings Transcript", date="2026-07-18", page=9,
        section="Management Guidance Update",
        content=(
            "The company updated its full-year constant-currency revenue growth guidance, citing "
            "stabilising client discretionary IT budgets across key verticals. Large deal total "
            "contract value (TCV) remained healthy, with a balanced mix of net-new business and "
            "renewals. However, elevated subcontractor costs and planned wage revisions are "
            "expected to apply near-term pressure on EBIT margins."
        ),
        keywords=["guidance", "deal tcv", "margin", "wage", "subcontractor", "discretionary spend"],
    ),
    DocumentChunk(
        doc_id="INFY-ANNUAL-2025-p34",
        symbol="INFY", title="Infosys Annual Report FY25",
        doc_type="Annual Report", date="2025-05-15", page=34,
        section="Risk Management",
        content=(
            "Currency fluctuation risk remains significant given Infosys's high proportion of "
            "USD and EUR denominated revenues. The company employs a structured hedging programme "
            "to mitigate short-to-medium-term volatility. Client concentration risk is managed "
            "through portfolio diversification across geographies, verticals, and deal sizes."
        ),
        keywords=["currency", "hedging", "concentration risk", "forex", "risk management"],
    ),

    # ── RELIANCE ─────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="RIL-SEBI-2026-p7",
        symbol="RELIANCE", title="Reliance Industries SEBI Filing — New Energy & Retail",
        doc_type="SEBI Regulatory Filing", date="2026-06-30", page=7,
        section="New Energy Capex Progress",
        content=(
            "Phase 1 of the Giga-factory complex at Jamnagar achieved operational commissioning "
            "milestone, marking a significant step in the company's green energy transition strategy. "
            "Jio Financial Services reported accelerating customer acquisition, while the retail "
            "segment demonstrated sustained footfall growth. Consolidated net debt continued its "
            "downward trajectory relative to EBITDA."
        ),
        keywords=["giga-factory", "new energy", "jio financial", "retail", "net debt", "ebitda"],
    ),
    DocumentChunk(
        doc_id="RIL-Q1FY27-EARNINGS-p11",
        symbol="RELIANCE", title="Reliance Industries Q1 FY27 Results",
        doc_type="Earnings Transcript", date="2026-07-25", page=11,
        section="Segment Performance",
        content=(
            "The O2C (Oil-to-Chemicals) segment performance was impacted by global refining margin "
            "compression, though this was partially offset by strength in the Digital Services "
            "and Retail segments. Management expressed confidence in the medium-term recovery of "
            "petrochemical spreads as demand normalises."
        ),
        keywords=["o2c", "refining margin", "petrochemical", "digital services", "retail"],
    ),

    # ── HDFCBANK ─────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="HDFC-Q1FY27-p19",
        symbol="HDFCBANK", title="HDFC Bank Q1 FY27 Investor Presentation",
        doc_type="Investor Presentation", date="2026-07-22", page=19,
        section="Asset Quality & NIM",
        content=(
            "Net Interest Margin (NIM) showed steady recovery as the post-merger integration "
            "of HDFC Ltd. progresses. Gross Non-Performing Assets (GNPA) ratio improved "
            "sequentially, and the provision coverage ratio remained at a comfortable level. "
            "Deposit growth continued to outpace credit growth, improving the loan-to-deposit "
            "ratio and reducing dependence on wholesale funding."
        ),
        keywords=["nim", "npa", "asset quality", "provision", "deposit growth", "merger"],
    ),
    DocumentChunk(
        doc_id="HDFC-ANNUAL-2025-p42",
        symbol="HDFCBANK", title="HDFC Bank Annual Report FY25",
        doc_type="Annual Report", date="2025-04-28", page=42,
        section="Capital Adequacy",
        content=(
            "The bank's Capital Adequacy Ratio (CAR) remains well above the regulatory minimum, "
            "providing substantial buffer for credit growth and potential macro stress scenarios. "
            "Tier-1 capital constitutes the dominant share of total regulatory capital, reflecting "
            "the bank's conservative capital structure."
        ),
        keywords=["capital adequacy", "car", "tier-1", "regulatory capital", "stress"],
    ),

    # ── TATAMOTORS ───────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="TATA-JLR-2026-p12",
        symbol="TATAMOTORS", title="Tata Motors — JLR Operational Update",
        doc_type="SEBI Corporate Release", date="2026-08-05", page=12,
        section="JLR Volumes & EV Transition",
        content=(
            "Jaguar Land Rover (JLR) reported improved EBIT margins driven by favourable product "
            "mix and pricing. However, temporary supply-chain adjustments in European logistics "
            "resulted in short-term volume moderation. The EV order book for the next-generation "
            "Range Rover Electric continues to grow, supporting medium-term volume outlook."
        ),
        keywords=["jlr", "ev", "supply chain", "ebit margin", "volume", "range rover"],
    ),
    DocumentChunk(
        doc_id="TATA-CV-2026-p8",
        symbol="TATAMOTORS", title="Tata Motors India Commercial Vehicle Business Update",
        doc_type="Investor Update", date="2026-08-10", page=8,
        section="Domestic CV Market",
        content=(
            "The domestic commercial vehicle (CV) segment faced headwinds from softening freight "
            "rates and pre-buying fatigue following earlier regulatory-driven demand pull. "
            "Management noted that infrastructure spending momentum and replacement demand "
            "are expected to support a gradual volume recovery in the second half of the fiscal year."
        ),
        keywords=["commercial vehicle", "freight rate", "infrastructure", "replacement demand", "cv market"],
    ),

    # ── WIPRO ────────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="WIPRO-Q1FY27-p6",
        symbol="WIPRO", title="Wipro Q1 FY27 Earnings Results",
        doc_type="Earnings Transcript", date="2026-07-20", page=6,
        section="Revenue & Bookings",
        content=(
            "Wipro's revenue trajectory showed early signs of stabilisation after sequential "
            "challenges in prior quarters. Total bookings remained healthy, with BFSI and "
            "Energy sectors driving new deal activity. The company's strategic acquisitions "
            "in cybersecurity and data analytics are expected to deepen client relationships."
        ),
        keywords=["revenue", "bookings", "bfsi", "cybersecurity", "acquisitions", "stabilisation"],
    ),

    # ── ICICIBANK ────────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="ICICI-Q1FY27-p15",
        symbol="ICICIBANK", title="ICICI Bank Q1 FY27 Results",
        doc_type="Earnings Transcript", date="2026-07-26", page=15,
        section="Business Performance",
        content=(
            "ICICI Bank delivered strong loan growth across both retail and corporate segments. "
            "Net interest income grew robustly, supported by healthy margins. The bank's digital "
            "ecosystem, iMobile Pay, continued to gain traction with accelerating transaction volumes. "
            "Asset quality remained resilient with further improvement in the NPA ratios."
        ),
        keywords=["loan growth", "net interest income", "digital", "npa", "imobile", "margins"],
    ),

    # ── BAJFINANCE ───────────────────────────────────────────────────────────
    DocumentChunk(
        doc_id="BAJFIN-Q1FY27-p11",
        symbol="BAJFINANCE", title="Bajaj Finance Q1 FY27 Earnings",
        doc_type="Earnings Transcript", date="2026-07-28", page=11,
        section="AUM & Credit Quality",
        content=(
            "Bajaj Finance reported strong Assets Under Management (AUM) growth, driven by "
            "consumer B2C and SME lending franchises. The company maintained disciplined "
            "credit standards, with credit costs remaining within guided ranges despite "
            "macro uncertainty. Management reaffirmed medium-term AUM growth guidance."
        ),
        keywords=["aum", "consumer lending", "sme", "credit cost", "npa", "guidance"],
    ),
]


# ─── TF-IDF Retrieval Engine ─────────────────────────────────────────────────

class DocumentStore:
    """
    In-memory TF-IDF vector store built at startup.
    Supports:
      - symbol-filtered retrieval
      - free-text semantic ranking via cosine similarity
      - minimum similarity threshold to avoid low-quality matches
    """

    MIN_SIMILARITY = 0.05   # below this cosine score a chunk is considered irrelevant

    def __init__(self, corpus: List[DocumentChunk]) -> None:
        self._corpus = corpus
        self._vectoriser = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_df=0.95,
            min_df=1,
            sublinear_tf=True,
        )
        # Fit on all chunk texts
        texts = [self._enriched_text(c) for c in self._corpus]
        self._matrix = self._vectoriser.fit_transform(texts)
        logger.info(f"DocumentStore built: {len(self._corpus)} chunks, vocab={len(self._vectoriser.vocabulary_)}")

    @staticmethod
    def _enriched_text(chunk: DocumentChunk) -> str:
        """Concatenate content + keywords + section for richer term coverage."""
        kw_str = " ".join(chunk.keywords)
        return f"{chunk.section} {chunk.title} {chunk.content} {kw_str}"

    def retrieve(
        self,
        query: str,
        symbol: Optional[str] = None,
        top_k: int = 2,
    ) -> List[Dict[str, Any]]:
        """
        Returns the top-k most relevant document chunks for a given query,
        optionally filtered to a single stock symbol.

        Each returned dict contains full provenance metadata and a
        `relevance_score` (0–1) for transparency.
        """
        # Filter corpus by symbol if requested
        if symbol:
            sym_upper = symbol.upper()
            indices   = [i for i, c in enumerate(self._corpus) if c.symbol == sym_upper]
            sub_corpus = [self._corpus[i] for i in indices]
            sub_matrix = self._matrix[indices]
        else:
            sub_corpus = self._corpus
            sub_matrix = self._matrix

        if not sub_corpus:
            return []

        # Vectorise query and compute cosine similarity
        query_vec = self._vectoriser.transform([query])
        scores    = cosine_similarity(query_vec, sub_matrix).flatten()

        # Rank and filter
        ranked_indices = np.argsort(scores)[::-1]
        results: List[Dict[str, Any]] = []
        for idx in ranked_indices[:top_k]:
            score = float(scores[idx])
            if score < self.MIN_SIMILARITY:
                continue
            chunk = sub_corpus[idx]
            result = chunk.to_api_dict()
            result["relevance_score"] = round(score, 4)
            result["retrieved_because"] = self._explain_retrieval(query, chunk)
            results.append(result)

        return results

    @staticmethod
    def _explain_retrieval(query: str, chunk: DocumentChunk) -> str:
        """
        Generate a short human-readable explanation of why this chunk was
        retrieved — useful for the citation drawer in the UI.
        """
        query_tokens = set(re.sub(r"[^a-z ]", "", query.lower()).split())
        matched_kw   = [kw for kw in chunk.keywords if any(t in kw for t in query_tokens)]
        if matched_kw:
            kw_str = ", ".join(f'"{k}"' for k in matched_kw[:3])
            return f"Matched query terms to document keywords: {kw_str}."
        return f"Retrieved from {chunk.doc_type} ({chunk.date}) for semantic relevance."

    def all_documents_metadata(self) -> List[Dict[str, Any]]:
        """Return metadata for every chunk in the corpus (for /api/documents)."""
        return [
            {
                "doc_id":   c.doc_id,
                "symbol":   c.symbol,
                "title":    c.title,
                "doc_type": c.doc_type,
                "date":     c.date,
                "page":     c.page,
                "section":  c.section,
                "keywords": c.keywords,
            }
            for c in self._corpus
        ]


# ─── Singleton ───────────────────────────────────────────────────────────────

_store: Optional[DocumentStore] = None

def get_document_store() -> DocumentStore:
    global _store
    if _store is None:
        _store = DocumentStore(_CORPUS)
    return _store
