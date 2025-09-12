import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/pos", label: "POS", icon: "🛒" },
    { path: "/products", label: "Products", icon: "📦" },
    { path: "/invoices", label: "Invoices", icon: "🧾" },
    { path: "/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <>
      {/* Hamburger Button (only shows on mobile) */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu">
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="app-title">Dept Billing</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="section-title">Dashboard</h3>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // close menu after click
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
