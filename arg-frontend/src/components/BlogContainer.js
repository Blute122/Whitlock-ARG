import React, { useState } from 'react';
import axios from 'axios';
import StageDisplay from './StageDisplay';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const BlogContainer = ({ team, onLogin, onLogout }) => {
  const stage = team ? team.currentStage : 1;

  const [teamName, setTeamName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [commentText, setCommentText] = useState('');
  const [fakeComments, setFakeComments] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/register`, { teamName, loginCode });
      onLogin({ teamId: res.data.teamId, teamName, currentStage: res.data.currentStage });
    } catch (err) {
      setError("Username already taken. Please choose another alias.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/submit`, {
        teamId: team.teamId,
        stageNumber: stage,
        answer: commentText 
      });
      if (res.data.status === "success") {
        onLogin({ ...team, currentStage: res.data.nextStage }); 
        setCommentText('');
        setFakeComments([]); 
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsFull(true);
      } else if (err.response?.status === 429) {
        // RATE LIMIT HIT! Show a scary system error instead of a normal comment.
        setFakeComments([...fakeComments, { 
          author: "SYSTEM_ADMIN", 
          text: "[WARNING: BRUTE FORCE DETECTED. IP LOCKED FOR 3 MINUTES.]", 
          time: "ERR" 
        }]);
        setCommentText(''); 
      } else {
        // Normal wrong guess -> fake comment
        setFakeComments([...fakeComments, { author: team.teamName, text: commentText, time: "Just now" }]);
        setCommentText(''); 
      }
    }
  };

  // --- UI THEME ENGINE ---
  const getTheme = () => {
    switch (stage) {
      case 1: 
        return { bg: '#FAFAFA', navBg: '#FFFFFF', text: '#333333', font: '"Helvetica Neue", Helvetica, Arial, sans-serif', border: '#EAEAEA', accent: '#0066CC', bio: "Physics major. Coffee addict. Documenting the mundane so I don't go insane." };
      case 2: 
        return { bg: '#F4F1EA', navBg: '#EFEBE1', text: '#2C2C2C', font: 'Georgia, serif', border: '#DCD6C8', accent: '#8B0000', bio: "Something isn't right. I'm leaving these notes here just in case." };
      case 3: 
        return { bg: '#2A2A2A', navBg: '#1A1A1A', text: '#CCCCCC', font: '"Courier New", Courier, monospace', border: '#444444', accent: '#FF0000', bio: "who are you? why are you reading this?" };
      default: 
        return { bg: '#000000', navBg: '#000000', text: '#00FF00', font: '"Courier New", Courier, monospace', border: '#00FF00', accent: '#00FF00', bio: "SYSTEM CORRUPTED. AUTHOR DECEASED/MISSING." };
    }
  };

  const theme = getTheme();

  if (isFull) return <div style={{textAlign: 'center', marginTop: '20vh', color: 'red', fontFamily: 'monospace'}}><h1>403 THREAD ARCHIVED</h1></div>;

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: theme.font, minHeight: '100vh', transition: 'all 1s ease' }}>
      
      {/* REALISTIC NAVIGATION BAR */}
      <nav style={{ backgroundColor: theme.navBg, borderBottom: `1px solid ${theme.border}`, padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: stage < 3 ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: stage >= 4 ? '5px' : 'normal' }}>
          {stage >= 4 ? "A R C H I V E" : "Leo's Digital Diary"}
        </div>
        
        {/* Fake links to look real, except for Logout which is hidden in plain sight */}
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>Home</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>About</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>Contact</span>
          {team && (
             <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${theme.accent}`, color: theme.accent, padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
               {stage >= 4 ? "DISCONNECT" : "Sign Out"}
             </button>
          )}
        </div>
      </nav>

      {/* TWO-COLUMN BLOG LAYOUT */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '50px', padding: '0 20px', flexWrap: 'wrap' }}>
        
        {/* MAIN ARTICLE COLUMN */}
        <main style={{ flex: '1 1 600px' }}>
          <StageDisplay stageNumber={stage} theme={theme} />

          {/* REALISTIC COMMENT SECTION */}
          <section style={{ marginTop: '50px', borderTop: `1px solid ${theme.border}`, paddingTop: '40px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '30px' }}>{stage >= 4 ? "SYSTEM_INPUT" : "Responses"}</h3>

            {/* Rendered Fake Comments */}
            <div style={{ marginBottom: '40px' }}>
              {fakeComments.map((comment, index) => (
                <div key={index} style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: theme.bg }}>
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{comment.author} <span style={{ color: '#888', fontWeight: 'normal', fontSize: '12px', marginLeft: '10px' }}>{comment.time}</span></p>
                    <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.5' }}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form / Registration */}
            {!team ? (
              <div style={{ padding: '30px', backgroundColor: theme.navBg, border: `1px solid ${theme.border}`, borderRadius: '8px' }}>
                <p style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>What are your thoughts?</p>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input required placeholder="Your Name" onChange={(e) => setTeamName(e.target.value)} style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '4px', background: theme.bg, color: theme.text, fontSize: '14px' }} />
                  <input required type="password" placeholder="Create a Profile PIN" onChange={(e) => setLoginCode(e.target.value)} style={{ padding: '12px', border: `1px solid ${theme.border}`, borderRadius: '4px', background: theme.bg, color: theme.text, fontSize: '14px' }} />
                  <button type="submit" style={{ padding: '12px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: '150px' }}>Sign Up to Reply</button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                  {team.teamName.charAt(0).toUpperCase()}
                </div>
                <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder={stage >= 4 ? ">_" : "Add to the discussion..."} 
                    rows="3"
                    style={{ padding: '15px', border: `1px solid ${theme.border}`, borderRadius: '8px', background: stage >= 4 ? '#000' : theme.navBg, color: theme.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none', fontSize: '15px' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>{stage >= 4 ? "SYS_OVERRIDE_ACTIVE" : "Markdown supported."}</span>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: theme.accent, color: stage >= 4 ? '#000' : '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {stage >= 4 ? "EXECUTE" : "Respond"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </main>

        {/* SIDEBAR (Author Profile) */}
        <aside style={{ flex: '1 1 300px', maxWidth: '300px' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.navBg }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: theme.border, marginBottom: '15px', display: 'inline-block' }}>
                {/* Placeholder for Author Image */}
                <img src={stage >= 4 ? "https://via.placeholder.com/80/000000/00ff00?text=ERR" : "https://via.placeholder.com/80/cccccc/ffffff?text=Leo"} alt="Author" style={{ borderRadius: '50%', width: '100%' }} />
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{stage >= 4 ? "U N K N O W N" : "Leo Carter"}</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: stage >= 4 ? '#00ff00' : '#666', marginBottom: '20px' }}>
                {theme.bio}
              </p>
              <button style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: `1px solid ${theme.text}`, color: theme.text, borderRadius: '20px', cursor: 'pointer' }}>
                {stage >= 4 ? "ACCESS_DENIED" : "Follow"}
              </button>
            </div>
            
            {/* Fake Tags/Categories Widget */}
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>{stage >= 4 ? "CORRUPTED_SECTORS" : "Popular Tags"}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['#college', '#life', '#thoughts', '#physics'].map((tag, i) => (
                  <span key={i} style={{ padding: '5px 12px', backgroundColor: theme.border, borderRadius: '15px', fontSize: '12px' }}>
                    {stage >= 4 ? "0x00F" : tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default BlogContainer;