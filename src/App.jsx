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

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/closed-diary');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return null;
};

export default App;
