import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Shield, Zap, FileText,
  Users, ChevronDown, ChevronUp, ArrowRight, CheckCircle2,
  Search, Activity, Database, Brain, Cpu, Globe
} from 'lucide-react';

const API = 'http://127.0.0.1:8080';

function SignalBadge({ signal = '' }) {
  const s = signal.toUpperCase();
  if (s.includes('BULLISH'))  return <span className="badge badge-green">● {s}</span>;
  if (s.includes('BEARISH'))  return <span className="badge badge-red">● {s}</span>;
  if (s.includes('CAUTION'))  return <span className="badge badge-amber">● {s}</span>;
  if (s.includes('POSITIVE')) return <span className="badge badge-teal">● {s}</span>;
  return <span className="badge badge-neutral">● {s || 'NEUTRAL'}</span>;
}

const FEATURES = [
  { icon: Cpu,      color: '#00C9A7', title: '01 — Parallel Intelligence',  body: 'Three specialized AI agents — Technical, Fundamental, and Sentiment — execute simultaneously and independently for every market query.' },
  { icon: FileText, color: '#3B82F6', title: '02 — Evidence-Grounded',      body: 'The Fundamental Agent retrieves real SEBI filings and earnings transcripts via TF-IDF semantic search. Every claim cites its page and document.' },
  { icon: Users,    color: '#8B5CF6', title: '03 — Personalized',           body: 'Your risk profile and current sector exposure shape the final recommendation. Same market data, different guidance for different investors.' },
  { icon: Shield,   color: '#10B981', title: '04 — Explainable',            body: 'A full reasoning trace shows each agent\'s findings, confidence level, and how conflicts were resolved — before the final synthesis is presented.' },
];

const HOW_IT_WORKS = [
  { step: '01', label: 'Ingest',      desc: 'Live NSE price, volume & SEBI corpus' },
  { step: '02', label: 'Analyse',     desc: 'Three agents run in parallel' },
  { step: '03', label: 'Retrieve',    desc: 'TF-IDF semantic document search' },
  { step: '04', label: 'Synthesize',  desc: 'Agreement checked, conflicts surfaced' },
  { step: '05', label: 'Personalise', desc: 'Risk profile & sector limits applied' },
  { step: '06', label: 'Explain',     desc: 'Cited intelligence returned' },
];

const FAQS = [
  { q: 'How does the multi-agent system work?',
    a: 'Three specialist agents (Technical, Fundamental, Sentiment) run independently in parallel. A Synthesis Agent combines their outputs, detects conflicts, applies your risk profile, and explains the reasoning.' },
  { q: 'Is this financial advice or automated trading?',
    a: 'No. The system is a research intelligence tool for self-directed retail investors. It provides evidence-grounded signals with confidence levels — never guaranteed investment advice.' },
  { q: 'What does RAG-grounded mean?',
    a: 'Retrieval-Augmented Generation: the Fundamental Agent searches a curated corpus of SEBI filings and earnings transcripts, citing the exact document and page for every claim.' },
  { q: 'What does "confidence" mean here?',
    a: 'Confidence reflects the strength and agreement of evidence. It does NOT mean probability of profit. A 78% confidence reading means the system has strong evidence supporting its classification — not a 78% chance of making money.' },
];

export default function LandingPage({ onLaunchDashboard, onViewDocs }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: 'var(--font)', background: '#fff', minHeight: '100vh' }}>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-mark" style={{ width: 32, height: 32, fontSize: 12 }}>AI</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
            Agent<span style={{ color: 'var(--teal)' }}>Finance</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
          <a href="#how-it-works" 
             style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
             onMouseEnter={e => e.target.style.color = 'var(--teal)'}
             onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            How it Works
          </a>
          <button onClick={() => onViewDocs('architecture')} style={{ 
            background: 'none', border: 'none', color: 'var(--text-secondary)', 
            cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'color 0.15s', padding: 0
          }}
          onMouseEnter={e => e.target.style.color = 'var(--teal)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Architecture
          </button>
          <button onClick={() => onViewDocs('agents')} style={{ 
            background: 'none', border: 'none', color: 'var(--text-secondary)', 
            cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'color 0.15s', padding: 0
          }}
          onMouseEnter={e => e.target.style.color = 'var(--teal)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Agents
          </button>
          <button onClick={() => onViewDocs('overview')} style={{ 
            background: 'none', border: 'none', color: 'var(--text-secondary)', 
            cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'color 0.15s', padding: 0
          }}
          onMouseEnter={e => e.target.style.color = 'var(--teal)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Documentation
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onLaunchDashboard}>Log in</button>
          <button className="btn btn-dark btn-teal" onClick={onLaunchDashboard}>
            Launch Terminal <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px 72px', background: 'linear-gradient(160deg,#F0FDF9 0%,#EFF6FF 55%,#F8FAFB 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: 24 }}>
              <span className="pulse-live" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }}/>
              Multi-Agent Investment Intelligence
            </div>
            <h1 className="hero-h1" style={{ marginBottom: 20 }}>
              Turn Market Noise Into<br />
              <span style={{ color: 'var(--teal)' }}>Explainable Intelligence.</span>
            </h1>
            <p className="hero-sub" style={{ marginBottom: 36 }}>
              Multiple specialized AI agents analyze market signals, SEBI filings, and sentiment in parallel — then show you exactly why the system reached its conclusion.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <button className="btn btn-teal btn-lg" onClick={onLaunchDashboard}>
                Launch Intelligence <Zap size={17} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => onViewDocs('overview')}>
                View Documentation
              </button>
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              Research intelligence, not guaranteed investment advice.
            </p>
          </div>

          {/* Live Intelligence Card */}
          <div className="card" style={{ boxShadow: 'var(--shadow-lg)', borderColor: 'var(--border-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>TCS.NS</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tata Consultancy Services</div>
              </div>
              <span className="badge badge-teal pulse-live">● LIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 800 }}>₹3,421</span>
              <span className="delta delta-up"><TrendingUp size={12} /> +2.31%</span>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>MODERATELY BULLISH</span>
                <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: 13 }}>78% confidence</span>
              </div>
              {[
                { label: 'Technical Agent (RSI + MA)', val: 82, color: 'var(--teal)' },
                { label: 'Fundamental RAG (SEBI filings)', val: 81, color: 'var(--green)' },
                { label: 'Sentiment Specialist (news)', val: 64, color: 'var(--amber)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${val}%`, background: color }} /></div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <span>3 parallel agents</span><span>7 RAG sources</span><span>~0.4s latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 48px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Built on verified data:</span>
          {['NSE Live Feeds', 'SEBI Regulatory Filings', 'Q1 FY27 Earnings Transcripts', 'Financial News (GNews)', 'Groq LLM Inference', 'HuggingFace FinBERT'].map(s => (
            <span key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">What we do</div>
            <h2 className="section-heading">Research infrastructure, built for everyone.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                   onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
                   onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 48px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Pipeline</div>
            <h2 className="section-heading">How the Intelligence Engine works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
            {HOW_IT_WORKS.map(({ step, label, desc }, i) => (
              <React.Fragment key={step}>
                <div className="card-flat" style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{step}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {i < 5 && <div style={{ display: 'none' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personalization Demo ─────────────────────────────────── */}
      <section id="personalization" style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Personalization</div>
            <h2 className="section-heading">Same stock. Different investor.</h2>
            <p style={{ marginTop: 12, fontSize: 16, color: 'var(--text-secondary)' }}>
              Identical market data → different guidance based on your risk profile and portfolio exposure.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { risk: 'Conservative', exposure: '22%', signal: 'WATCH / ACCUMULATE ON DIPS', color: 'var(--amber)', bg: 'var(--amber-bg)',
                why: 'Strong fundamental evidence is offset by elevated Technology sector concentration (22%) exceeding your 20% limit. Dollar-cost averaging is recommended.' },
              { risk: 'Aggressive', exposure: '8%', signal: 'CONSIDER / BUY OPPORTUNITY', color: 'var(--green)', bg: 'var(--green-bg)',
                why: 'Strong RSI momentum and SEBI filing evidence align with your high-growth profile. Low current technology exposure (8%) provides ample capacity for position initiation.' },
            ].map(({ risk, exposure, signal, color, bg, why }) => (
              <div key={risk} className="card" style={{ borderColor: color + '40' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="badge badge-neutral">{risk} Investor</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tech Exposure: {exposure}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 12 }}>{signal}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{why}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Same market input. <span style={{ color: 'var(--teal)' }}>Different intelligence.</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '80px 48px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-heading">Common Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card-flat" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15 }}>
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openFaq === i && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Make your next decision<br />with more context.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Research-grade multi-agent intelligence. No subscriptions. Just clarity.
          </p>
          <button className="btn btn-teal btn-lg" onClick={onLaunchDashboard}>
            Launch Terminal <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 48px', background: 'var(--surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-mark" style={{ width: 28, height: 28, fontSize: 11 }}>AI</div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AgentFinance</span>
          </div>
          <span>PS-01 — Multi-Agent Autonomous Financial Intelligence System</span>
          <span>Research intelligence, not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}
