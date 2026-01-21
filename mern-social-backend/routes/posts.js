const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* ---------- REPORT IMPORTS (CORRECT) ---------- */
const generatePDF = require("../report/PostReportPDF");
const generateCSV = require("../report/PostReportCSV");

/* ---------- REPORT REGEN FUNCTION ---------- */
async function regenerateReports() {
  const posts = await Post.find()
    .populate("user", "username")
    .sort({ createdAt: -1 });

  await generatePDF(posts);
  await generateCSV(posts);
}

/* ---------- MULTER ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});
const upload = multer({ storage });

/* ---------------------- CREATE POST ---------------------- */
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user,
      content: req.body.content,
      media: req.file ? `uploads/${req.file.filename}` : '', // permanent
    });
    const savedPost = await newPost.save();
    await regenerateReports(); // if reports need update
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Post creation error:', err.message);
    res.status(500).json({ error: 'Server error while creating post' });
  }
});


/* ---------------------- GET ALL POSTS ---------------------- */
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

/* ---------------------- LIKE POST ---------------------- */
router.patch('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.user)) {
      post.likes.push(req.user);
    } else {
      post.likes = post.likes.filter(u => u.toString() !== req.user);
    }

    await post.save();
    await regenerateReports(); // ✅

    res.json(post);
  } catch (err) {
    console.error('Like error:', err.message);
    res.status(500).json({ error: 'Server error while liking post' });
  }
});

/* ---------------------- SHARE POST ---------------------- */
router.patch('/share/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.shares.includes(req.user)) {
      post.shares.push(req.user);
    } else {
      post.shares = post.shares.filter(u => u.toString() !== req.user);
    }

    await post.save();
    await regenerateReports(); // ✅

    res.json(post);
  } catch (err) {
    console.error('Share error:', err.message);
    res.status(500).json({ error: 'Server error while sharing post' });
  }
});

/* ---------------------- ADD COMMENT ---------------------- */
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      user: req.user,
      text: req.body.text,
    });

    await post.save();
    await regenerateReports(); // ✅

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

/* ---------------------- DELETE POST ---------------------- */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.user.toString() !== req.user)
      return res.status(403).json({ error: 'Unauthorized' });

    if (post.media) {
      const filePath = path.join(__dirname, '..', post.media);
      fs.unlink(filePath, () => {});
    }

    await post.deleteOne();
    await regenerateReports(); // ✅

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
});
module.exports = router;
