import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import StageDisplay from '../components/StageDisplay';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || (window.location.port === '3000' ? `http://${window.location.hostname}:5000` : '');

const Round = ({ session, onProgress }) => {
  const { n } = useParams();
  const stageNumber = parseInt(n);
  const navigate = useNavigate();

  const [stageContent, setStageContent] = useState(null);
  const [diaryContent, setDiaryContent] = useState(null);
  
  const [commentText, setCommentText] = useState('');
  const [fakeComments, setFakeComments] = useState([]);
  const [isFull, setIsFull] = useState(false);

  // Check if this round is already solved
  const isSolved = session.diaryUnlocked.includes(stageNumber);

  useEffect(() => {
    if (!session) return;
    
    // Fetch Stage Content
    axios.get(`${API_URL}/api/stage/${stageNumber}`, {
      headers: { teamid: session.teamId, sessiontoken: session.sessionToken }
    })
    .then(res => setStageContent(res.data))
    .catch(err => {
      if (err.response?.status === 403) navigate('/');
    });

    // If solved, fetch Diary Content
    if (isSolved) {
      axios.get(`${API_URL}/api/diary/${stageNumber}`, {
        headers: { teamid: session.teamId, sessiontoken: session.sessionToken }
      })
      .then(res => {
        if (res.data.payload && res.data.iv) {
          try {
            const key = CryptoJS.enc.Hex.parse(session.sessionToken);
            const ivParsed = CryptoJS.enc.Hex.parse(res.data.iv);
            const decrypted = CryptoJS.AES.decrypt(
              { ciphertext: CryptoJS.enc.Hex.parse(res.data.payload) },
              key,
              { iv: ivParsed, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
            const utf8String = decrypted.toString(CryptoJS.enc.Utf8);
            setDiaryContent(JSON.parse(utf8String));
          } catch (e) {
            console.error("Decryption failed:", e);
          }
        } else {
          setDiaryContent(res.data.diary);
        }
      })
      .catch(console.error);
    }
  }, [stageNumber, session, isSolved, navigate]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/submit`, {
        teamId: session.teamId,
        stageNumber: stageNumber,
        answer: commentText 
      }, {
        headers: { teamid: session.teamId, sessiontoken: session.sessionToken }
      });

      if (res.data.status === "success") {
        const updatedSession = { ...session, currentStage: res.data.nextStage, diaryUnlocked: res.data.diaryUnlocked };
        localStorage.setItem('witlock_session', JSON.stringify(updatedSession));
        onProgress(updatedSession);
        
        setCommentText('');
        setFakeComments([]); 
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsFull(true);
      } else if (err.response?.status === 429) {
        setFakeComments([...fakeComments, { 
          author: "SYSTEM_ADMIN", 
          text: "[WARNING: BRUTE FORCE DETECTED. IP LOCKED FOR 3 MINUTES.]", 
          time: "ERR" 
        }]);
        setCommentText(''); 
      } else {
        setFakeComments([...fakeComments, { author: session.teamName, text: commentText, time: "Just now" }]);
        setCommentText(''); 
      }
    }
  };

  const getTheme = () => {
    switch (true) {
      case (stageNumber <= 2):
        return { bg: '#FAFAFA', navBg: '#FFFFFF', text: '#333333', font: '"Helvetica Neue", Helvetica, Arial, sans-serif', border: '#EAEAEA', accent: '#0066CC', bio: "Security researcher. Documenting incidents before they are buried." };
      case (stageNumber >= 3 && stageNumber <= 5):
        return { bg: '#F4F1EA', navBg: '#EFEBE1', text: '#2C2C2C', font: 'Georgia, serif', border: '#DCD6C8', accent: '#8B0000', bio: "Some file data appears to be altered. I am maintaining hard backups offline." };
      case (stageNumber === 6):
        return { bg: '#1A1A1A', navBg: '#0F0F0F', text: '#E0E0E0', font: '"Courier New", Courier, monospace', border: '#333333', accent: '#FF3333', bio: "who is looking at this? they are in the network." };
      default:
        return { bg: '#000000', navBg: '#000000', text: '#00FF00', font: '"Courier New", Courier, monospace', border: '#00FF00', accent: '#00FF00', bio: "SYSTEM CORRUPTED. A TRACE REMAINS." };
    }
  };

  const theme = getTheme();

  if (isFull) return <div style={{textAlign: 'center', marginTop: '20vh', color: 'red', fontFamily: 'monospace'}}><h1>403 THREAD ARCHIVED</h1></div>;

  if (!stageContent) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: theme.font, minHeight: '100vh', transition: 'all 1s ease' }}>
      
      <nav style={{ backgroundColor: theme.navBg, borderBottom: `1px solid ${theme.border}`, padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Global Security Monitor
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', alignItems: 'center' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', opacity: 0.7 }}>Return to Hub</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '50px', padding: '0 20px', flexWrap: 'wrap' }}>
        <main style={{ flex: '1 1 600px' }}>
          <StageDisplay stageContent={stageContent} theme={theme} />

          {!isSolved && (
            <section style={{ marginTop: '50px', borderTop: `1px solid ${theme.border}`, paddingTop: '40px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '30px' }}>Responses</h3>
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

              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                  {session.teamName.charAt(0).toUpperCase()}
                </div>
                <form onSubmit={handleCommentSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder={"Add to the discussion..."} 
                    rows="3"
                    style={{ padding: '15px', border: `1px solid ${theme.border}`, borderRadius: '8px', background: theme.navBg, color: theme.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none', fontSize: '15px' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>{stageContent.puzzle?.hint || "Markdown supported."}</span>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Respond
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

        </main>

        <aside style={{ flex: '1 1 300px', maxWidth: '300px' }}>
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.navBg }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: theme.border, marginBottom: '15px', display: 'inline-block' }}>
                <img src={"/profile_pic.png"} alt="Author" style={{ borderRadius: '50%', width: '100%' }} />
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Admin / Editor</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', marginBottom: '20px' }}>
                {theme.bio}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {isSolved && diaryContent && (
        <div style={{
          backgroundColor: '#050505',
          color: '#e8e8e0',
          fontFamily: '"Special Elite", "Courier Prime", Courier, monospace',
          padding: '60px 20px',
          borderTop: '1px solid #333',
          marginTop: '60px',
          minHeight: '400px',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '30px' }}>{diaryContent.date}</div>
            <div style={{ fontSize: '18px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {diaryContent.content}
            </div>
            
            <div style={{ marginTop: '60px', textAlign: 'right' }}>
              <button 
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: '1px solid #555',
                  color: '#aaa',
                  padding: '10px 20px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = '#fff'; }}
                onMouseOut={(e) => { e.target.style.color = '#aaa'; e.target.style.borderColor = '#555'; }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Round;
