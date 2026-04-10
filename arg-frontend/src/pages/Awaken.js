import React, { useState, useEffect } from 'react';

const Awaken = ({ session }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [message, setMessage] = useState('');
  const [sequenceRunning, setSequenceRunning] = useState(false);
  const [finalLines, setFinalLines] = useState([]);

  // Prevent physical keyboard usage to force on-screen keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!session || session.currentStage !== 8) {
    return (
      <div style={{ backgroundColor: '#000000', color: '#333', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Courier New", Courier, monospace', fontSize: '18px', letterSpacing: '3px' }}>
        <p>ACCESS DENIED: PROTOCOL INCOMPLETE.</p>
      </div>
    );
  }

  const handleKeyPress = (key) => {
    if (sequenceRunning) return;
    setMessage('');
    
    if (key === 'BACKSPACE') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (key === 'SUBMIT') {
      handleSubmit();
    } else if (key === 'SPACE') {
      setCurrentInput(prev => prev + ' ');
    } else {
      setCurrentInput(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    const input = currentInput.trim().toLowerCase();
    const teamName = session?.teamName?.trim().toLowerCase() || 'unknown';

    if (input === teamName) {
      setMessage("That's not who you are.");
      setCurrentInput('');
      return;
    }
    if (input === 'whitlock') {
      triggerFinalSequence();
      return;
    }
    setMessage("...");
    setCurrentInput('');
  };

  const triggerFinalSequence = () => {
    setSequenceRunning(true);
    setCurrentInput('');
    setMessage('');
    
    const lines = [
      "You weren't searching for the truth.",
      "You were being led to it.",
      "",
      "You are part of the system.",
      "Welcome to Whitlock."
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setFinalLines(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 2000); // 2 second delay between lines
  };

  const row0 = ['1','2','3','4','5','6','7','8','9','0'];
  const row1 = ['Q','W','E','R','T','Y','U','I','O','P'];
  const row2 = ['A','S','D','F','G','H','J','K','L'];
  const row3 = ['Z','X','C','V','B','N','M'];
  const row4 = ['-','_','@','!','#','$','%','&','*','?'];

  const renderKey = (key) => (
    <button
      key={key}
      onClick={() => handleKeyPress(key)}
      style={{
        background: 'none',
        border: '1px solid #333',
        color: '#e8e8e0',
        padding: '15px 20px',
        margin: '5px',
        cursor: 'pointer',
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '18px',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => { e.target.style.background = '#333'; }}
      onMouseOut={(e) => { e.target.style.background = 'none'; }}
    >
      {key}
    </button>
  );

  return (
    <div style={{ backgroundColor: '#000000', color: '#e8e8e0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Courier New", Courier, monospace' }}>
      
      {!sequenceRunning ? (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '800px', animation: 'fadeIn 2s' }}>
          <div style={{ borderBottom: '1px solid #333', minHeight: '50px', marginBottom: '30px', paddingBottom: '10px', fontSize: '24px', letterSpacing: '5px' }}>
            {currentInput}<span style={{ animation: 'blink 1s infinite' }}>_</span>
          </div>
          
          <div style={{ height: '30px', marginBottom: '40px', color: '#888', fontSize: '14px' }}>
            {message}
          </div>

          <div>
            <div>{row0.map(renderKey)}</div>
            <div>{row1.map(renderKey)}</div>
            <div>{row2.map(renderKey)}</div>
            <div>{row3.map(renderKey)}</div>
            <div>{row4.map(renderKey)}</div>
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => handleKeyPress('BACKSPACE')}
                style={{ background: 'none', border: '1px solid #333', color: '#e8e8e0', padding: '15px 20px', margin: '5px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                BACK
              </button>
              <button 
                onClick={() => handleKeyPress('SPACE')}
                style={{ background: 'none', border: '1px solid #333', color: '#e8e8e0', padding: '15px 40px', margin: '5px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                SPACE
              </button>
              <button 
                onClick={() => handleKeyPress('SUBMIT')}
                style={{ background: 'none', border: '1px solid #e8e8e0', color: '#e8e8e0', padding: '15px 20px', margin: '5px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}
              >
                ENTER
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: '20px', lineHeight: '2.5' }}>
          {finalLines.map((line, i) => (
            <div key={i} style={{ animation: 'fadeIn 2s' }}>
              {line}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default Awaken;
