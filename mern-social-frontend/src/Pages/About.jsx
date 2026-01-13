
import React from 'react';

function About() {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
    }}>
      <h2 style={{ color: '#ff69b4' }}>About This Social Media App</h2>

      <p style={{ fontSize: '18px', color: '#555' }}>Features include:</p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ fontSize: '16px', color: '#333' }}>User  registration and login</li>
        <li style={{ fontSize: '16px', color: '#333' }}>Create, like, share, and delete posts</li>
        <li style={{ fontSize: '16px', color: '#333' }}>Media uploads (images/videos)</li>
        <li style={{ fontSize: '16px', color: '#333' }}>Commenting</li>
          <li style={{ fontSize: '16px', color: '#333' }}>light and dark mode</li>
        
      </ul>
      <p style={{ fontSize: '18px', color: '#555' }}>Built for learning, networking, and connecting with others.</p>
    </div>
  );
}

export default About;
