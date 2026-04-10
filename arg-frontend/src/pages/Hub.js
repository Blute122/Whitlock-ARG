import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hub = ({ session }) => {
  const navigate = useNavigate();

  const totalStages = 7;
  const stages = Array.from({ length: totalStages }, (_, i) => i + 1);

  return (
    <div style={{ backgroundColor: '#0d0d0d', color: '#c9c9c0', minHeight: '100vh', padding: '50px 20px', fontFamily: '"Courier New", Courier, monospace' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '50px', letterSpacing: '3px' }}>INCIDENT DATABASE</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {stages.map(n => {
            const isCompleted = n < session.currentStage;
            const isActive = n === session.currentStage;
            const isLocked = n > session.currentStage;

            return (
              <div 
                key={n}
                onClick={() => { if (!isLocked) navigate(`/round/${n}`) }}
                style={{
                  border: isActive ? '1px solid #b87333' : `1px solid ${isLocked ? '#333' : '#4CAF50'}`,
                  borderRadius: '8px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.3 : 1,
                  boxShadow: isActive ? '0 0 10px rgba(184, 115, 51, 0.3)' : 'none',
                  backgroundColor: '#1a1a1a',
                  transition: 'all 0.3s'
                }}
              >
                <h2 style={{ margin: '0 0 10px 0', color: isActive ? '#b87333' : (isCompleted ? '#4CAF50' : '#888') }}>
                  {isLocked ? '🔒' : `File 0${n}`}
                </h2>
                {!isLocked && isCompleted && <span style={{ color: '#4CAF50' }}>[ CLEARED ]</span>}
                {isActive && <span style={{ color: '#b87333' }}>[ ACTIVE ]</span>}
              </div>
            );
          })}
        </div>

        {session.currentStage > totalStages && (
          <div style={{ marginTop: '50px', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/awaken')}
              style={{ padding: '15px 30px', backgroundColor: '#b87333', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', fontSize: '18px' }}
            >
              FINALIZE REPORT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hub;
