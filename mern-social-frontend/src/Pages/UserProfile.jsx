import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './Api';
import './UserProfile.css';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return '';
    const baseUrl =
      process.env.REACT_APP_API_URL?.replace('/api','') || 
      'https://social-media-platform-2-lce7.onrender.com';
    return `${baseUrl}/${mediaPath}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get(`/users/${id}`);
        setUser(userRes.data);

        const postRes = await api.get(`/posts/user/${id}`);
        setPosts(postRes.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div className="user-profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-wrapper">
          {user.profilePic || user.profileImage ? (
            <img
              src={getMediaUrl(user.profilePic || user.profileImage)}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <img
              src="/default-profile.png"
              alt="Default"
              className="profile-image"
            />
          )}
        </div>

        <div className="profile-details">
          <h2 className="username">{user.username || user.name}</h2>
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>
      </div>

      {/* User's Posts */}
      <div className="user-posts">
        <h3>{user.username || 'User'}'s Posts</h3>
        <div className="posts-grid">
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-media">
                  {post.media?.endsWith('.mp4') ? (
                    <video controls>
                      <source src={getMediaUrl(post.media)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={getMediaUrl(post.media)}
                      alt="Post"
                    />
                  )}
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                  <p className="post-timestamp">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
