const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const Post = require("../models/Post"); // तुमचा Post model

// Middleware: token verify
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });
  // simple dummy check, तुम्ही JWT verify करू शकता
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Invalid token" });
  next();
};

// ------------------- PDF -------------------
router.get("/posts/pdf", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username").lean();

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=posts_report.pdf");

    doc.fontSize(18).text("Social Media Platform – Posts Report", { align: "center" });
    doc.moveDown();

    // Table header
    doc.fontSize(12).text("#  User  Content  Likes  Comments  Shares  Date");
    doc.moveDown(0.5);

    posts.forEach((p, i) => {
      doc.text(
        `${i + 1}  ${p.user?.username || "N/A"}  ${p.content}  ${p.likes.length}  ${p.comments.length}  ${p.shares.length}  ${new Date(p.createdAt).toLocaleDateString()}`
      );
    });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ------------------- CSV -------------------
router.get("/posts/csv", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username").lean();

    const fields = ["#", "User", "Content", "Likes", "Comments", "Shares", "Date"];
    const data = posts.map((p, i) => ({
      "#": i + 1,
      User: p.user?.username || "N/A",
      Content: p.content,
      Likes: p.likes.length,
      Comments: p.comments.length,
      Shares: p.shares.length,
      Date: new Date(p.createdAt).toLocaleDateString(),
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=posts_report.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
