import React from "react";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div style={{ fontWeight: 700 }}>HR Platform</div>
        <div className="nav-links">
          <a className="nav-link" href="/login">Login</a>
          <a className="nav-link" href="/register">Register</a>
          <a className="nav-link" href="/dashboard">Dashboard</a>
          <a className="nav-link" href="/profile">Profile</a>
        </div>
      </div>
    </div>
  );
}
