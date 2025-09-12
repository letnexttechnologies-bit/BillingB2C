import React, { useState } from "react";
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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <div
        className={`app-container ${
          isLoggedIn ? "with-navbar" : "login-only"
        }`}>
        {isLoggedIn && <Navbar onLogout={handleLogout} />}

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
