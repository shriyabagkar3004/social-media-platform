const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = async function generatePostReportPDF(posts) {
  const filePath = path.join(__dirname, "../reports/posts_report.pdf");
  const doc = new PDFDocument({ margin: 30 });

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Posts Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();

  posts.forEach((post, i) => {
    doc.text(`${i + 1}. Post ID: ${post._id}`);
    doc.text(`User: ${post.user?.username || post.user}`);
    doc.text(`Content: ${post.content}`);
    doc.text(`Likes: ${post.likes.length}`);
    doc.text(`Shares: ${post.shares.length}`);
    doc.text(`Comments: ${post.comments.length}`);
    doc.text(`Created At: ${post.createdAt}`);
    doc.moveDown();
  });

  doc.end();
};
