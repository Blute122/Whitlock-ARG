import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Login from './components/Login';
import Hub from './pages/Hub';
import Round from './pages/Round';
import Awaken from './pages/Awaken';

function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('witlock_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('witlock_session');
    setSession(null);
  };

  if (!session) return (
    <>
      <Analytics />
      <Login onLogin={setSession} />
    </>
  );

  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<Hub session={session} onLogout={handleLogout} />} />
        <Route path="/round/:n" element={<Round session={session} onProgress={setSession} />} />
        <Route path="/awaken" element={<Awaken session={session} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;