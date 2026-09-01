# PS-01 — Financial Intelligence System
## Design System & Frontend Specification

> **Design goal:** Build a premium, trustworthy financial-intelligence product that feels closer to a professional research terminal than a generic AI SaaS landing page. The interface must make the multi-agent reasoning visible, understandable, and impressive within seconds.

---

# 1. Product Design Direction

## Product Character

The product should communicate:

- Intelligence
- Trust
- Precision
- Speed
- Explainability
- Financial seriousness
- Modern AI
- Personalization

### Visual references

The design language should feel like a fusion of:

- Professional financial terminal
- Modern AI product
- Linear-style product polish
- Premium fintech dashboard
- Scientific/research interface

Avoid:

- Generic "AI startup" gradients everywhere
- Excessive glassmorphism
- Fake financial charts
- Overly colorful dashboards
- Casino/trading-app aesthetics
- Aggressive "BUY NOW" language
- Fake testimonials or fake partnerships

---

# 2. Design Principle

## The core visual story

Every major screen should reinforce:

```text
RAW DATA
    ↓
MULTIPLE AI PERSPECTIVES
    ↓
EVIDENCE
    ↓
CONFLICT / AGREEMENT
    ↓
USER CONTEXT
    ↓
SYNTHESIS
    ↓
EXPLAINABLE INTELLIGENCE
```

The user should never feel that the system magically produced a recommendation.

The interface must answer:

1. What happened?
2. What did each agent find?
3. What evidence supports it?
4. Where do agents disagree?
5. How does this affect this specific investor?
6. Why did the final synthesis reach its conclusion?

---

# 3. Visual Theme

## Primary Theme

**Dark-first financial intelligence UI**

### Core colors

```text
Background              #070A0F
Surface                 #0D121A
Elevated Surface        #111823
Border                  #202A38

Primary Text            #F4F7FB
Secondary Text          #9AA6B6
Muted Text              #667386

Accent Blue             #4F8CFF
Accent Cyan             #39D6FF

Positive                #35D07F
Warning                 #F5B84B
Negative                #FF5C6C

Purple / AI             #9B7BFF
```

Do not use all accent colors simultaneously. Blue/cyan should be the primary product accent. Green/yellow/red should communicate financial state only.

---

# 4. Typography

Use a clean modern sans-serif.

Preferred:

- Inter
- Geist
- Manrope

### Hierarchy

```text
Display:
64–76px / 700–800

H1:
48–60px / 700

H2:
34–44px / 700

H3:
22–28px / 650

Body:
16–18px / 400–500

Small:
12–14px / 500

Data:
14–16px / 600

Numbers:
Use tabular/monospaced numerals where appropriate.
```

Do not make everything bold.

Financial numbers should have strong visual hierarchy.

---

# 5. Layout System

Use a centered max-width:

```text
max-width: 1280px
```

Desktop horizontal padding:

```text
32–48px
```

Mobile:

```text
16–20px
```

Use a 12-column desktop grid.

Prefer generous whitespace.

The product should feel calm and expensive rather than crowded.

---

# 6. Landing Page

The landing page follows the uploaded wireframe's overall hierarchy, but is redesigned specifically for PS-01.

## Section Order

```text
1. Navbar
2. Hero
3. Data Trust Strip
4. Core Intelligence Features
5. How The Intelligence Engine Works
6. Multi-Agent Visualization
7. Same Market / Different Investor
8. Explainability / Reasoning Trace
9. Performance Metrics
10. FAQ
11. Final CTA
12. Footer
```

---

# 7. Navbar

### Desktop

```text
[ LOGO ]

Intelligence    How It Works    Agents    Evidence    FAQ

                         [ Launch Dashboard ]
```

### Behavior

- Sticky
- Slight backdrop blur
- Thin bottom border on scroll
- No oversized navigation
- CTA remains visible

### CTA

Primary CTA:

**Launch Intelligence**

Secondary navigation:

**How It Works**

---

# 8. Hero Section

## Objective

The hero must communicate the entire product concept within 5 seconds.

### Eyebrow

```text
● MULTI-AGENT INVESTMENT INTELLIGENCE
```

### Headline

> **Turn Market Noise Into Explainable Investment Intelligence.**

Alternative:

> **Multiple AI Agents. One Clearer View of the Market.**

### Supporting text

> Analyze market signals, financial filings, sentiment, and portfolio context in parallel — then see exactly why the system reached its conclusion.

### CTA

```text
[ Launch Intelligence ]
[ See How It Works ]
```

---

# 9. Hero Visualization

Do NOT use a generic stock illustration.

Show a live-looking intelligence card.

```text
┌─────────────────────────────────────┐
│ TCS                         ● LIVE   │
│ ₹3,421.50              +2.31%       │
│                                     │
│ MODERATELY BULLISH                  │
│ Confidence                    78%   │
│                                     │
│ Technical       █████████░   82%    │
│ Fundamental     ████████░░   81%    │
│ Sentiment       ██████░░░░   64%    │
│                                     │
│ 3 agents  ·  7 sources  ·  5.8s     │
└─────────────────────────────────────┘
```

Subtle animated data pulses are encouraged.

---

# 10. Trust / Data Source Strip

Instead of fake "partners", use:

## Built on the data investors already rely on

```text
MARKET DATA     REGULATORY FILINGS     EARNINGS
NEWS            SENTIMENT             PORTFOLIO DATA
```

If actual providers are used, display their names accurately.

Never imply an official partnership without one.

---

# 11. Feature Section

Title:

> **Research infrastructure, built for everyone.**

Four primary cards.

### 01 — Parallel Intelligence

**Three specialized agents analyze independently.**

Technical, Fundamental, and Sentiment agents operate in parallel.

### 02 — Evidence-Grounded

**AI reasoning backed by retrieved financial documents.**

Every important fundamental claim should link to its source.

### 03 — Personalized

**The same market can mean different things to different investors.**

Risk tolerance, portfolio concentration, and behavioral context modify synthesis.

### 04 — Explainable

**Never hide the path to the conclusion.**

Show agent outputs, evidence, confidence, conflicts, and synthesis.

---

# 12. How It Works

Use a horizontal process on desktop and vertical timeline on mobile.

```text
01 INGEST
Market + News + Filings

        ↓

02 ANALYZE
Technical + Fundamental + Sentiment

        ↓

03 RETRIEVE
Relevant evidence from document corpus

        ↓

04 SYNTHESIZE
Resolve agreement and conflicts

        ↓

05 PERSONALIZE
Apply portfolio + risk context

        ↓

06 EXPLAIN
Return cited intelligence
```

Animate the active step as the user scrolls.

---

# 13. Multi-Agent Visualization

This is one of the hero features of the design.

```text
                    MARKET EVENT
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     TECHNICAL       FUNDAMENTAL     SENTIMENT
       AGENT            AGENT           AGENT
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  SYNTHESIS AGENT
                         │
                 ┌───────┴───────┐
                 ↓               ↓
            RISK PROFILE     PORTFOLIO
                 └───────┬───────┘
                         ↓
                 FINAL INTELLIGENCE
```

### Interaction

Hover/click an agent:

```text
Agent active
↓
Show its role
↓
Show confidence
↓
Show 2–3 findings
↓
Show relevant evidence
```

Use connecting lines with subtle motion.

---

# 14. Agent Cards

Each agent card should have:

```text
AGENT STATUS
● COMPLETED

Agent Name

Signal
Confidence

Key Findings
• Finding 1
• Finding 2
• Finding 3

Sources
2

Latency
1.7s
```

Avoid exposing hidden chain-of-thought.

The UI should show **structured reasoning summaries and evidence**, not private/internal chain-of-thought.

---

# 15. Same Market / Different Investor

This section directly demonstrates personalization.

## Heading

> **Same stock. Different investor.**

Two side-by-side profiles.

### Conservative Investor

```text
RISK PROFILE
Conservative

PORTFOLIO EXPOSURE
Technology: 22%

SYSTEM SIGNAL
WATCH

WHY
Positive fundamentals are offset by
existing sector concentration and
elevated volatility.
```

### Aggressive Investor

```text
RISK PROFILE
Aggressive

PORTFOLIO EXPOSURE
Technology: 8%

SYSTEM SIGNAL
CONSIDER

WHY
Momentum and fundamentals align with
the investor's higher risk tolerance
and current portfolio exposure.
```

Footer statement:

> **Same market input. Different intelligence.**

This should be one of the most visually prominent sections.

---

# 16. Reasoning Trace

## Heading

> **See the reasoning, not just the result.**

Display a terminal-style trace:

```text
12:01:02  ✓ Market data received
12:01:03  ✓ Technical Agent started
12:01:03  ✓ Fundamental Agent started
12:01:03  ✓ Sentiment Agent started

12:01:04  ✓ Momentum analyzed
12:01:05  ✓ Filing evidence retrieved
12:01:05  ✓ Sentiment classified

12:01:06  ⚠ Agents disagree on short-term outlook

12:01:07  ✓ Portfolio concentration evaluated
12:01:08  ✓ Synthesis completed
```

Use timestamps and status indicators.

---

# 17. Evidence / Citation UI

Every RAG-grounded claim should have a visible citation chip.

Example:

```text
Revenue growth accelerated during the quarter.
[Q1 FY27 Earnings Filing · p.14]
```

Clicking the citation should open:

```text
SOURCE
Q1 FY27 Earnings Filing

Document date
...

Retrieved because:
"revenue growth and margin expansion"

Relevant excerpt
...

Source confidence
High
```

Never create fake citations.

---

# 18. Signal Classification

Use five states:

```text
BULLISH
MODERATELY BULLISH
NEUTRAL
CAUTION
BEARISH
```

Use color sparingly.

Always display confidence separately:

```text
BULLISH
78% confidence
```

Never equate confidence with probability of profit.

---

# 19. Conflict Handling

Conflicting signals are a feature, not a failure.

Example:

```text
⚠ SIGNAL CONFLICT

Technical Agent
BULLISH · 82%

Sentiment Agent
CAUTION · 71%

Why:
Recent price momentum is positive,
but negative regulatory news may
increase short-term uncertainty.

Synthesis confidence reduced:
81% → 68%
```

This is an important differentiator.

---

# 20. Degraded Data UI

When a data source fails:

```text
⚠ MARKET DATA TEMPORARILY UNAVAILABLE

Last verified snapshot
10:42 AM IST

Technical Agent
Unavailable

Fundamental Agent
Available

Sentiment Agent
Available

FINAL STATUS
PARTIAL ANALYSIS

No actionable signal generated until
market data is refreshed.
```

The system should never pretend stale data is live.

---

# 21. Dashboard Design

The dashboard is the actual application.

### Main layout

```text
┌───────────────────────────────────────────────────────┐
│ NAVBAR                                                │
├──────────────┬────────────────────────────────────────┤
│              │ MARKET OVERVIEW                        │
│ WATCHLIST    │                                        │
│              │ Selected Stock                         │
│ TCS          │ Price / Change / Chart                 │
│ INFY         │                                        │
│ HDFC         ├────────────────────────────────────────┤
│ RELIANCE     │ AGENT SIGNALS                          │
│              │ Technical | Fundamental | Sentiment   │
│              ├────────────────────────────────────────┤
│              │ SYNTHESIS                              │
│              │ Final Intelligence                     │
│              ├────────────────────────────────────────┤
│              │ EVIDENCE + REASONING TRACE             │
│              │                                        │
├──────────────┴────────────────────────────────────────┤
│ PORTFOLIO RISK / EXPOSURE / PERFORMANCE               │
└───────────────────────────────────────────────────────┘
```

---

# 22. Dashboard Navigation

Recommended:

```text
Overview
Signals
Research
Portfolio
Agent Trace
Performance
Settings
```

Mobile:

Use bottom navigation or compact drawer.

---

# 23. Portfolio Visualization

Show:

- Total portfolio value
- Day change
- Sector exposure
- Concentration score
- Risk level
- Watchlist
- Largest positions

Example:

```text
PORTFOLIO RISK

Concentration
████████░░  78 / 100

Technology
22%

Financials
31%

Energy
17%

Other
30%
```

Avoid pretending to calculate a professional risk score unless the formula is documented.

---

# 24. Performance Page

Required metrics:

```text
Signal accuracy
Agent latency
Portfolio concentration
Agent agreement rate
Source retrieval latency
Forward-return evaluation
```

Use clear definitions.

Example:

```text
SIGNAL EVALUATION
30-day forward return

Accuracy
64%

Sample size
127 signals
```

Never present backtests as guaranteed future performance.

---

# 25. Microinteractions

Use subtle animations:

- Agent nodes pulse while processing
- Progress bars animate once
- Number counters ease into values
- Citation chips glow briefly when retrieved
- Confidence meters animate from 0 → value
- Status changes use short transitions
- Skeleton loaders during data retrieval

Avoid:

- Excessive parallax
- Spinning dashboards
- Flashing stock prices
- Infinite animated charts
- Distracting particle backgrounds

---

# 26. Responsive Design

## Desktop

Use multi-column intelligence dashboard.

## Tablet

Collapse secondary panels.

## Mobile

Priority:

```text
Stock
↓
Signal
↓
Confidence
↓
Why
↓
Evidence
↓
Agent details
↓
Portfolio impact
```

Do not squeeze the desktop dashboard into mobile.

---

# 27. Accessibility

Minimum:

- WCAG-conscious contrast
- Keyboard navigation
- Visible focus states
- Semantic headings
- Buttons with labels
- No information conveyed by color alone
- Screen-reader-friendly status labels

Example:

Instead of only a green dot:

```text
● BULLISH
```

---

# 28. Safety / Trust Language

Use:

> **Research intelligence, not guaranteed investment advice.**

Avoid:

- "Guaranteed returns"
- "AI knows the future"
- "Risk-free"
- "Perfect signals"
- "Guaranteed profit"

The product should feel responsible.

---

# 29. Landing Page Copy

### Hero

> Turn Market Noise Into Explainable Investment Intelligence.

### Subheading

> Multiple specialized AI agents analyze market signals, financial documents, sentiment, and portfolio context — then show you the evidence behind the result.

### Feature heading

> Research infrastructure, built for everyone.

### Personalization heading

> Same stock. Different investor.

### Explainability heading

> See the reasoning, not just the result.

### CTA

> **Make the next decision with more context.**

CTA:

**Launch Intelligence**

---

# 30. Final Quality Bar

Before calling the frontend complete, verify:

- No generic template feeling
- No fake partnerships
- No fake testimonials
- No unexplained AI output
- Every important financial claim has evidence
- Confidence is visible
- Agent roles are obvious
- Conflicting signals are visible
- User profile changes synthesis
- Portfolio impact is visible
- Degraded-data states exist
- Loading states exist
- Mobile layout works
- Financial terminology is consistent
- No visual element exists purely for decoration

## Golden rule

> **The interface should make the intelligence observable.**

The strongest visual moment is:

```text
DATA
  ↓
3 AGENTS
  ↓
EVIDENCE
  ↓
CONFLICT
  ↓
USER CONTEXT
  ↓
SYNTHESIS
  ↓
EXPLAINABLE RESULT
```

That is the product.
