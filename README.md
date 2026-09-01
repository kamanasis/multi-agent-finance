<div align="center">

# 🧠 FinAgent Intelligence
### **Multi-Agent Autonomous Financial Intelligence Platform**

> *Turning market noise into explainable, personalized investment intelligence — powered by parallel AI agents, RAG-grounded fundamentals, and FinBERT sentiment analysis.*

<p>
  <a href="https://github.com/kamanasis/multi-agent-finance">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
</p>

<img src="https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Groq_Qwen_2.5-FF6B35?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/HuggingFace_FinBERT-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" />
<img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/TF--IDF_RAG-8E44AD?style=for-the-badge&logo=databricks&logoColor=white" />
<img src="https://img.shields.io/github/actions/workflow/status/kamanasis/multi-agent-finance/ci.yml?branch=main&label=CI%2FCD&style=for-the-badge" />
<img src="https://img.shields.io/badge/Hackverse-Rapid_Round-FFD700?style=for-the-badge" />

<br><br>

[Problem](#-problem-statement) •
[Solution](#-the-solution) •
[Architecture](#-system-architecture) •
[Agent Contracts](#-agent-contracts) •
[RAG Pipeline](#-rag-pipeline) •
[Personalization](#-personalization-engine) •
[API](#-api-endpoints) •
[Setup](#-quick-start)

</div>

---

## 🔴 Problem Statement

India''s retail investors are drowning in disconnected financial signals. The missing layer is **coordinated, explainable interpretation.**

```
  ╔══════════════════════════════════════════════════════════════╗
  ║  📊 THE RETAIL INVESTOR INTELLIGENCE GAP — BY THE NUMBERS  ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  • 90M+ retail investors in India — most without research   ║
  ║  • Average investor reads 3+ conflicting signals daily      ║
  ║  • Professional firms run 5+ specialist research desks      ║
  ║  • 0 retail tools provide coordinated multi-agent analysis  ║
  ║  • Manual reconciliation takes hours; opportunities vanish  ║
  ╚══════════════════════════════════════════════════════════════╝
```

### Core Pain Points

**1. 📊 Disconnected Signals** — Price charts, news headlines, and regulatory filings are analyzed in isolation. No tool reconciles them into a single coordinated view.

**2. 🤔 Unexplained Recommendations** — Generic screeners give "Buy/Sell" with no evidence trail, no cited sources, no reasoning whatsoever.

**3. 🎭 One-Size-Fits-All Analysis** — Conservative and aggressive investors receive identical signals, ignoring portfolio concentration and individual risk tolerance.

**4. 🔒 Fundamental Data is Buried** — SEBI filings and earnings transcripts hold the most important insights, but extracting them manually takes hours.

---

## 🟢 The Solution

FinAgent Intelligence deploys **three parallel specialist AI agents** — each with its own data source, reasoning model, and confidence score — then orchestrates them through a Synthesis Agent that accounts for your personal risk profile and portfolio context.

| Problem | FinAgent Solution |
|:---|:---|
| Disconnected signals | 3 specialist agents + 1 synthesis layer — always coordinated |
| No evidence trail | RAG retrieval grounds every fundamental claim in actual SEBI filings |
| Generic analysis | User profile engine personalizes synthesis per investor risk + portfolio |
| One AI = one bias | Multi-agent disagreement is surfaced, not hidden |
| Missing fundamentals | TF-IDF semantic retrieval over financial document corpus with source attribution |

> *"We don''t use one AI to make a market call. We orchestrate independent specialist agents, ground fundamental reasoning in retrieved financial documents, evaluate conflicts, and then apply the user''s portfolio and risk context before synthesizing a cited result."*

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer — React 19 + Vite"]
        UI["Dashboard Components"]
        LP["Landing Page"]
        AUTH["Auth (MongoDB JWT)"]
        RECHARTS["Recharts Visualization"]
    end

    subgraph API["⚙️ Backend Layer — FastAPI + Python 3.11"]
        MAIN["main.py — FastAPI App"]
        ANALYZE["POST /api/analyze"]
        PROFILE["GET /api/profile"]
        PERF["GET /api/performance"]
        AUTH_EP["POST /api/auth/*"]
    end

    subgraph DATA["📡 Data Ingestion Layer"]
        MARKET["MarketDataProvider\nyfinance · Yahoo Finance"]
        NEWS["NewsProvider\nFinnhub → Yahoo → GNews Waterfall"]
        FILINGS["Financial Documents\nSEBI Filings · Earnings Transcripts"]
    end

    subgraph AGENTS["🤖 Agent Orchestration — ThreadPoolExecutor"]
        TECH["⚡ Technical Agent\nRSI · MACD · SMA · Volume"]
        FUND["📄 Fundamental Agent\nRAG-Grounded · Citations"]
        SENT["📰 Sentiment Agent\nFinBERT NLP · News"]
        SYNTH["🎯 Synthesis Agent\nConflict Resolution · Personalization"]
    end

    subgraph RAG["📚 RAG Pipeline — TF-IDF Semantic Retrieval"]
        INGEST["Document Ingestion\nParse + Chunk + Normalize"]
        EMBED["TF-IDF Embedding\nrag_retriever.py"]
        VECTOR["In-Memory Document Store\n14 Chunks · Vocab 1005"]
        SEARCH["Semantic Search — Top-k"]
    end

    subgraph STORAGE["💾 Storage Layer"]
        MONGO["MongoDB Atlas\nUser Accounts · JWT Auth"]
        METRICS["Session Metrics\nmetrics_logger.py"]
    end

    CLIENT --> API
    API --> DATA
    API --> AGENTS
    FILINGS --> INGEST --> EMBED --> VECTOR --> SEARCH --> FUND
    TECH & FUND & SENT --> SYNTH
    SYNTH --> API
    AUTH --> MONGO

    classDef clientStyle fill:#0f2a3a,stroke:#00C9A7,color:#fff
    classDef apiStyle fill:#1a2a1a,stroke:#35D07F,color:#fff
    classDef agentStyle fill:#2d1b69,stroke:#9b59b6,color:#fff
    classDef ragStyle fill:#3a1a0a,stroke:#F5B84B,color:#fff
    classDef storageStyle fill:#1e1e2e,stroke:#4F8CFF,color:#fff
```

---

## 🤖 Multi-Agent Architecture

```mermaid
graph TB
    INPUT(["📊 User Request\nSymbol + Risk Profile + Portfolio"])

    subgraph PARALLEL["⚡ Parallel Execution — ThreadPoolExecutor"]
        direction LR
        TECH_AGENT["⚡ Technical Agent"]
        FUND_AGENT["📄 Fundamental Agent"]
        SENT_AGENT["📰 Sentiment Agent"]
    end

    subgraph TECH_PIPELINE["Technical Agent Pipeline"]
        T1["Fetch OHLCV — yfinance 60 days"]
        T2["Compute: RSI · MACD · SMA20/50\nVolume Ratio · ATR"]
        T3["Groq Qwen 2.5 Inference"]
        T4["Output: signal · confidence · findings · metrics"]
    end

    subgraph FUND_PIPELINE["Fundamental Agent Pipeline"]
        F1["RAG Retrieval — Semantic Search Top-k"]
        F2["Evidence Assembly — Chunks + Citations"]
        F3["Groq Qwen 2.5 — RAG-Grounded Prompt"]
        F4["Output: signal · confidence · findings · sources"]
    end

    subgraph SENT_PIPELINE["Sentiment Agent Pipeline"]
        S1["News Fetch — Finnhub → Yahoo → GNews"]
        S2["FinBERT Classification\nProsusAI/finbert"]
        S3["Sentiment Aggregation\nPositive · Neutral · Negative"]
        S4["Output: signal · confidence · articles"]
    end

    subgraph SYNTHESIS["🎯 Synthesis Agent"]
        SY1["Aggregate all 3 agent outputs"]
        SY2["Conflict Detection"]
        SY3["User Profile Injection\nRisk · Portfolio · Behavior"]
        SY4["Groq Qwen 2.5 Personalized Synthesis"]
        SY5["Final: classification · confidence · summary\nkeyReasons · risks · portfolioImpact\nagentAgreement · sources · dataQuality"]
    end

    INPUT --> PARALLEL
    PARALLEL --> TECH_AGENT --> T1 --> T2 --> T3 --> T4
    PARALLEL --> FUND_AGENT --> F1 --> F2 --> F3 --> F4
    PARALLEL --> SENT_AGENT --> S1 --> S2 --> S3 --> S4
    T4 & F4 & S4 --> SY1 --> SY2 --> SY3 --> SY4 --> SY5
```

---

## 📚 RAG Pipeline

### TF-IDF Semantic Retrieval Architecture

```mermaid
flowchart TD
    subgraph CORPUS["📁 Financial Document Corpus"]
        D1["SEBI Regulatory Filings"]
        D2["Quarterly Earnings Transcripts"]
        D3["Annual Reports"]
        D4["SEBI Circulars and Guidelines"]
    end

    subgraph INGESTION["📥 Ingestion — rag_retriever.py"]
        I1["File Reader — load raw text"]
        I2["Text Normalization\nLowercase · punctuation strip"]
        I3["Sliding Window Chunker\nChunk ~500 tokens · Overlap ~50"]
        I4["Metadata Tag\ndocumentId · company · type · date · page"]
    end

    subgraph EMBEDDING["🔢 TF-IDF Embedding"]
        E1["Vocabulary Construction — 1005 terms"]
        E2["IDF Weight Computation — log N/df"]
        E3["Document Matrix — 14 chunks x 1005 dims"]
        E4["In-Memory DocumentStore"]
    end

    subgraph RETRIEVAL["🔍 Query-Time Retrieval"]
        R1["Query: symbol + context\ne.g. TCS revenue Q1 FY27"]
        R2["TF-IDF Query Vector"]
        R3["Cosine Similarity vs Document Matrix"]
        R4["Top-k Ranking — k=3"]
        R5["Evidence Payload — text · metadata · score"]
    end

    subgraph AGENT_USE["📄 Fundamental Agent"]
        A1["RAG Context Assembly"]
        A2["Citation Attachment — Doc Title · Page · Date"]
        A3["Groq LLM Inference — RAG-grounded prompt"]
        A4["Cited Output — every claim linked to source"]
    end

    D1 & D2 & D3 & D4 --> I1 --> I2 --> I3 --> I4
    I4 --> E1 --> E2 --> E3 --> E4
    E4 --> RETRIEVAL
    R1 --> R2 --> R3 --> R4 --> R5
    R5 --> A1 --> A2 --> A3 --> A4
```

### RAG Source Attribution Flow

```mermaid
sequenceDiagram
    participant UI as 🖥️ Dashboard
    participant API as ⚙️ FastAPI
    participant RAG as 📚 DocumentStore
    participant LLM as 🧠 Groq Qwen 2.5

    UI->>API: POST /api/analyze {symbol: "TCS"}
    API->>RAG: semantic_search("TCS revenue earnings")
    RAG-->>API: [{chunk: "...", doc: "Q1 FY27 Earnings", page: 14, score: 0.87}]
    API->>LLM: RAG-grounded prompt with citation instructions
    LLM-->>API: {signal: "positive", sources: [{title: "Q1 FY27 Earnings", page: 14}]}
    API-->>UI: Fundamental output with citations
    UI->>UI: Render citation chips — user can click to view full excerpt
```

---

## 📋 Agent Contracts

### Technical Agent Output Schema
```json
{
  "agent": "technical",
  "signal": "bullish",
  "confidence": 0.82,
  "findings": [
    { "title": "RSI momentum recovering", "detail": "RSI moved from 42 to 61 over 5 sessions." }
  ],
  "metrics": { "rsi": 61, "macd": 12.4, "sma20": 3380, "sma50": 3210, "volumeRatio": 1.8 },
  "latencyMs": 1800
}
```

### Fundamental Agent Output Schema
```json
{
  "agent": "fundamental",
  "signal": "positive",
  "confidence": 0.81,
  "findings": [
    { "title": "Revenue growth accelerating", "source": "Q1 FY27 Earnings Filing · p.14" }
  ],
  "sources": [
    { "title": "Q1 FY27 Earnings Filing", "page": 14, "relevanceScore": 0.87 }
  ],
  "latencyMs": 2100
}
```

### Sentiment Agent Output Schema
```json
{
  "agent": "sentiment",
  "signal": "neutral",
  "confidence": 0.64,
  "positiveSignals": [{ "headline": "TCS wins $1B deal", "score": 0.91 }],
  "negativeSignals": [{ "headline": "IT sector faces visa uncertainty", "score": -0.72 }],
  "articleCount": 8,
  "latencyMs": 1200
}
```

### Synthesis Agent Output Schema
```json
{
  "classification": "moderately_bullish",
  "confidence": 0.76,
  "summary": "Technical and fundamental signals align; sentiment introduces short-term uncertainty.",
  "keyReasons": ["RSI momentum recovery with MACD crossover", "14.2% revenue growth confirmed"],
  "risks": ["IT visa uncertainty", "Sector concentration already at 22%"],
  "portfolioImpact": { "currentExposure": "22%", "concentrationScore": 0.78 },
  "agentAgreement": "2_of_3",
  "conflictNote": "Technical and fundamental bullish; sentiment neutral — confidence reduced 0.81 → 0.76",
  "dataQuality": "good",
  "latencyMs": 5800
}
```

---

## 👤 Personalization Engine

### Same Market — Different Intelligence

```mermaid
graph TB
    MARKET(["📊 Same Market Input\nTCS · 3 Agents Run Identically"])

    PROFILING["👤 UserProfileEngine\nProfile injected into Synthesis Prompt"]

    subgraph CONSERVATIVE["Conservative Investor"]
        C_PROFILE["Risk: Conservative · Tech Exposure: 22%"]
        C_SIGNAL["🟡 WATCH — Confidence: 61%"]
        C_REASON["Positive fundamentals offset by\nexisting sector concentration."]
    end

    subgraph AGGRESSIVE["Aggressive Investor"]
        A_PROFILE["Risk: Aggressive · Tech Exposure: 8%"]
        A_SIGNAL["🟢 CONSIDER — Confidence: 79%"]
        A_REASON["Momentum and fundamentals align with\nhigher risk tolerance and low tech exposure."]
    end

    MARKET --> PROFILING
    PROFILING --> CONSERVATIVE
    PROFILING --> AGGRESSIVE
```

> **The market facts did not change. The investor context did.**

---

## ⚠️ Conflict Resolution & Degraded Data

### Agent Conflict Detection

```mermaid
flowchart TD
    T["⚡ Technical — BULLISH 82%"]
    F["📄 Fundamental — POSITIVE 76%"]
    S["📰 Sentiment — CAUTION 71%"]

    DETECT{{"⚠️ Conflict Detector — Synthesis Agent"}}

    MAJORITY["Majority: 2/3 Bullish"]
    REDUCE["Confidence Reduced: 0.81 → 0.68"]
    EXPLAIN["Conflict Explanation in Output"]

    OUTPUT["Final: MODERATELY BULLISH · 68%\nSentiment caution noted"]

    T & F & S --> DETECT --> MAJORITY --> REDUCE --> EXPLAIN --> OUTPUT
```

### Degraded Data Handling

```mermaid
flowchart LR
    F1["Market API Unavailable"] --> R1["Technical: mark unavailable\nConfidence → 0\nLast timestamp shown"]
    F2["News Source Unavailable"] --> R2["Waterfall: Finnhub → Yahoo\n→ GNews → Static fallback"]
    F3["RAG Corpus Empty"] --> R3["Fundamental: partial analysis\nEvidence gap communicated\nNo fabricated sources"]
    F4["All Agents Disagree"] --> R4["Conflict noted\nConfidence reduced\nAll outputs preserved"]

    R1 & R2 & R3 & R4 --> U["dataQuality: degraded or insufficient\n⚠ PARTIAL ANALYSIS shown in UI\nNo actionable signal generated"]
```

---

## 🔐 Authentication Architecture

```mermaid
sequenceDiagram
    participant UI as 🖥️ React Frontend
    participant API as ⚙️ FastAPI Auth Router
    participant BCRYPT as 🔒 bcrypt
    participant MONGO as 🗄️ MongoDB Atlas
    participant JWT as 🎟️ python-jose JWT

    UI->>API: POST /api/auth/register {email, password}
    API->>BCRYPT: hashpw(password, gensalt())
    BCRYPT-->>API: hashed_password
    API->>MONGO: insert {email, hashed_password, created_at}
    API-->>UI: {message: "Registration successful"}

    UI->>API: POST /api/auth/login {email, password}
    API->>MONGO: find_one({email})
    API->>BCRYPT: checkpw(plain, hashed)
    BCRYPT-->>API: true
    API->>JWT: encode({sub: email}, SECRET_KEY, HS256, expires 7d)
    JWT-->>API: access_token
    API-->>UI: {access_token, token_type: "bearer"}
    UI->>UI: localStorage.setItem token
```

---

## 🧪 CI/CD Pipeline

```mermaid
graph TD
    PUSH["git push origin main"]

    subgraph GHA["GitHub Actions — ci.yml"]
        TRIGGER["Trigger on push to main"]
        PY_SETUP["Setup Python 3.11"]
        INSTALL["pip install -r requirements.txt"]
        LINT["flake8 linting"]
        RESULT{All Checks Pass?}
        SUCCESS["✅ Build Green"]
        FAIL["❌ Build Red — Notify"]
    end

    PUSH --> TRIGGER --> PY_SETUP --> INSTALL --> LINT --> RESULT
    RESULT -->|Yes| SUCCESS
    RESULT -->|No| FAIL
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|:---|:---|:---|
| **React** | 19.x | UI Framework |
| **Vite** | 8.x | Build Tool + Dev Server |
| **Recharts** | Latest | Market charts + performance graphs |
| **Lucide React** | Latest | Icon system |
| **Vanilla CSS** | — | Dark-first design system (teal #00C9A7) |

### Backend
| Technology | Purpose |
|:---|:---|
| **FastAPI** | REST API framework |
| **ThreadPoolExecutor** | Parallel 3-agent execution |
| **Groq API (Qwen 2.5 32B)** | Agent LLM inference |
| **HuggingFace FinBERT** | `ProsusAI/finbert` — financial sentiment NLP |
| **yfinance** | Market data — OHLCV, indicators |
| **pymongo** | MongoDB Atlas connection |
| **bcrypt** | Password hashing (raw, not passlib) |
| **python-jose** | JWT token encoding/decoding |
| **TF-IDF (numpy)** | RAG semantic retrieval engine |

### Data Providers — News Waterfall
| Provider | Tier |
|:---|:---:|
| Finnhub | 1st |
| Yahoo Finance | 2nd |
| GNews API | 3rd |
| Static corpus fallback | 4th |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/` | Health check |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login + receive JWT |
| `POST` | `/api/analyze` | Full multi-agent pipeline |
| `GET` | `/api/profile` | Get/set investor risk profile |
| `GET` | `/api/documents` | List RAG document corpus |
| `GET` | `/api/performance` | Session performance metrics |

---

## 📁 Project Structure

```text
Rapid_Round_Hackverse/
├── 📄 README.md
├── 📄 design.md                     # UI/UX design specification
├── 📄 project-context.md            # Full architecture contract
│
├── 🐍 backend/
│   ├── main.py                      # FastAPI app + router registration
│   ├── auth.py                      # MongoDB JWT auth (bcrypt + python-jose)
│   ├── agents_specialists.py        # Technical · Fundamental · Sentiment agents
│   ├── agents_synthesis.py          # Synthesis Agent + conflict resolution
│   ├── rag_retriever.py             # TF-IDF DocumentStore + semantic search
│   ├── data_market.py               # MarketDataProvider (yfinance adapter)
│   ├── news_provider.py             # NewsProvider (waterfall fallback)
│   ├── profiling_engine.py          # UserProfileEngine + personalization
│   ├── metrics_logger.py            # Session performance logging
│   └── requirements.txt
│
├── ⚛️ frontend/
│   └── src/
│       ├── App.jsx                  # Root + auth state (localStorage JWT)
│       ├── index.css                # Dark-first design system
│       └── components/
│           ├── Auth.jsx             # Login / Sign Up with MongoDB JWT
│           ├── Dashboard.jsx        # Main analysis dashboard + charts
│           ├── LandingPage.jsx      # Marketing landing page
│           └── Documentation.jsx   # In-app architecture docs
│
└── 🤖 .github/workflows/ci.yml     # GitHub Actions CI/CD
```

---

## ⚙️ Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
```

**`backend/.env`**
```env
GROQ_API_KEY=gsk_your_key
HF_TOKEN=hf_your_token
FINNHUB_KEY=your_finnhub_key
GNEWS_API_KEY=your_gnews_key
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/?appName=Cluster0
JWT_SECRET_KEY=your-32-char-secret
```

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://127.0.0.1:5173
```

---

## 📋 Key Differentiators

| Capability | Implementation |
|:---|:---|
| ✅ Multi-Agent Parallelism | `ThreadPoolExecutor` — 3 agents concurrent |
| ✅ RAG with Citations | TF-IDF DocumentStore — 14 chunks, clickable citations |
| ✅ FinBERT NLP | `ProsusAI/finbert` — real financial sentiment |
| ✅ Personalized Synthesis | Same stock → different signal per risk profile |
| ✅ Conflict Detection | Agent disagreement surfaced, confidence reduced |
| ✅ Degraded Data Handling | Waterfall fallbacks + dataQuality flags |
| ✅ JWT Auth (MongoDB) | Custom bcrypt + python-jose — no third-party SaaS |
| ✅ Performance Metrics | Per-session latency, agreement rate, signal logging |
| ✅ CI/CD | GitHub Actions on every push to main |

> **Research intelligence for informational purposes. Not a guarantee of future performance or a substitute for professional financial advice.**

---

<div align="center">

> **Built with ❤️ for Hackverse Rapid Round**
>
> *"Build the reasoning infrastructure that connects the signals, evidence, and investor context."*

</div>
