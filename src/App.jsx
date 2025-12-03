import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Diary from './pages/Diary';
import ClosedDiary from './pages/ClosedDiary';
import Memories from './pages/Memories';

function App() {
  return (
    <Router>
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

export default App;
