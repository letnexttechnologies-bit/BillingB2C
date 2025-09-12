import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add useNavigate hook
import { getInvoices, getProducts } from "../api/index";
import "./Dashboard.css";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    todayRevenue: 0,
    totalSales: 0,
    totalInvoices: 0, // Keep this metric
  });
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = async () => {
    try {
      const products = await getProducts();
      const invoices = await getInvoices();

      const today = new Date().toDateString();

      const totalProducts = products.length;
      const outOfStock = products.filter(
        (p) => (p.stockQuantity || 0) === 0
      ).length;
      const lowStock = products.filter(
        (p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5
      ).length;

      const todayRevenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.date);
          return invDate.toDateString() === today && !isNaN(invDate.getTime());
        })
        .reduce((total, inv) => total + (Number(inv.totalAmount) || 0), 0);

      const totalSales = invoices.reduce(
        (total, inv) => total + (Number(inv.totalAmount) || 0),
        0
      );

      const totalInvoices = invoices.length;

      setMetrics({
        totalProducts,
        outOfStock,
        lowStock,
        todayRevenue,
        totalSales,
        totalInvoices,
      });
    } catch (error) {
      console.error("Error calculating metrics:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Use useNavigate for navigation
  const handleNewSale = () => navigate("/pos");
  const handleManageInventory = () => navigate("/products");
  const handleViewInvoices = () => navigate("/invoices");

  return (
    <div className="dashboard-container">
      <h1>Dashboard Overview</h1>

      <div className="metrics-grid">
        <div className="metric-card" role="article" aria-label="Total Products">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3>{metrics.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div
          className="metric-card"
          role="article"
          aria-label="Today's Revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.todayRevenue)}</h3>
            <p>Today's Sales</p>
          </div>
        </div>

        <div className="metric-card" role="article" aria-label="Total Sales">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <h3>{formatCurrency(metrics.totalSales)}</h3>
            <p>Overall Sales</p>
          </div>
        </div>

        <div
          className="metric-card warning"
          role="article"
          aria-label="Low Stock Items">
          <div className="metric-icon">⚠️</div>
          <div className="metric-info">
            <h3>{metrics.lowStock}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>

        <div
          className="metric-card danger"
          role="article"
          aria-label="Out of Stock">
          <div className="metric-icon">🚫</div>
          <div className="metric-info">
            <h3>{metrics.outOfStock}</h3>
            <p>Out of Stock</p>
          </div>
        </div>

        <div className="metric-card" role="article" aria-label="Total Invoices">
          <div className="metric-icon">🧾</div>
          <div className="metric-info">
            <h3>{metrics.totalInvoices}</h3>
            <p>Total Invoices</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleNewSale}>
            ➕ New Sale
          </button>
          <button
            className="action-btn secondary"
            onClick={handleManageInventory}>
            📦 Manage Inventory
          </button>
          <button className="action-btn success" onClick={handleViewInvoices}>
            🧾 View Invoices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
