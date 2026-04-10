import React from 'react';

const StageDisplay = ({ stageContent, theme }) => {
  if (!stageContent || !stageContent.blog) return null;
  const { blog } = stageContent;

  return (
    <article>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: theme.border, overflow: 'hidden' }}>
            <img src={"/profile_pic.png"} alt="Author thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Incident Report</div>
          <div style={{ fontSize: '14px', color: '#888', display: 'flex', gap: '10px' }}>
            <span>Global Security Monitor</span>
            <span>·</span>
            <span>File 0{stageContent.stageNumber}</span>
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1.2', marginBottom: '30px', color: theme.text }}>
        {blog.title}
      </h1>
      
      <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#292929', marginBottom: '40px' }}>
        <p style={{ fontStyle: 'italic', color: '#555' }}>{blog.intro}</p>
        
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{blog.incidentDetails}</div>
        
        {blog.timeline && blog.timeline.length > 0 && (
          <div style={{ margin: '30px 0', padding: '20px', borderLeft: `4px solid ${theme.accent}`, backgroundColor: '#f9f9f9', fontSize: '16px' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Event Sequence</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {blog.timeline.map((event, i) => (
                <li key={i} style={{ marginBottom: '10px', color: '#444' }}>{event}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{blog.conclusion}</div>
      </div>
    </article>
  );
};

export default StageDisplay;