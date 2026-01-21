const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

module.exports = async function generatePostReportCSV(posts) {
  const filePath = path.join(__dirname, "../reports/posts_report.csv");

  const data = posts.map(p => ({
    postId: p._id,
    user: p.user?.username || p.user,
    content: p.content,
    likes: p.likes.length,
    shares: p.shares.length,
    comments: p.comments.length,
    createdAt: p.createdAt
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  fs.writeFileSync(filePath, csv);
};
