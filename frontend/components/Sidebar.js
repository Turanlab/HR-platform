import React from "react";

export default function Sidebar() {
  return (
    <div className="card" style={{ minWidth: 240 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Menu</div>
      <div style={{ display: "grid", gap: 10 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/cv-upload">CV Upload</a>
        <a href="/cv-search">CV Search</a>
        <a href="/messages">Messages</a>
      </div>
    </div>
  );
}
