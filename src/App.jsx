import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Diary from './pages/Diary';
import ClosedDiary from './pages/ClosedDiary';
import Memories from './pages/Memories';

function App() {
  return (
    <Router>
      <AuthListener />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/closed-diary" element={<ClosedDiary />} />
        <Route path="/memories" element={<Memories />} />
      </Routes>
    </Router>
  );
}

const AuthListener = () => {
  const navigate = React.useCallback((path) => {
    window.location.hash = path; // Fallback or use actual router hook if inside router
  }, []);
  // Actually we can't use useNavigate outside of Routes if App is the Router.
  // But AuthListener is inside Router.
  return <AuthHandler />;
};

import { App as CapacitorApp } from '@capacitor/app';

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Handle Deep Links (Mobile)
    const setupDeepLinks = async () => {
      CapacitorApp.addListener('appUrlOpen', async (data) => {
        // Check if the URL contains auth tokens
        if (data.url.includes('access_token') || data.url.includes('refresh_token')) {
          // Extract hash from the deep link URL
          const url = new URL(data.url);
          const hash = url.hash.substring(1); // Remove the '#'
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              navigate('/closed-diary');
            }
          }
        }
      });
    };

    setupDeepLinks();

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/closed-diary');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session && (location.pathname === '/' || location.pathname === '/login')) {
          navigate('/closed-diary');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  return null;
};

export default App;
