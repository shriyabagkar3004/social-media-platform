const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

// ------------------- Stats -------------------
router.get("/stats", async (req, res) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ msg: "No token provided" });

    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalLikes = (await Post.find()).reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = (await Post.find()).reduce((sum, p) => sum + p.comments.length, 0);

    res.json({ totalPosts, totalUsers, totalLikes, totalComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ------------------- Download PDF -------------------
router.get("/posts/pdf", async (req, res) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ msg: "No token provided" });

    const posts = await Post.find().populate("user", "username").sort({ createdAt: -1 });

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", "attachment; filename=posts_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Posts Report", { align: "center" });
    doc.moveDown();

    posts.forEach((p, i) => {
      doc.fontSize(12).text(`${i + 1}. ${p.user.username} | ${p.content} | Likes: ${p.likes.length} | Comments: ${p.comments.length} | Shares: ${p.shares.length} | Date: ${p.createdAt.toLocaleString()}`);
      if (p.media) {
        doc.image(`./${p.media}`, { width: 200 });
      }
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("PDF error:", err);
    res.status(500).json({ msg: "PDF generation failed" });
  }
});

// ------------------- Download CSV -------------------
router.get("/posts/csv", async (req, res) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ msg: "No token provided" });

    const posts = await Post.find().populate("user", "username").sort({ createdAt: -1 });

    const fields = ["user.username", "content", "likes.length", "comments.length", "shares.length", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(posts);

    res.header("Content-Type", "text/csv");
    res.attachment("posts_report.csv");
    res.send(csv);
  } catch (err) {
    console.error("CSV error:", err);
    res.status(500).json({ msg: "CSV generation failed" });
  }
});

module.exports = router;
