import React, { useState } from 'react';
import API from './Pages/Api';
import './CreatePost.css';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', content);
    if (media) formData.append('media', media);

    try {
      await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setContent('');
      setMedia(null);
      alert('Post created');
    } catch (err) {
      console.error('Post creation failed:', err);
      alert('Failed to create post');
    }
  };

  return (
    <form className="post-form" onSubmit={handleCreate}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post..."
        required
      />
      <input type="file" accept="image/*,video/*" onChange={(e) => setMedia(e.target.files[0])} />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;
