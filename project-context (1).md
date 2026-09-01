# PS-01 — Multi-Agent Autonomous Financial Intelligence System
## Complete Project Context

> **Purpose of this document:** This is the source-of-truth context for AI coding/design agents working on the project. Read this before changing architecture, UI, features, APIs, or product behavior.

---

# 1. Project Identity

## Working Product Category

**Multi-Agent Autonomous Financial Intelligence System for Retail Investors**

## Core idea

Build an AI-powered research system that converts:

- Market data
- Financial/regulatory filings
- News and sentiment
- User portfolio state
- User risk preferences
- Behavioral signals

into:

> **Personalized, explainable, evidence-grounded investment intelligence.**

The system is not simply a stock screener and not simply a chatbot.

Its core differentiator is an **orchestrated multi-agent reasoning layer**.

---

# 2. Problem Being Solved

India has abundant financial data, but retail investors often receive disconnected information:

- Price charts
- Headlines
- Filings
- Indicators
- Telegram/social signals

The missing layer is coordinated interpretation.

Professional investment organizations can run multiple research functions simultaneously:

- Technical research
- Fundamental research
- Sentiment research
- Macro research
- Risk analysis

Retail investors generally cannot.

The product attempts to close this infrastructure gap by making coordinated, explainable research accessible to retail users.

---

# 3. Core Product Promise

> **Multiple AI perspectives. One explainable view of what the market means for you.**

The product should answer:

### What happened?

Market event/signals.

### Why did it happen?

Evidence and analysis.

### What do different specialists think?

Technical, fundamental, sentiment agents.

### Where do they disagree?

Conflict detection.

### What does it mean for me?

Risk profile + portfolio personalization.

### Why did the system reach its conclusion?

Transparent structured reasoning + citations.

---

# 4. Target User

Primary user:

**Retail investor in India**

Especially:

- First-time investors
- Young investors
- Self-directed investors
- Investors without professional research infrastructure
- Investors overwhelmed by financial information

The interface must not assume professional financial knowledge.

Complex information should be progressively disclosed.

---

# 5. Product Positioning

Do not position the product as:

> "An AI that tells you which stocks to buy."

Position it as:

> **AI-powered investment research and intelligence.**

The system helps users understand evidence and risk.

It should avoid unconditional financial instructions.

Recommended language:

- Bullish
- Moderately Bullish
- Neutral
- Caution
- Bearish
- Consider
- Watch
- Monitor
- Research further

Always communicate uncertainty.

---

# 6. Minimum Requirements Mapping

The project must satisfy all of these:

## Requirement 1 — Multi-dimensional signal classification

At least three independent dimensions:

1. Price/technical momentum
2. Fundamental information
3. Sentiment/news

Each produces:

- Signal
- Confidence
- Structured reasoning
- Relevant evidence where available

---

## Requirement 2 — RAG

At least one agent must retrieve financial documents and ground its output in them.

Pipeline:

```text
Financial document
        ↓
Parse
        ↓
Chunk
        ↓
Embed
        ↓
Vector database
        ↓
Semantic retrieval
        ↓
Fundamental Agent
        ↓
Cited output
```

The user must be able to see the source.

---

## Requirement 3 — Multi-agent architecture

Minimum:

```text
Technical Agent
Fundamental Agent
Sentiment Agent
```

All three should execute independently/in parallel when possible.

Then:

```text
Synthesis Agent
```

combines their structured outputs.

---

## Requirement 4 — Personalization

User profile must contain individually stored parameters.

Example:

```json
{
  "riskTolerance": "moderate",
  "investmentHorizon": "3-5 years",
  "maxSectorConcentration": 25,
  "portfolio": [],
  "behaviorSignals": {}
}
```

The same market input must be capable of producing different final intelligence for different users.

---

## Requirement 5 — Live interface

At minimum show:

- Current market signal
- Classification
- Confidence
- Agent outputs
- Synthesized output
- Source attribution
- Portfolio/watchlist

---

## Requirement 6 — Performance logging

At least three measurable metrics:

1. Agent response latency
2. Signal accuracy against a defined forward-return evaluation
3. Portfolio risk/concentration score

Optional:

- Agent agreement rate
- Retrieval latency
- Synthesis latency
- Number of sources
- Data freshness

---

## Requirement 7 — End-to-end demo

Required flow:

```text
RAW DATA
   ↓
DATA NORMALIZATION
   ↓
PARALLEL AGENTS
   ↓
DOCUMENT RETRIEVAL
   ↓
AGENT RESULTS
   ↓
SYNTHESIS
   ↓
USER PROFILE
   ↓
PERSONALIZED INTELLIGENCE
   ↓
CITED UI
```

The entire chain must be visible.

---

## Requirement 8 — Degraded data

At least one degraded-data scenario must work.

Examples:

- Market API unavailable
- Filing unavailable
- News unavailable
- Conflicting agent outputs

The system must:

- Detect failure
- Communicate it
- Lower confidence when appropriate
- Avoid fabricating missing information
- Avoid generating uncited claims
- Continue safely where possible

---

# 7. Recommended Architecture

```text
                    FRONTEND
              React + Vite + Tailwind
                         │
                         ▼
                    FASTAPI API
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   MARKET DATA         FILINGS          NEWS
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                 DATA NORMALIZATION
                         │
                         ▼
              ┌─────────────────────┐
              │  AGENT ORCHESTRATOR │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      TECHNICAL      FUNDAMENTAL     SENTIMENT
        AGENT           AGENT          AGENT
          │              │              │
          │              ▼              │
          │        VECTOR RETRIEVAL     │
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  SYNTHESIS AGENT
                         │
                 ┌───────┴────────┐
                 ▼                ▼
            USER PROFILE      PORTFOLIO
                 └───────┬────────┘
                         ▼
              PERSONALIZED OUTPUT
                         │
                         ▼
                    FRONTEND
```

---

# 8. Agent Contracts

Agents should communicate using structured JSON.

## Technical Agent

```json
{
  "agent": "technical",
  "signal": "bullish",
  "confidence": 0.82,
  "findings": [
    {
      "title": "Momentum improving",
      "detail": "Price moved above the selected moving average."
    }
  ],
  "metrics": {
    "rsi": 61,
    "volumeRatio": 1.8
  },
  "timestamp": "..."
}
```

Do not rely on free-form text for inter-agent communication.

---

## Fundamental Agent

```json
{
  "agent": "fundamental",
  "signal": "positive",
  "confidence": 0.81,
  "findings": [],
  "sources": [
    {
      "title": "Quarterly Earnings Filing",
      "page": 14,
      "documentId": "..."
    }
  ],
  "retrievedChunks": []
}
```

Every source must correspond to a real retrieved document.

---

## Sentiment Agent

```json
{
  "agent": "sentiment",
  "signal": "neutral",
  "confidence": 0.64,
  "positiveSignals": [],
  "negativeSignals": [],
  "sources": []
}
```

---

## Synthesis Agent

Input:

```json
{
  "technical": {},
  "fundamental": {},
  "sentiment": {},
  "userProfile": {},
  "portfolio": {}
}
```

Output:

```json
{
  "classification": "moderately_bullish",
  "confidence": 0.76,
  "summary": "...",
  "keyReasons": [],
  "risks": [],
  "portfolioImpact": {},
  "agentAgreement": "2_of_3",
  "sources": [],
  "dataQuality": "good"
}
```

---

# 9. Parallel Execution

Agents should execute concurrently whenever dependencies permit.

Conceptually:

```text
Promise.all([
  technicalAgent(),
  fundamentalAgent(),
  sentimentAgent()
])
```

Then:

```text
results
   ↓
synthesisAgent(results, userProfile, portfolio)
```

The UI should visually communicate parallel execution.

---

# 10. User Profile Model

Example:

```json
{
  "id": "...",
  "riskTolerance": "moderate",
  "investmentHorizon": "3-5 years",
  "maxSectorConcentration": 25,
  "preferredMarkets": ["NSE", "BSE"],
  "portfolio": [
    {
      "symbol": "TCS",
      "quantity": 20,
      "averagePrice": 3200
    }
  ],
  "behaviorSignals": {
    "frequentTrading": false,
    "panicSelling": false,
    "averageHoldingPeriod": "long"
  }
}
```

Behavioral data should be used responsibly.

Do not infer sensitive personal traits.

---

# 11. Personalization Logic

The synthesis layer should not change raw market facts.

It changes the interpretation/context.

Example:

```text
MARKET FACT
Technology stock has positive momentum.

USER A
High technology exposure
Low risk tolerance

→ WATCH / CAUTION

USER B
Low technology exposure
High risk tolerance

→ CONSIDER
```

The same factual market data must remain identical.

---

# 12. RAG Architecture

Recommended:

```text
Documents
   ↓
Parser
   ↓
Text normalization
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector DB
   ↓
Semantic search
   ↓
Top-k evidence
   ↓
Fundamental Agent
```

Each chunk should store metadata:

```json
{
  "documentId": "...",
  "company": "TCS",
  "documentType": "earnings",
  "date": "...",
  "page": 14,
  "sourceUrl": "...",
  "text": "..."
}
```

---

# 13. Source Attribution Rules

Never generate a source that was not actually retrieved.

Every citation should have:

- Document title
- Date if available
- Page/section if available
- Source identifier/link where appropriate

UI:

```text
Reason:
Operating margin expanded.

[ Earnings Filing · p.14 ]
```

Click:

```text
Source document
Retrieved excerpt
Document metadata
```

---

# 14. Market Data

The application should abstract market data behind an adapter.

Example:

```text
MarketDataProvider
├── getQuote()
├── getHistoricalPrices()
├── getVolume()
├── getIndicators()
└── getOptionsData()
```

This allows changing providers without rewriting agents.

Do not hard-code a provider into agent logic.

---

# 15. AI Providers

The architecture should also abstract LLM access.

Example:

```text
LLMProvider
├── generate()
├── generateStructured()
└── healthCheck()
```

Potential development providers include:

- Groq
- Hugging Face

The application should support environment variables rather than hard-coded secrets.

Example:

```env
GROQ_API_KEY=
HF_TOKEN=
```

Never commit secrets to GitHub.

---

# 16. Hugging Face Usage

Potential roles:

### FinBERT

Financial sentiment classification.

### BGE or another embedding model

Document embeddings for RAG.

### Open instruct models

Agent experimentation/local inference where appropriate.

Important:

Hugging Face hosted inference may have free-tier limits. The architecture must not assume unlimited hosted inference.

---

# 17. Groq Usage

Use Groq as a high-speed LLM inference option when appropriate.

Potential uses:

- Technical Agent reasoning
- Fundamental Agent reasoning
- Sentiment summarization
- Synthesis Agent

Keep prompts structured and outputs machine-readable.

---

# 18. Prompt Architecture

Each agent should have:

### System role

Defines its domain.

### Input contract

Defines exact available data.

### Reasoning policy

Defines how evidence should be evaluated.

### Output schema

Strict JSON.

### Safety policy

No fabricated data.
No fabricated sources.
No certainty beyond evidence.

---

# 19. Synthesis Logic

Synthesis should consider:

```text
Technical evidence
+
Fundamental evidence
+
Sentiment evidence
+
Agent confidence
+
Agent agreement/disagreement
+
User risk
+
Portfolio concentration
+
Data freshness
```

It should explicitly identify:

- Supporting evidence
- Contradicting evidence
- Missing evidence
- Portfolio implications
- Confidence limitations

---

# 20. Confidence Rules

Confidence is not the same as expected return.

Example:

```text
Confidence: 78%
```

means:

> The system has relatively strong evidence supporting its classification under the defined methodology.

It does NOT mean:

> There is a 78% chance of profit.

Avoid ambiguous language.

---

# 21. Conflict Resolution

When agents disagree:

```text
Technical:
BULLISH 82%

Fundamental:
POSITIVE 76%

Sentiment:
CAUTION 71%
```

Synthesis should not simply majority-vote.

It should explain:

```text
Technical and fundamental signals align,
while sentiment introduces short-term uncertainty.

Final:
MODERATELY BULLISH

Confidence:
68%
```

---

# 22. Data Quality

Every final result should carry:

```text
dataQuality:
  good
  degraded
  insufficient
```

If essential data is unavailable:

```text
insufficient
```

No actionable classification should be presented when required evidence is missing.

---

# 23. Degraded Data Strategy

### Market data unavailable

- Mark technical analysis unavailable
- Use last verified timestamp
- Do not present stale data as live
- Lower confidence
- Do not produce a strong actionable signal

### Filing unavailable

- Fundamental analysis becomes partial
- Clearly state evidence gap
- Do not fabricate a filing source

### News unavailable

- Sentiment becomes unavailable or stale
- State timestamp

### Agent conflict

- Keep both outputs
- Explain conflict
- Reduce synthesis confidence when appropriate

---

# 24. Performance Logging

Each analysis session should create a record.

Example:

```json
{
  "sessionId": "...",
  "symbol": "TCS",
  "timestamp": "...",
  "technicalLatencyMs": 1800,
  "fundamentalLatencyMs": 2100,
  "sentimentLatencyMs": 1200,
  "synthesisLatencyMs": 900,
  "totalLatencyMs": 5000,
  "agentAgreement": 0.67,
  "signalConfidence": 0.76,
  "portfolioConcentration": 0.23
}
```

Later evaluation can add:

```text
30-day forward return
signal correctness
```

---

# 25. Dashboard Requirements

Dashboard must show:

## Market

- Symbol
- Price
- Change
- Chart
- Volume
- Signal

## Agents

- Technical signal
- Fundamental signal
- Sentiment signal
- Confidence
- Status

## Synthesis

- Classification
- Confidence
- Summary
- Reasons
- Risks
- Portfolio impact

## Evidence

- Sources
- Retrieved excerpts
- Document metadata

## User

- Risk profile
- Portfolio
- Sector exposure
- Concentration

## System

- Latency
- Data freshness
- Agent agreement

---

# 26. Landing Page Requirements

Landing page sections:

```text
Navbar
Hero
Data Trust
Features
How It Works
Agent Architecture
Same Stock / Different Investor
Reasoning Trace
Performance Metrics
FAQ
CTA
Footer
```

The landing page is a product explanation.

The dashboard is the proof.

---

# 27. Design Language

Use:

```text
Dark-first
Premium
Minimal
Financial
Technical
Trustworthy
Data-dense but readable
```

Avoid generic SaaS design.

Primary visual metaphor:

> **An AI research desk working in parallel.**

---

# 28. Brand Voice

Tone:

- Clear
- Intelligent
- Calm
- Precise
- Responsible
- Human

Avoid:

- Hype
- Guaranteed outcomes
- Fear
- Overly technical jargon
- "Magic AI"

Example:

Bad:

> Our revolutionary AI predicts the market with 99% accuracy!

Good:

> Three specialized agents independently analyze the signal, evidence, and portfolio context before producing a cited synthesis.

---

# 29. Demo Scenario

The primary judging demo should use one stock and one clearly defined portfolio.

Example:

```text
Stock:
TCS

Market:
Live/simulated market feed

Agents:
Technical
Fundamental
Sentiment

User:
Moderate risk

Portfolio:
Technology exposure already present
```

Demo sequence:

```text
1. Select TCS
2. Market data loads
3. Three agents start simultaneously
4. Agent cards update independently
5. Fundamental Agent retrieves filing evidence
6. Sentiment Agent processes news
7. Conflict/Agreement appears
8. Synthesis begins
9. Portfolio context is applied
10. Final intelligence appears
11. User opens evidence
12. User opens reasoning trace
13. Switch user profile
14. Same stock produces a different personalized interpretation
15. Trigger degraded-data demo
16. Show graceful handling
```

This should take less than approximately 60 seconds for the main story.

---

# 30. Winning Demo Moment

The most important moment should be:

```text
SAME MARKET DATA

          ↓

CONSERVATIVE INVESTOR
WATCH

          vs

AGGRESSIVE INVESTOR
CONSIDER
```

Then explain:

> The market did not change. The investor context did.

This proves personalization rather than merely claiming it.

---

# 31. Judge-Facing Architecture Story

When explaining the project:

> "We don't use one AI to make a market call. We orchestrate independent specialist agents, ground fundamental reasoning in retrieved financial documents, evaluate conflicts, and then apply the user's portfolio and risk context before synthesizing a cited result."

This sentence captures the architecture.

---

# 32. Engineering Principles

## Separate data from reasoning

Agents should never directly own data-provider logic.

## Separate reasoning from presentation

Backend returns structured intelligence.

Frontend renders it.

## Use schemas

Agent-to-agent communication must be structured.

## Fail safely

Missing data must never become fabricated data.

## Make everything observable

Log:

- Agent status
- Latency
- Confidence
- Sources
- Data freshness
- Errors

## Keep provider adapters replaceable

Market and LLM providers should be swappable.

---

# 33. Suggested Project Structure

```text
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── market/
│   │   │   ├── agents/
│   │   │   ├── portfolio/
│   │   │   ├── evidence/
│   │   │   └── performance/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── ...
│
├── backend/
│   ├── agents/
│   │   ├── technical.py
│   │   ├── fundamental.py
│   │   ├── sentiment.py
│   │   └── synthesis.py
│   │
│   ├── data/
│   │   ├── market.py
│   │   ├── news.py
│   │   └── filings.py
│   │
│   ├── rag/
│   │   ├── ingestion.py
│   │   ├── embeddings.py
│   │   └── retrieval.py
│   │
│   ├── profiles/
│   ├── portfolio/
│   ├── evaluation/
│   ├── api/
│   └── main.py
│
├── data/
│   ├── documents/
│   └── sample/
│
├── docs/
│   ├── design.md
│   ├── project-context.md
│   └── architecture.md
│
└── README.md
```

Adapt to the chosen implementation; do not create unnecessary folders purely to match this example.

---

# 34. Environment Variables

Example:

```env
GROQ_API_KEY=
HF_TOKEN=

MARKET_DATA_API_KEY=
NEWS_API_KEY=

DATABASE_URL=
VECTOR_DATABASE_URL=
```

Never hard-code these values.

Never commit `.env`.

Provide `.env.example`.

---

# 35. Security

Required:

- API keys server-side only
- `.env` in `.gitignore`
- Validate all external inputs
- Rate-limit public endpoints where appropriate
- Sanitize retrieved document content
- Do not expose provider secrets to React
- Log errors without secrets

---

# 36. Financial Safety

The product should not claim:

- Guaranteed returns
- Guaranteed prediction
- Zero risk
- Perfect accuracy

The system should show uncertainty.

Recommended footer:

> **Research intelligence for informational purposes. Not a guarantee of future performance or a substitute for professional financial advice.**

---

# 37. What NOT to Build First

Do not spend early development time on:

- Full brokerage execution
- Automatic trading
- Complex options strategies
- Dozens of agents
- Huge document corpora
- Elaborate social features
- Fake user testimonials
- Excessive charts
- Mobile app before web MVP

First make the core pipeline excellent.

---

# 38. MVP Priority

## P0 — Must work

```text
Market input
+
3 agents
+
RAG
+
Synthesis
+
User profile
+
Portfolio context
+
Citations
+
Reasoning trace
+
Degraded data
```

## P1 — Strong polish

```text
Live dashboard
Animations
Performance page
Watchlist
Portfolio charts
Agent visualization
Responsive design
```

## P2 — Optional

```text
Behavior learning
More agents
Options intelligence
Macro agent
Backtesting
Personal alerts
Advanced analytics
```

---

# 39. Success Criteria

The project is successful when a judge can answer "yes" to:

- Can I see multiple agents working?
- Are their roles genuinely different?
- Is financial evidence actually retrieved?
- Can I click the evidence?
- Does the user profile affect the output?
- Can I see portfolio implications?
- Can I understand why the synthesis happened?
- Does the system handle conflicting agents?
- Does it handle missing data safely?
- Can I see measurable performance?
- Does the demo work end-to-end?
- Does the UI feel like a serious financial product?

---

# 40. Final Product Principle

The product is **not**:

```text
User → AI → Stock Tip
```

The product is:

```text
USER CONTEXT
     │
     ▼
MARKET EVENT
     │
     ▼
┌───────────────────────────────┐
│  TECHNICAL     FUNDAMENTAL    │
│     AGENT          AGENT      │
│                               │
│           SENTIMENT           │
│             AGENT             │
└───────────────┬───────────────┘
                │
                ▼
          EVIDENCE LAYER
                │
                ▼
        CONFLICT / AGREEMENT
                │
                ▼
        SYNTHESIS AGENT
                │
                ▼
      PORTFOLIO + RISK CONTEXT
                │
                ▼
      PERSONALIZED INTELLIGENCE
                │
                ▼
       EXPLAINABLE + CITED UI
```

## The winning idea

> **Don't build an AI that gives investors another signal. Build the reasoning infrastructure that connects the signals, evidence, and investor context.**

Every design and engineering decision should strengthen that idea.
