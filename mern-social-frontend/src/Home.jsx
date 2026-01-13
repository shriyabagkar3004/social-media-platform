import React, { useEffect, useState } from 'react';

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/posts', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {posts.map((post) => (
        <div key={post._id}>
          <h3>{post.author.name}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
