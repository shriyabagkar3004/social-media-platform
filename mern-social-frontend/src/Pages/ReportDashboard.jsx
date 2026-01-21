import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportDashboard = () => {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/posts/pdf", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "posts_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF download error:", err.response?.data || err.message);
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/posts/csv", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "posts_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV download error:", err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#1976d2", textAlign: "center" }}>Posts Report</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={{ padding: "8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "8px", textAlign: "left" }}>User</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Content</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Likes</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Comments</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Shares</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={p._id} style={{ backgroundColor: "#fff" }}>
                <td style={{ padding: "8px" }}>{i + 1}</td>
                <td style={{ padding: "8px" }}>{p.user?.username}</td>
                <td style={{ padding: "8px" }}>{p.content}</td>
                <td style={{ padding: "8px" }}>{p.likes.length}</td>
                <td style={{ padding: "8px" }}>{p.comments.length}</td>
                <td style={{ padding: "8px" }}>{p.shares.length}</td>
                <td style={{ padding: "8px" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={downloadPDF}
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "10px 25px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download PDF
        </button>
        <button
          onClick={downloadCSV}
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "10px 25px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default ReportDashboard;
