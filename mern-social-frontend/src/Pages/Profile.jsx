
import React, { useEffect, useState } from 'react';
import api from './Api';

function Profile() {
  const [user, setUser ] = useState(null);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUser  = async () => {
      try {
        if (!userId) {
          setError('User  ID not found. Please log in again.');
          return;
        }

        const { data } = await api.get(`/users/${userId}`);
        setUser (data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      }
    };

    fetchUser ();
  }, [userId]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Loading profile...</p>;

  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
    }}>
      <h2 style={{ color: '#ff69b4' }}>My Profile</h2>
      {user.profilePic && (
        <img
          src={`http://localhost:5000/${user.profilePic}`}
          alt="Profile"
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            marginBottom: '20px',
            border: '4px solid rgba(255, 182, 193, 0.8)', 
          }}
        />
      )}
      <p style={{ fontSize: '18px', color: '#333', margin: '10px 0' }}>
        <strong style={{ color: '#d87093' }}>Username:</strong> {user.username}
      </p>
      <p style={{ fontSize: '18px', color: '#333', margin: '10px 0' }}>
        <strong style={{ color: '#d87093' }}>Email:</strong> {user.email}
      </p>
      <p style={{ fontSize: '18px', color: '#333', margin: '10px 0' }}>
        <strong style={{ color: '#d87093' }}>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default Profile;
