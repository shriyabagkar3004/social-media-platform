
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Pages/AuthContext';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import Feed from './Feed';
import CreatePost from './CreatePost';
import Profile from './Pages/Profile';
import About from './Pages/About';
import UserProfile from './Pages/UserProfile';
import './App.css';

function App() {

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <nav className="navbar" style={{ display: 'flex', gap: '15px', padding: '10px' }}>
          <Link to="/feed">Feed</Link>
          <Link to="/about">About</Link>
          <AuthContext.Consumer>
            {({ user, logout }) =>
              user ? (
                <>
                  <Link to="/profile">Profile</Link>
                  <Link to="/createpost">Create Post</Link>
                  <button onClick={logout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )
            }
          </AuthContext.Consumer>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route
            path="/feed"
            element={
              <AuthContext.Consumer>
                {({ user }) =>
                  user ? (
                    <Feed isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              </AuthContext.Consumer>
            }
          />
          <Route
            path="/createpost"
            element={
              <AuthContext.Consumer>
                {({ user }) => (user ? <CreatePost /> : <Navigate to="/login" />)}
              </AuthContext.Consumer>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthContext.Consumer>
                {({ user }) => (user ? <Profile /> : <Navigate to="/login" />)}
              </AuthContext.Consumer>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/feed" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// netlify redeploy trigger
