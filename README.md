# Multi-Agent Finance Intelligence Platform

A production-grade, multi-agent AI system for investment intelligence — built for the Hackverse Rapid Round.

## 🚀 Overview

**AI Agent Finance** is an advanced market research platform that orchestrates **three specialized LLM agents** running in parallel to analyze NSE equities. It provides evidence-grounded, explainable investment signals in real-time.

### Core Architecture
- **Technical Agent** — Analyzes RSI, MACD, SMA crossovers, and volume momentum
- **Fundamental Agent** — Performs RAG-grounded analysis on SEBI filings and earnings transcripts
- **Sentiment Agent** — Processes real-time news via FinBERT NLP
- **Synthesis Agent** — Orchestrates conflicts, applies risk profile, generates final signal

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite + Recharts + Mermaid |
| **Backend** | FastAPI + Python 3.11 |
| **LLM** | Groq API (Qwen 2.5) |
| **Market Data** | yfinance (Yahoo Finance) |
| **News** | Finnhub → Yahoo Finance → GNews (waterfall) |
| **NLP** | HuggingFace FinBERT |
| **RAG** | TF-IDF Semantic Retrieval |
| **Auth** | Supabase |
| **CI/CD** | GitHub Actions |

## 📦 Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys in .env
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
# Create frontend/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
FINNHUB_KEY=your_finnhub_key
GNEWS_API_KEY=your_gnews_key
```

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/analyze` | Run full multi-agent pipeline |
| `GET` | `/api/profile` | Get investor profile |
| `GET` | `/api/documents` | List RAG corpus |
| `GET` | `/api/performance` | Session metrics |

## 📊 Features

- ✅ Real-time market data (NSE/yfinance)
- ✅ Parallel 3-agent architecture (ThreadPoolExecutor)
- ✅ TF-IDF RAG retrieval with source citations
- ✅ FinBERT sentiment analysis
- ✅ Waterfall news provider (Finnhub → Yahoo → GNews → fallback)
- ✅ Risk-profile personalization (Conservative / Aggressive)
- ✅ Supabase authentication
- ✅ Interactive Documentation with Mermaid diagrams
- ✅ GitHub Actions CI/CD pipeline

## 🏆 Hackverse Rapid Round — Team Submission
