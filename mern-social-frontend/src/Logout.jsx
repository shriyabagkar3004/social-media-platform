import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        alert('Logged out successfully');
        navigate('/login');
      });
  }, [navigate]);

  return <h1>Logging out...</h1>;
}
export default Logout;
