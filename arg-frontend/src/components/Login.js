import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || (window.location.port === '3000' ? `http://${window.location.hostname}:5000` : '');

const Login = ({ onLogin }) => {
  const [teamName, setTeamName] = useState('');
  const [loginCode, setLoginCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/register`, { 
        teamName, 
        loginCode 
      });
      const newSession = { 
        teamId: res.data.teamId, 
        sessionToken: res.data.sessionToken,
        teamName, 
        currentStage: res.data.currentStage,
        diaryUnlocked: res.data.diaryUnlocked || []
      };
      localStorage.setItem('witlock_session', JSON.stringify(newSession));
      onLogin(newSession);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials.");
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f9f9f9',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#ffffff', 
        border: '1px solid #eaeaea', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
        width: '350px'
      }}>
        <h1 style={{ color: '#222', fontSize: '24px', margin: '0 0 10px 0' }}>Security Incident Database</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
          Restricted Access. Please authenticate.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left', marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>TEAM NAME</label>
            <input 
              type="text" 
              required
              onChange={(e) => setTeamName(e.target.value)} 
              style={{ 
                display: 'block', width: '100%', boxSizing: 'border-box', padding: '10px', marginTop: '5px',
                border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'
              }}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <label style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>ACCESS PIN</label>
            <input 
              type="password" 
              required
              onChange={(e) => setLoginCode(e.target.value)} 
              style={{ 
                display: 'block', width: '100%', boxSizing: 'border-box', padding: '10px', marginTop: '5px',
                border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px'
              }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#000', color: '#fff', padding: '12px', width: '100%',
              fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Authenticate
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
        WITLOCK Framework v1.0
      </p>
    </div>
  );
};

export default Login;