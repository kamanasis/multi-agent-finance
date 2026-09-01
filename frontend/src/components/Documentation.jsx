import React, { useState, useEffect, useRef } from 'react';
import {
  Book, Zap, Cpu, Database, Network, Key, Terminal, HelpCircle,
  Shield, Brain, Globe, ChevronRight, Menu, X, ArrowLeft
} from 'lucide-react';
import mermaid from 'mermaid';

const SECTIONS = [
  { id: 'overview',     label: 'Overview',              icon: Book },
  { id: 'quickstart',   label: 'Quick Start',           icon: Zap },
  { id: 'architecture', label: 'Architecture',          icon: Network },
  { id: 'agents',       label: 'Market Agents',         icon: Cpu },
  { id: 'rag',          label: 'RAG Retrieval',         icon: Database },
  { id: 'security',     label: 'Security Model',        icon: Shield },
  { id: 'api',          label: 'API Reference',         icon: Terminal },
  { id: 'faq',          label: 'FAQ',                   icon: HelpCircle },
];

function MermaidDiagram({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      fontFamily: 'Inter, system-ui, sans-serif'
    });
    
    if (ref.current) {
      mermaid.render('mermaid-' + Date.now(), chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch(e => console.error(e));
    }
  }, [chart]);

  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center', background: '#0D1117', padding: 24, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }} />;
}

export default function Documentation({ initialSection = 'overview', onBack }) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Content renderers for each section
  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Platform Documentation</h2>
            <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32 }}>The multi-agent investment intelligence platform</p>
            <p style={{ fontSize: 15, color: '#E2E8F0', lineHeight: 1.7, marginBottom: 40 }}>
              AI Agent Finance is an advanced market intelligence system built using parallel specialized LLM agents. 
              It allows investors to issue complex market research queries and enables anyone to verify the authenticity 
              of the findings in seconds via RAG — without trusting any single central LLM or hallucinated data.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
              {[
                { icon: Shield, title: 'Trustless Verification', desc: 'Agent findings are verified against an immutable document registry — no hallucinations, no single point of failure.' },
                { icon: Brain, title: 'AI Evidence Engine', desc: 'Machine learning models scan SEBI filings and earnings reports for sentiment, anomalies, and heuristic red flags in real-time.' },
                { icon: Globe, title: 'Global Coverage', desc: 'Investors worldwide can submit queries, customize risk profiles, and request intelligence on NSE equities.' }
              ].map(card => (
                <div key={card.title} style={{ background: '#151B23', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 24 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <card.icon size={18} color="#94A3B8" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'architecture':
        const archChart = `
          graph TD
            User([Investor / Client]) -->|API Request| FastAPI[FastAPI Backend]
            FastAPI --> MarketData[yfinance Market Data]
            FastAPI --> NewsData[News Provider]
            
            MarketData --> TechAgent[Technical Agent]
            NewsData --> SentAgent[Sentiment Agent]
            
            FastAPI --> RAG[TF-IDF RAG Retriever]
            RAG -->|SEBI Filings| FundAgent[Fundamental Agent]
            
            TechAgent --> Synth[Synthesis Agent]
            SentAgent --> Synth
            FundAgent --> Synth
            
            Synth -->|Final Signal & Trace| User
            
            style User fill:#0f172a,stroke:#38bdf8
            style FastAPI fill:#1e293b,stroke:#94a3b8
            style Synth fill:#064e3b,stroke:#10b981
        `;
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>System Architecture</h2>
            <p style={{ fontSize: 15, color: '#E2E8F0', lineHeight: 1.7, marginBottom: 32 }}>
              The platform orchestrates three independent specialist agents running in parallel, synthesized by a master agent to eliminate individual LLM bias and hallucination.
            </p>
            <MermaidDiagram chart={archChart} />
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 12 }}>Pipeline Flow</h3>
              <ol style={{ paddingLeft: 20, color: '#94A3B8', lineHeight: 1.8, fontSize: 14 }}>
                <li><strong>Ingestion:</strong> Live market data and news are fetched asynchronously.</li>
                <li><strong>Parallel Execution:</strong> Technical, Sentiment, and Fundamental agents analyze their respective domains independently.</li>
                <li><strong>Retrieval (RAG):</strong> The Fundamental agent uses TF-IDF to ground its analysis in real SEBI documents.</li>
                <li><strong>Synthesis:</strong> The master Synthesis Agent checks for agreement, applies the user's risk profile, and generates the final output.</li>
              </ol>
            </div>
          </div>
        );

      case 'quickstart':
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Quick Start Guide</h2>
            <div style={{ background: '#040507', padding: 20, borderRadius: 8, fontFamily: 'monospace', color: '#E2E8F0', marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#64748B', marginBottom: 8 }}># 1. Clone & install backend dependencies</div>
              <div>cd backend</div>
              <div>pip install -r requirements.txt</div>
              <br/>
              <div style={{ color: '#64748B', marginBottom: 8 }}># 2. Add API keys to .env</div>
              <div>cp .env.example .env</div>
              <br/>
              <div style={{ color: '#64748B', marginBottom: 8 }}># 3. Start backend (Terminal 1)</div>
              <div>python -m uvicorn main:app --reload</div>
              <br/>
              <div style={{ color: '#64748B', marginBottom: 8 }}># 4. Start frontend (Terminal 2)</div>
              <div>cd frontend</div>
              <div>npm install</div>
              <div>npm run dev</div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Market Agents</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { name: 'Technical Agent', desc: 'Analyzes pure price action, volume, RSI, and Moving Averages. Employs a Groq-powered LLM with a fallback rule engine.' },
                { name: 'Fundamental Agent', desc: 'Reads and interprets real SEBI filings and earnings transcripts via our RAG pipeline to assess corporate health.' },
                { name: 'Sentiment Agent', desc: 'Processes real-time news headlines. Normally uses HuggingFace FinBERT; falls back to keyword heuristics if the model is warming up.' },
                { name: 'Synthesis Agent', desc: 'The orchestrator. Checks the 3 sub-agents for conflicts. If Technical is bullish but Fundamental is bearish, it flags the conflict.' },
              ].map(a => (
                <div key={a.name} style={{ background: '#151B23', padding: 20, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#38BDF8', fontSize: 16, marginBottom: 8 }}>{a.name}</h4>
                  <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>API Reference</h2>
            <div style={{ background: '#040507', padding: '16px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
              <span style={{ color: '#10B981', fontWeight: 700, marginRight: 12 }}>POST</span>
              <span style={{ color: '#E2E8F0', fontFamily: 'monospace' }}>/api/analyze</span>
            </div>
            <p style={{ color: '#94A3B8', marginBottom: 16 }}>Triggers a full multi-agent pipeline run.</p>
            <h4 style={{ color: '#fff', marginBottom: 12 }}>Request Body</h4>
            <pre style={{ background: '#151B23', padding: 16, borderRadius: 8, color: '#38BDF8', fontSize: 13, border: '1px solid rgba(255,255,255,0.06)' }}>
{`{
  "symbol": "TCS",
  "profile_type": "conservative", // conservative | aggressive
  "degraded_mode": false          // force API fallback simulation
}`}
            </pre>
          </div>
        );

      default:
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 24 }}>{SECTIONS.find(s=>s.id===activeSection)?.label}</h2>
            <p style={{ color: '#94A3B8' }}>Content for this section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#090B0F', minHeight: '100vh', color: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', background: '#040507' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Home
          </button>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Documentation</span>
        </div>
        <button className="mobile-only" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#E2E8F0', cursor: 'pointer' }}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: 260, background: '#0A0D12', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', marginBottom: 16, paddingLeft: 12 }}>SECTIONS</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map(s => {
              const active = activeSection === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: active ? '#fff' : '#94A3B8',
                    border: 'none', padding: '10px 12px', borderRadius: 6,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => !active && (e.currentTarget.style.color = '#94A3B8')}
                >
                  <Icon size={16} /> {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', padding: '48px 60px' }}>
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Developer & User Guide</div>
            <h1 style={{ fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>Documentation</h1>
            <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.6, marginBottom: 48, maxWidth: 640 }}>
              Comprehensive guides, architecture diagrams, agent references, and API documentation for AI Agent Finance.
            </p>

            <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '40px' }}>
              {renderContent()}
              
              {activeSection === 'overview' && (
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 40 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #38BDF8' }} />
                  <div style={{ fontSize: 14, color: '#E2E8F0' }}>
                    AI Agent Finance runs on local inference or secure cloud providers. API keys can be obtained from Groq at <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>console.groq.com</span>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 768px) {
          aside { display: \${sidebarOpen ? 'flex' : 'none'} !important; position: absolute; z-index: 10; height: calc(100vh - 60px); }
          main { padding: 24px !important; }
        }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
