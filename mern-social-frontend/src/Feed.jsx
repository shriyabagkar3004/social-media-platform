import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from './Pages/Api';
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShare,
  FaTrash,
} from 'react-icons/fa';
import './App.css';

function Feed({ isDarkMode, setIsDarkMode }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);

  const userId = localStorage.getItem('userId');
  const fileInputRef = useRef(null);

  const loadPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      console.error('Load error:', err);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('content', content);
    if (media) form.append('media', media);

    try {
      await api.post('/posts', form);
      setContent('');
      setMedia(null);
      fileInputRef.current.value = '';
      loadPosts();
    } catch (err) {
      console.error('Create post error:', err.response ? err.response.data : err.message);
      alert('Failed to create post: ' + (err.response ? err.response.data.message : 'Unknown error'));
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Delete error:', err.response ? err.response.data : err.message);
      alert('Failed to delete post: ' + (err.response ? err.response.data.message : 'Unknown error'));
    }
  };

  const toggleLike = async (id) => {
    try {
      const { data } = await api.patch(`/posts/like/${id}`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === data._id ? { ...data, user: p.user } : p
        )
      );
    } catch (err) {
      console.error('Like error:', err.response ? err.response.data : err.message);
      alert('Failed to like post: ' + (err.response ? err.response.data.message : 'Unknown error'));
    }
  };

  const toggleShare = async (id) => {
    try {
      await api.patch(`/posts/share/${id}`);
      navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
      alert('Post link copied to clipboard!');
      loadPosts();
    } catch (err) {
      console.error('Share error:', err.response ? err.response.data : err.message);
      alert('Failed to share post: ' + (err.response ? err.response.data.message : 'Unknown error'));
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentTextMap((prev) => ({ ...prev, [postId]: text }));
  };

  const handleComment = async (postId) => {
    const text = commentTextMap[postId]?.trim();
    if (!text) return;
    try {
      const { data } = await api.post(`/posts/comment/${postId}`, { text });
      setPosts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setCommentTextMap((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Comment error:', err.response ? err.response.data : err.message);
      alert('Failed to comment: ' + (err.response ? err.response.data.message : 'Unknown error'));
    }
  };

  const isLikedByUser = (likes) =>
    likes?.some((like) =>
      typeof like === 'object' ? like._id === userId : like === userId
    );

  // Helper to get full media URL
  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return '';
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://social-media-platform-2-lce7.onrender.com';
    return `${baseUrl}/${mediaPath}`;
  };

  return (
    <div className="feed">
      <nav className="navbar">
        <h1>My Feed</h1>
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="delete-all-button"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </nav>

      <form onSubmit={handleCreate} className="post-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows="3"
          className="post-input"
        />
        <input
          type="file"
          onChange={(e) => setMedia(e.target.files[0])}
          className="file-input"
          ref={fileInputRef}
        />
        <button type="submit" className="post-button">Post</button>
      </form>

      {posts.map((post) => (
        <div key={post._id} className="post">
          <p className="post-header">
            <h4
              className="clickable-username"
              onClick={() => window.location.href = `/user/${post.user?._id}`}
              style={{ cursor: 'pointer', color: 'blue', display: 'inline-block', marginRight: '8px' }}
            >
              {post.user?.username || 'Unknown'}
            </h4>
            • {new Date(post.createdAt).toLocaleString()}
          </p>

          <p className="post-content">{post.content}</p>

          <div className="post-media">
            {post.media && (
              post.media.endsWith('.mp4') ? (
                <video controls width="100%" src={getMediaUrl(post.media)} />
              ) : (
                <img src={getMediaUrl(post.media)} alt="post" className="post-image" />
              )
            )}
          </div>

          <div className="post-actions">
            <span
              onClick={() => toggleLike(post._id)}
              className="like-button"
              style={{ color: isLikedByUser(post.likes) ? 'red' : 'black' }}
            >
              {isLikedByUser(post.likes) ? <FaHeart /> : <FaRegHeart />} {post.likes.length}
            </span>

            <span
              onClick={() => setCommentingPostId(commentingPostId === post._id ? null : post._id)}
              className="comment-button"
            >
              <FaCommentDots /> {post.comments.length}
            </span>

            <button onClick={() => toggleShare(post._id)} className="share-button">
              <FaShare /> Share
            </button>

            {post.user?._id === userId && (
              <button onClick={() => handleDeletePost(post._id)} className="delete-button">
                <FaTrash /> Delete
              </button>
            )}
          </div>

          {commentingPostId === post._id && (
            <div className="comment-section">
              <input
                type="text"
                value={commentTextMap[post._id] || ''}
                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button onClick={() => handleComment(post._id)} className="comment-button">Post</button>

              <div className="comments">
                {post.comments.map((c) => (
                  <div key={c._id} className="comment">
                    <p>
                      <strong>{c.user?.username || 'User'}</strong>: {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Feed;