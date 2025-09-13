import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import PointOfSale from "./pages/PointOfSale";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import ReportChart from "./pages/ReportChart";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Restore login state on refresh
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const storedUsername = localStorage.getItem("username");

    if (loggedInStatus === "true") {
      setIsLoggedIn(true);
      setUsername(storedUsername || "Admin");
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUsername(localStorage.getItem("username") || "Admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  // Handle install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("✅ App installed");
      } else {
        console.log("❌ Install dismissed");
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <BrowserRouter>
      <div
        className={`app-container ${
          isLoggedIn ? "with-navbar" : "login-only"
        }`}>
        {isLoggedIn && <Navbar username={username} onLogout={handleLogout} />}

        {/* Show install button if prompt is available */}
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            style={{
              position: "fixed",
              bottom: "16px",
              right: "16px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              zIndex: 9999,
            }}>
            📲 Install App
          </button>
        )}

        <div
          className={`main-content ${
            !isLoggedIn ? "login-page" : "dashboard-page"
          }`}>
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Dashboard />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/pos"
              element={isLoggedIn ? <PointOfSale /> : <Navigate to="/" />}
            />
            <Route
              path="/products"
              element={isLoggedIn ? <Inventory /> : <Navigate to="/" />}
            />
            <Route
              path="/invoices"
              element={isLoggedIn ? <Reports /> : <Navigate to="/" />}
            />
            <Route
              path="/reports"
              element={isLoggedIn ? <ReportChart /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
