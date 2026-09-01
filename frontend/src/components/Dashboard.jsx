import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Activity, FileText,
  Settings, X, RefreshCw, AlertTriangle, ChevronRight,
  BarChart2, Shield, Cpu, Database, Terminal, Bell,
  User, Search, ArrowUpRight, ArrowDownRight, ExternalLink, ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, CartesianGrid
} from 'recharts';

const API = 'http://127.0.0.1:8080';

// ── Helpers ───────────────────────────────────────────────────────────────────

function signalColor(sig = '') {
  const s = sig.toLowerCase();
  if (s.includes('bullish') || s.includes('positive'))  return 'var(--green)';
  if (s.includes('bearish') || s.includes('negative'))  return 'var(--red)';
  if (s.includes('caution') || s.includes('cautious'))  return 'var(--amber)';
  return 'var(--text-muted)';
}
function signalBg(sig = '') {
  const s = sig.toLowerCase();
  if (s.includes('bullish') || s.includes('positive'))  return 'var(--green-bg)';
  if (s.includes('bearish') || s.includes('negative'))  return 'var(--red-bg)';
  if (s.includes('caution') || s.includes('cautious'))  return 'var(--amber-bg)';
  return 'var(--bg)';
}

function SignalPill({ signal = '', size = 'sm' }) {
  const color  = signalColor(signal);
  const bg     = signalBg(signal);
  const fSize  = size === 'lg' ? 14 : 11;
  const pad    = size === 'lg' ? '5px 14px' : '3px 10px';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:pad,
      borderRadius:999, fontSize:fSize, fontWeight:700, background:bg, color,
      textTransform:'uppercase', letterSpacing:'0.04em', lineHeight:1.4 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:color, display:'inline-block' }} />
      {signal || 'NEUTRAL'}
    </span>
  );
}

function ConfidenceBar({ value = 0, color = 'var(--teal)' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div className="progress-track" style={{ flex:1 }}>
        <div className="progress-fill" style={{ width:`${Math.round(value*100)}%`, background:color }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, minWidth:34, textAlign:'right' }}>
        {Math.round(value*100)}%
      </span>
    </div>
  );
}

function Spinner() {
  return <RefreshCw size={16} className="spinner" style={{ color:'var(--teal)' }} />;
}

// ── Citation Drawer ───────────────────────────────────────────────────────────

function CitationDrawer({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--teal)', marginBottom:4 }}>
              RAG RETRIEVED DOCUMENT
            </div>
            <div style={{ fontWeight:800, fontSize:16 }}>{doc.title}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
          {[
            ['Document Type', doc.doc_type],
            ['Date', doc.date],
            ['Page', doc.page],
          ].map(([label, val]) => (
            <div key={label} style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:'8px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>{label}</div>
              <div style={{ fontWeight:600, fontSize:13 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--bg)', borderRadius:'var(--radius-md)', padding:'16px 20px',
          borderLeft:'3px solid var(--teal)', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--teal)', textTransform:'uppercase', marginBottom:8 }}>Retrieved Excerpt</div>
          <p style={{ fontSize:14, lineHeight:1.7, color:'var(--text-primary)' }}>"{doc.excerpt}"</p>
        </div>

        {doc.retrieved_because && (
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>
            <strong>Retrieved because:</strong> {doc.retrieved_because}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Agent Card ────────────────────────────────────────────────────────────────

function AgentCard({ agent = {}, onCitation }) {
  const names = { technical:'Technical Agent', fundamental:'Fundamental RAG', sentiment:'Sentiment Specialist' };
  const icons = { technical: Cpu, fundamental: Database, sentiment: Activity };
  const Icon  = icons[agent.agent] || Activity;

  return (
    <div className="agent-card fade-in">
      <div className="agent-card-header">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'var(--radius-sm)', background:'var(--teal-light)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={16} color="var(--teal)" />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13 }}>{names[agent.agent] || agent.name}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{agent.powered_by || 'rule_engine'} · {agent.latency_sec}s</div>
          </div>
        </div>
        <SignalPill signal={agent.signal} />
      </div>

      <div className="agent-card-body">
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Confidence</div>
          <ConfidenceBar value={agent.confidence || 0} color={signalColor(agent.signal)} />
        </div>

        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Findings</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(agent.findings || []).slice(0,3).map((f, i) => (
              <div key={i} style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
                <div style={{ fontWeight:600, fontSize:12, marginBottom:2 }}>{f.title}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{f.detail?.slice(0,120)}{f.detail?.length > 120 ? '…' : ''}</div>
                {f.citation && (
                  <button className="citation-chip" style={{ marginTop:6 }} onClick={() => onCitation && onCitation(f)}>
                    <FileText size={10} /> {f.citation}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {agent.sources_count > 0 && (
          <div style={{ marginTop:10, fontSize:11, color:'var(--text-muted)', display:'flex', justifyContent:'space-between' }}>
            <span>Sources grounded: <strong>{agent.sources_count}</strong></span>
            <span>Timestamp: {agent.timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sparkline mini-chart ──────────────────────────────────────────────────────

function Sparkline({ data = [], positive = true }) {
  if (!data.length) return null;
  const color = positive ? 'var(--green)' : 'var(--red)';
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({ onBackToLanding }) {
  const [stocks,       setStocks]       = useState([]);
  const [selectedSym,  setSelectedSym]  = useState('TCS');
  const [profileType,  setProfileType]  = useState('conservative');
  const [degraded,     setDegraded]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [analysis,     setAnalysis]     = useState(null);
  const [performance,  setPerformance]  = useState(null);
  const [citation,     setCitation]     = useState(null);
  const [activeNav,    setActiveNav]    = useState('overview');

  // Load stock list on mount
  useEffect(() => {
    fetch(`${API}/api/stocks`)
      .then(r => r.json()).then(setStocks)
      .catch(console.error);
    fetch(`${API}/api/performance`)
      .then(r => r.json()).then(setPerformance)
      .catch(console.error);
  }, []);

  // Re-run analysis whenever stock / profile / degraded changes
  const runAnalysis = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: selectedSym, profile_type: profileType, degraded_mode: degraded }),
    })
      .then(r => r.json())
      .then(data => { setAnalysis(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedSym, profileType, degraded]);

  useEffect(() => { runAnalysis(); }, [runAnalysis]);

  const md    = analysis?.market_data  || {};
  const synth = analysis?.synthesis    || {};
  const agents = analysis?.agents      || {};
  const prof  = analysis?.user_profile || {};
  const news  = analysis?.news         || {};

  // Build sparkline data for the main chart
  const sparkData = (md.sparkline || []).map((v, i) => ({ day: i + 1, price: v }));

  const handleCitation = (finding) => {
    // Find matching source from fundamental sources
    const sources = agents.fundamental?.sources || [];
    const match = sources.find(s => s.citation === finding.citation) || sources[0];
    if (match) setCitation(match);
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">AI</div>
          <div>
            <div className="logo-name">Agent<span>Finance</span></div>
            <div style={{ fontSize:10, color:'var(--text-on-dark-2)' }}>Intelligence Terminal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main</div>
          {[
            { id:'overview',     Icon: LayoutDashboard, label:'Overview' },
            { id:'signals',      Icon: Activity,        label:'Signals' },
            { id:'research',     Icon: Database,        label:'Research' },
          ].map(({ id, Icon, label }) => (
            <button key={id} className={`nav-item ${activeNav === id ? 'active' : ''}`}
              onClick={() => setActiveNav(id)}>
              <Icon size={16} /> {label}
            </button>
          ))}

          <div className="nav-label" style={{ marginTop:12 }}>Analysis</div>
          {[
            { id:'agents',       Icon: Cpu,      label:'Agent Network' },
            { id:'trace',        Icon: Terminal, label:'Reasoning Trace' },
            { id:'performance',  Icon: BarChart2,label:'Performance' },
          ].map(({ id, Icon, label }) => (
            <button key={id} className={`nav-item ${activeNav === id ? 'active' : ''}`}
              onClick={() => setActiveNav(id)}>
              <Icon size={16} /> {label}
            </button>
          ))}

          <div style={{ flex:1 }} />
          <div className="divider" style={{ borderColor:'rgba(255,255,255,0.06)' }} />

          <button className="nav-item" onClick={onBackToLanding}>
            <ArrowLeft size={16} /> Back to Home
          </button>
          <button className="nav-item">
            <Settings size={16} /> Settings
          </button>
        </nav>

        {/* Watchlist */}
        <div style={{ padding:'16px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="nav-label">NSE Watchlist</div>
          {stocks.slice(0,6).map(s => (
            <button key={s.symbol}
              onClick={() => setSelectedSym(s.symbol)}
              style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 10px', borderRadius:'var(--radius-sm)', cursor:'pointer', border:'none',
                background: selectedSym === s.symbol ? 'rgba(0,201,167,0.12)' : 'transparent',
                transition:'background 0.15s', marginBottom:2 }}>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:13, fontWeight:700, color: selectedSym === s.symbol ? 'var(--teal)' : 'var(--text-on-dark)' }}>{s.symbol}</div>
                <div style={{ fontSize:10, color:'var(--text-on-dark-2)' }}>{s.sector?.split(' ')[0]}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-on-dark)', fontFamily:'var(--font-mono)' }}>
                  {s.data_quality === 'live' ? `₹${s.price?.toFixed(0)}` : '—'}
                </div>
                <div style={{ fontSize:10, color: s.change_pct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight:600 }}>
                  {s.change_pct >= 0 ? '+' : ''}{s.change_pct}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────── */}
      <div style={{ flex:1, marginLeft:240, display:'flex', flexDirection:'column' }}>

        {/* Top bar */}
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>
              {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </h1>
            {loading && <Spinner />}
            {md.data_quality === 'live' && (
              <span className="badge badge-teal pulse-live">● Live Data</span>
            )}
            {md.data_quality === 'unavailable' && (
              <span className="badge badge-neutral">● Cached</span>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* Degraded toggle */}
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:500 }}>
              <div style={{ position:'relative', width:36, height:20 }}>
                <input type="checkbox" checked={degraded} onChange={e => setDegraded(e.target.checked)}
                  style={{ opacity:0, width:0, height:0 }} />
                <div onClick={() => setDegraded(!degraded)} style={{
                  width:36, height:20, borderRadius:999, cursor:'pointer',
                  background: degraded ? 'var(--amber)' : 'var(--border-strong)',
                  transition:'background 0.2s', position:'relative'
                }}>
                  <div style={{ position:'absolute', top:2, left: degraded ? 18 : 2,
                    width:16, height:16, borderRadius:'50%', background:'#fff',
                    transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              <span style={{ color: degraded ? 'var(--amber)' : 'var(--text-secondary)' }}>
                {degraded ? 'Degraded Mode ON' : 'Degraded Mode'}
              </span>
            </label>

            {/* Profile switcher */}
            <select value={profileType} onChange={e => setProfileType(e.target.value)}
              style={{ padding:'7px 12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)',
                background:'var(--surface)', fontSize:13, fontWeight:600, cursor:'pointer', outline:'none' }}>
              <option value="conservative">Conservative Investor</option>
              <option value="aggressive">Aggressive Growth</option>
            </select>

            <button className="btn btn-teal" style={{ padding:'8px 16px', fontSize:13 }} onClick={runAnalysis}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </header>

        {/* ── Scrollable main body ──────────────────────────────── */}
        <div style={{ flex:1, overflowY:'auto', padding:28 }}>

          {/* Alerts — always visible */}
          {synth.conflict_detected && (
            <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber)', borderRadius:'var(--radius-md)',
              padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'center' }}>
              <AlertTriangle size={18} color="var(--amber)" />
              <div>
                <div style={{ fontWeight:700, color:'var(--amber)', marginBottom:2 }}>Signal Conflict Detected</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{synth.conflict_reason}</div>
              </div>
            </div>
          )}
          {synth.degraded_mode && (
            <div style={{ background:'var(--red-bg)', border:'1px solid var(--red)', borderRadius:'var(--radius-md)',
              padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'center' }}>
              <AlertTriangle size={18} color="var(--red)" />
              <div>
                <div style={{ fontWeight:700, color:'var(--red)', marginBottom:2 }}>Degraded Data Mode Active</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)' }}>Market data feed simulated as unavailable. Analysis is partial. Confidence reduced.</div>
              </div>
            </div>
          )}

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          {activeNav === 'overview' && (
            <>
              {/* Metric Row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                <div className="card" style={{ background:'var(--sidebar-bg)', border:'none' }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>
                    {md.symbol} — {md.name}
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:28, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:6 }}>
                    {md.price ? `₹${md.price.toLocaleString('en-IN')}` : '—'}
                  </div>
                  <span className={`delta ${md.change_pct >= 0 ? 'delta-up' : 'delta-down'}`}>
                    {md.change_pct >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                    {md.change_pct >= 0 ? '+' : ''}{md.change_pct}%
                  </span>
                </div>
                <div className="card">
                  <div className="metric-label">System Signal</div>
                  <div style={{ marginTop:10, marginBottom:10 }}>
                    <SignalPill signal={synth.classification} size="lg" />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="progress-track" style={{ flex:1 }}>
                      <div className="progress-fill" style={{ width:`${Math.round((synth.confidence||0)*100)}%`, background:'var(--teal)' }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700 }}>{Math.round((synth.confidence||0)*100)}%</span>
                  </div>
                </div>
                <div className="card">
                  <div className="metric-label">Agent Agreement</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:8, marginBottom:4 }}>
                    {synth.agent_agreement || '—'}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {synth.data_quality && <span className={`badge badge-${synth.data_quality === 'good' ? 'teal' : 'amber'}`}>{synth.data_quality?.toUpperCase()}</span>}
                  </div>
                </div>
                <div className="card">
                  <div className="metric-label">RSI (14-day)</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:28, fontWeight:800, letterSpacing:'-0.03em', marginTop:8, marginBottom:4 }}>
                    {md.rsi_14 || '—'}
                  </div>
                  <div style={{ fontSize:12, color: md.rsi_14 > 65 ? 'var(--green)' : md.rsi_14 < 35 ? 'var(--red)' : 'var(--text-muted)' }}>
                    {md.rsi_14 > 65 ? '↑ Overbought territory' : md.rsi_14 < 35 ? '↓ Oversold territory' : '→ Neutral zone'}
                  </div>
                </div>
              </div>

              {/* Price Chart + Synthesis */}
              <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, marginBottom:24 }}>
                <div className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{md.symbol} — Price History (30d)</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      52W: <span style={{ color:'var(--green)', fontWeight:600 }}>₹{md.high_52w?.toLocaleString('en-IN')}</span> / <span style={{ color:'var(--red)', fontWeight:600 }}>₹{md.low_52w?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {sparkData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={sparkData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--text-muted)' }} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize:10, fill:'var(--text-muted)' }} tickLine={false} axisLine={false}
                          tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} width={80} />
                        <Tooltip
                          formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Price']}
                          contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
                        <Line type="monotone" dataKey="price" stroke="var(--teal)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:13 }}>
                      {loading ? <><Spinner /> Loading live data…</> : 'No historical data available'}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                    {[
                      { label:'SMA-50',   val: md.sma_50 ? `₹${md.sma_50.toLocaleString('en-IN')}` : '—' },
                      { label:'SMA-200',  val: md.sma_200 ? `₹${md.sma_200.toLocaleString('en-IN')}` : '—' },
                      { label:'MACD',     val: md.macd ? `${md.macd.value > 0 ? '+' : ''}${md.macd.value}` : '—' },
                      { label:'Volume',   val: md.volume ? `${(md.volume/1000000).toFixed(1)}M` : '—' },
                      { label:'Vol Ratio',val: md.volume_ratio ? `${md.volume_ratio}×` : '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ textAlign:'center' }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ border:'1px solid var(--teal)', boxShadow:'0 0 0 1px var(--teal-light)' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
                    SYNTHESIZED INTELLIGENCE
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{synth.classification}</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:16 }}>{synth.summary}</div>
                  <div style={{ background:'var(--bg)', borderRadius:'var(--radius-md)', padding:'14px 16px', marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Recommendation</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{synth.action_recommendation}</div>
                  </div>
                  {(synth.key_reasons || []).length > 0 && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Key Reasons</div>
                      {synth.key_reasons.map((r, i) => (
                        <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}>
                          <ChevronRight size={14} color="var(--teal)" style={{ marginTop:1, flexShrink:0 }} />
                          <span style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {synth.portfolio_impact && (
                    <div style={{ background:'var(--teal-light)', borderRadius:'var(--radius-sm)', padding:'12px 14px' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--teal-dark)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Portfolio Impact</div>
                      <div style={{ fontSize:12, color:'var(--teal-dark)', lineHeight:1.5 }}>{synth.portfolio_impact}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ SIGNALS ═══════════════════════════════════════════════════════ */}
          {activeNav === 'signals' && (
            <>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:20 }}>
                  Real-time signal output from all three specialist agents for <strong>{md.symbol || selectedSym}</strong>.
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {Object.entries(agents).map(([key, agent]) => (
                    <AgentCard key={key} agent={agent} onCitation={handleCitation} />
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                <div className="card">
                  <div className="metric-label">System Signal</div>
                  <div style={{ marginTop:10, marginBottom:10 }}><SignalPill signal={synth.classification} size="lg" /></div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="progress-track" style={{ flex:1 }}>
                      <div className="progress-fill" style={{ width:`${Math.round((synth.confidence||0)*100)}%`, background:'var(--teal)' }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700 }}>{Math.round((synth.confidence||0)*100)}%</span>
                  </div>
                </div>
                <div className="card">
                  <div className="metric-label">Agent Agreement</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:800, marginTop:8, marginBottom:4 }}>{synth.agent_agreement || '—'}</div>
                </div>
                <div className="card">
                  <div className="metric-label">RSI (14)</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:28, fontWeight:800, marginTop:8 }}>{md.rsi_14 || '—'}</div>
                </div>
                <div className="card">
                  <div className="metric-label">Data Quality</div>
                  <div style={{ marginTop:10 }}>
                    {synth.data_quality && <span className={`badge badge-${synth.data_quality === 'good' ? 'teal' : 'amber'}`} style={{ fontSize:14, padding:'6px 14px' }}>{synth.data_quality?.toUpperCase()}</span>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ RESEARCH ══════════════════════════════════════════════════════ */}
          {activeNav === 'research' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20, marginBottom:24 }}>
                {/* News Feed */}
                <div className="card">
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>
                    Latest News — {md.symbol || selectedSym}
                    {news.source === 'gnews' && <span className="badge badge-teal" style={{ marginLeft:8 }}>Live</span>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {(news.articles || []).slice(0, 6).map((a, i) => (
                      <div key={i} style={{ borderBottom:'1px solid var(--border)', paddingBottom:14 }}>
                        <div style={{ fontSize:14, fontWeight:600, lineHeight:1.4, marginBottom:6 }}>
                          {a.url ? (
                            <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color:'inherit', textDecoration:'none' }}>
                              {a.title} <ExternalLink size={11} color="var(--text-muted)" />
                            </a>
                          ) : a.title}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                          {a.source} {a.publishedAt && `· ${new Date(a.publishedAt).toLocaleDateString('en-IN')}`}
                          {a.is_fallback && ' · illustrative'}
                        </div>
                      </div>
                    ))}
                    {!(news.articles || []).length && (
                      <div style={{ color:'var(--text-muted)', fontSize:13 }}>No news available. Run analysis to load.</div>
                    )}
                  </div>
                </div>
                {/* Investor Profile */}
                <div className="card">
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Investor Profile</div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{prof.name}</div>
                    <div style={{ fontSize:13, color:'var(--teal)', fontWeight:600, marginTop:2 }}>{prof.riskTolerance} · {prof.investmentHorizon}</div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Sector Exposure</div>
                  {Object.entries(prof.sectorExposures || {}).map(([sec, val]) => (
                    <div key={sec} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span>{sec}</span>
                        <span style={{ fontWeight:700 }}>{val}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width:`${val}%`, background: val > (prof.maxSectorConcentration || 25) ? 'var(--amber)' : 'var(--teal)' }} />
                      </div>
                    </div>
                  ))}
                  {prof.maxSectorConcentration && (
                    <div style={{ marginTop:10, fontSize:12, color:'var(--text-muted)' }}>
                      Max sector concentration: <strong>{prof.maxSectorConcentration}%</strong>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ AGENT NETWORK ═════════════════════════════════════════════════ */}
          {activeNav === 'agents' && (
            <>
              <div style={{ marginBottom:20, fontSize:13, color:'var(--text-secondary)' }}>
                Three specialist agents run in parallel via <code style={{ background:'var(--surface)', padding:'2px 6px', borderRadius:4 }}>ThreadPoolExecutor</code>. Each produces an independent signal before synthesis.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {Object.entries(agents).map(([key, agent]) => (
                  <AgentCard key={key} agent={agent} onCitation={handleCitation} />
                ))}
              </div>
              {/* Synthesis summary */}
              <div className="card" style={{ border:'1px solid var(--teal)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Synthesis Agent Output</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {[
                    { label:'Classification', val: synth.classification },
                    { label:'Confidence',      val: `${Math.round((synth.confidence||0)*100)}%` },
                    { label:'Agent Agreement', val: synth.agent_agreement },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background:'var(--bg)', borderRadius:'var(--radius-md)', padding:'14px 16px' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
                      <div style={{ fontSize:16, fontWeight:800, fontFamily:'var(--font-mono)' }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
                {synth.summary && (
                  <div style={{ marginTop:16, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
                    {synth.summary}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ REASONING TRACE ═══════════════════════════════════════════════ */}
          {activeNav === 'trace' && (
            <div className="card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <Terminal size={16} color="var(--teal)" />
                <span style={{ fontWeight:700, fontSize:15 }}>Reasoning Trace</span>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>— Step-by-step agent execution log</span>
              </div>
              <div className="trace-terminal" style={{ minHeight:300 }}>
                {(synth.reasoning_trace || []).map((log, i) => (
                  <div key={i} style={{ display:'flex', gap:4, marginBottom:4 }}>
                    <span className="trace-time">{log.time}</span>
                    <span className={`trace-icon ${log.status === 'warning' ? 'trace-warning' : 'trace-success'}`}>
                      {log.status === 'warning' ? '⚠' : '✓'}
                    </span>
                    <span style={{ color: log.status === 'warning' ? '#F59E0B' : '#E2E8F0', fontSize:13 }}>{log.event}</span>
                  </div>
                ))}
                {!synth.reasoning_trace?.length && (
                  <div style={{ color:'#6B7280', fontSize:13 }}>Run analysis to see reasoning trace…</div>
                )}
              </div>
            </div>
          )}

          {/* ══ PERFORMANCE ═══════════════════════════════════════════════════ */}
          {activeNav === 'performance' && performance && (
            <div className="card">
              <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Session Performance</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Total Sessions',     val: performance.summary?.total_sessions },
                  { label:'30d Signal Accuracy', val: `${performance.summary?.forward_return_30d_accuracy_pct}%` },
                  { label:'Agent Agreement',     val: `${performance.summary?.agent_agreement_rate_pct}%` },
                  { label:'Avg Latency',         val: `${performance.summary?.avg_total_latency_sec}s` },
                  { label:'Retrieval Latency',   val: `${performance.summary?.source_retrieval_avg_latency_ms}ms` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ textAlign:'center', background:'var(--bg)', borderRadius:'var(--radius-md)', padding:'16px 10px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{label}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:800 }}>{val ?? '—'}</div>
                  </div>
                ))}
              </div>
              {(performance.recent_sessions || []).length > 0 && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--border)' }}>
                        {['Session','Symbol','Signal','Agreement','Latency','Citations','Status'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontWeight:700, color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {performance.recent_sessions.slice(0,10).map(s => (
                        <tr key={s.session_id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'10px 12px', fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{s.session_id}</td>
                          <td style={{ padding:'10px 12px', fontWeight:700 }}>{s.symbol}</td>
                          <td style={{ padding:'10px 12px' }}><SignalPill signal={s.classification} /></td>
                          <td style={{ padding:'10px 12px', color:'var(--text-secondary)' }}>{s.agent_agreement}</td>
                          <td style={{ padding:'10px 12px', fontFamily:'var(--font-mono)' }}>{s.total_latency_sec}s</td>
                          <td style={{ padding:'10px 12px' }}>{s.citations_grounded}</td>
                          <td style={{ padding:'10px 12px' }}>
                            <span className={`badge ${s.status === 'SUCCESS' ? 'badge-teal' : 'badge-amber'}`}>{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeNav === 'performance' && !performance && (
            <div className="card" style={{ textAlign:'center', padding:48 }}>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>No performance data yet. Run an analysis first.</div>
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Citation Drawer */}
      {citation && <CitationDrawer doc={citation} onClose={() => setCitation(null)} />}
    </div>
  );
}
