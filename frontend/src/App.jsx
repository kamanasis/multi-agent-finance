import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import Auth from './components/Auth';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [docSection, setDocSection] = useState('overview');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && currentView === 'auth') {
        setCurrentView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  return (
    <div>
      {currentView === 'landing' ? (
        <LandingPage 
          onLaunchDashboard={() => setCurrentView(session ? 'dashboard' : 'auth')} 
          onViewDocs={(section) => { setDocSection(section || 'overview'); setCurrentView('docs'); }}
        />
      ) : currentView === 'auth' ? (
        <Auth onBack={() => setCurrentView('landing')} />
      ) : currentView === 'docs' ? (
        <Documentation initialSection={docSection} onBack={() => setCurrentView('landing')} />
      ) : (
        <Dashboard onBackToLanding={() => {
          if (session) supabase.auth.signOut();
          setCurrentView('landing');
        }} />
      )}
    </div>
  );
}
