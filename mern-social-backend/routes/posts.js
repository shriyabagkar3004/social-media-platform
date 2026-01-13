

const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User'); 
const fs = require('fs');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});
const upload = multer({ storage });

/* ---------------------- Create Post ---------------------- */
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user,
      content: req.body.content,
      media: req.file ? `uploads/${req.file.filename}` : '',
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Post creation error:', err.message);
    res.status(500).json({ error: 'Server error while creating post' });
  }
});

/* ---------------------- Get All Posts ---------------------- */
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate('likes shares', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err.message);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
});

/* ---------------------- Get Posts by User ID ---------------------- */
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate('user', 'username')
      .populate('likes shares', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Fetch user posts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

/* ---------------------- Like Post ---------------------- */
router.patch('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user)) {
      post.likes.push(req.user);
    } else {
      post.likes = post.likes.filter(u => u.toString() !== req.user);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Like error:', err.message);
    res.status(500).json({ error: 'Server error while liking post' });
  }
});

/* ---------------------- Share Post ---------------------- */
router.patch('/share/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.shares.includes(req.user)) {
      post.shares.push(req.user);
    } else {
      post.shares = post.shares.filter(u => u.toString() !== req.user);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Share error:', err.message);
    res.status(500).json({ error: 'Server error while sharing post' });
  }
});

/* ---------------------- Add Comment ---------------------- */
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = {
      user: req.user,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username')
      .populate('likes shares', 'username')
      .populate('comments.user', 'username');

    res.status(201).json(updatedPost);
  } catch (err) {
    console.error('Comment error:', err.message);
    res.status(500).json({ error: 'Server error while adding comment' });
  }
});

/* ---------------------- Delete Post ---------------------- */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user)
      return res.status(403).json({ error: 'Unauthorized to delete this post' });

    if (post.media) {
      const filePath = path.join(__dirname, '..', post.media);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to delete file:', err.message);
      });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
});

/* ---------------------- Delete Comment ---------------------- */
router.delete('/comment/:postId/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user.toString() !== req.user) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully', post });
  } catch (err) {
    console.error('Delete comment error:', err.message);
    res.status(500).json({ error: 'Server error while deleting comment' });
  }
});

/* ---------------------- Delete All Posts ---------------------- */
router.delete('/', auth, async (req, res) => {
  try {
    await Post.deleteMany({});
    res.status(200).json({ message: 'All posts deleted successfully' });
  } catch (error) {
    console.error('Error deleting posts:', error);
    res.status(500).json({ message: 'Error deleting posts' });
  }
});

/* ---------------------- Remove User from Feed ---------------------- */
router.delete('/remove-from-feed/:userId', auth, async (req, res) => {
  const userId = req.params.userId;
  try {
    const currentUser = req.user; // Get current authenticated user
    // Logic to remove userId from currentUser's feed
    await User.updateOne({ _id: currentUser._id }, { $pull: { feed: userId } });
    res.json({ message: 'User removed from feed' });
  } catch (err) {
    console.error('Error removing user from feed:', err.message);
    res.status(500).json({ error: 'Failed to remove user from feed' });
  }
});

module.exports = router;

// Hide a user (remove their posts from feed)
router.post('/removeUser/:id', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.removedUsers.includes(req.params.id)) {
      currentUser.removedUsers.push(req.params.id);
      await currentUser.save();
    }
    res.json({ msg: 'User removed from feed' });
  } catch (err) {
    console.error('Remove error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Restore a user (bring their posts back to feed)
router.post('/restoreUser/:id', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    currentUser.removedUsers = currentUser.removedUsers.filter(uid => uid != req.params.id);
    await currentUser.save();
    res.json({ msg: 'User restored to feed' });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
