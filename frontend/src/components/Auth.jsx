import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Mail, Lock, Zap, ArrowLeft } from 'lucide-react';

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! Check your email for a confirmation link, then log in.');
        setMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.dispatchEvent(new CustomEvent('login-success', { detail: data.session }));
      }
    } catch (err) {
      setMessage(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const isError = message && (
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('failed') ||
    message.toLowerCase().includes('invalid')
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg,#F0FDF9 0%,#EFF6FF 55%,#F8FAFB 100%)',
      fontFamily: 'Inter, system-ui, sans-serif', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 24
        }}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{
          background: '#fff', borderRadius: 16, padding: '40px 32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,201,167,0.1)'
        }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,201,167,0.1)', color: '#00C9A7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Shield size={24} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              {mode === 'login' ? 'Log in to access your intelligence dashboard.' : 'Sign up to start analyzing markets.'}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="investor@example.com"
                  required
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    borderRadius: 8, border: '1px solid #E2E8F0',
                    fontSize: 14, color: '#0F172A', outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00C9A7'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                  required
                  minLength={6}
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    borderRadius: 8, border: '1px solid #E2E8F0',
                    fontSize: 14, color: '#0F172A', outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00C9A7'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            {message && (
              <div style={{
                padding: 12, borderRadius: 8, lineHeight: 1.5, fontSize: 13, fontWeight: 500,
                background: isError ? '#FEE2E2' : '#ECFDF5',
                color: isError ? '#DC2626' : '#059669'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                background: loading ? '#94A3B8' : '#00C9A7', color: '#fff',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 8, transition: 'background 0.2s'
              }}
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Log In' : 'Sign Up'}
              {!loading && <Zap size={16} />}
            </button>

          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748B' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#00C9A7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
