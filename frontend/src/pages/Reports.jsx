import React, { useState, useEffect, useCallback } from "react";
import { getInvoices, getInvoiceById } from "../api/index";
import Receipt from "../components/Receipt";
import "./Reports.css";

const Reports = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("ALL");
  const [salesSummary, setSalesSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageSale: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Memoize the loadInvoices function to stabilize its identity for the useEffect hook
  const loadInvoices = useCallback(async () => {
    try {
      const allInvoices = await getInvoices(); // await here
      setInvoices(allInvoices || []);
      setFilteredInvoices(allInvoices || []);
      calculateSummary(allInvoices || []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setInvoices([]);
      setFilteredInvoices([]);
      calculateSummary([]);
    }
  }, []);
  // Empty dependency array because getInvoices is a stable function from localStorage

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]); // Now correctly depends on the memoized loadInvoices

  const calculateSummary = (invList) => {
    const totalRevenue = invList.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalTransactions = invList.length;
    const averageSale =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    setSalesSummary({
      totalRevenue,
      totalTransactions,
      averageSale,
    });
  };

  const applyFilters = () => {
    let filtered = invoices;

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.date).toDateString();
        const filterDateObj = new Date(filterDate).toDateString();
        return invoiceDate === filterDateObj;
      });
    }

    // Filter by payment method
    if (filterPaymentMethod !== "ALL") {
      filtered = filtered.filter(
        (invoice) => invoice.paymentMethod === filterPaymentMethod
      );
    }

    setFilteredInvoices(filtered);
    calculateSummary(filtered);
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterPaymentMethod("ALL");
    setFilteredInvoices(invoices);
    calculateSummary(invoices);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Customer",
      "Items",
      "Total Amount",
      "Payment Method",
    ];
    const csvData = filteredInvoices.map((invoice) => [
      invoice.id,
      new Date(invoice.date).toLocaleString(),
      invoice.customerName,
      invoice.items.length,
      formatCurrency(invoice.totalAmount),
      invoice.paymentMethod,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getPaymentMethodCounts = () => {
    const counts = {
      CASH: 0,
      CARD: 0,
      UPI: 0,
      WALLET: 0,
    };

    filteredInvoices.forEach((invoice) => {
      counts[invoice.paymentMethod] = (counts[invoice.paymentMethod] || 0) + 1;
    });

    return counts;
  };

  const handleViewReceipt = (invoiceId) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowReceipt(true);
    } else {
      console.error("Invoice not found:", invoiceId);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedInvoice(null);
  };

  const paymentMethodCounts = getPaymentMethodCounts();

  return (
    <div className="reports-container">
      <h1>Invoices Analytics</h1>

      {/* Filters */}
      <div className="filters-section">
        <h2>Filter Reports</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Payment Method:</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}>
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="WALLET">Wallet</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button onClick={applyFilters} className="btn-primary">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="payment-distribution">
        <h2>Payment Method Distribution</h2>
        <div className="payment-cards">
          {Object.entries(paymentMethodCounts).map(([method, count]) => (
            <div key={method} className="payment-card">
              <span className="payment-method">{method}</span>
              <span className="payment-count">{count} transactions</span>
              <span className="payment-percentage">
                {salesSummary.totalTransactions > 0
                  ? Math.round((count / salesSummary.totalTransactions) * 100)
                  : 0}
                %
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="export-section">
        <button onClick={exportToCSV} className="export-btn">
          📥 Export to CSV
        </button>
        <span className="export-info">
          Showing {filteredInvoices.length} of {invoices.length} transactions
        </span>
      </div>

      {/* Sales Table */}
      <div className="sales-table-container">
        <h2>Sales History</h2>
        {filteredInvoices.length === 0 ? (
          <p className="no-data">
            No sales records found.{" "}
            {filterDate || filterPaymentMethod !== "ALL"
              ? "Try changing your filters."
              : "Start selling to see transactions here."}
          </p>
        ) : (
          <div className="sales-table">
            <div className="table-header">
              <span>Invoice ID</span>
              <span>Date & Time</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Total Amount</span>
              <span>Payment Method</span>
              <span>Actions</span>
            </div>
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="table-row">
                <span className="invoice-id">{invoice.id}</span>
                <span className="date">{formatDate(invoice.date)}</span>
                <span className="customer">{invoice.customerName}</span>
                <span className="items">{invoice.items.length} items</span>
                <span className="amount">
                  {formatCurrency(invoice.totalAmount)}
                </span>
                <span
                  className={`payment-method ${invoice.paymentMethod.toLowerCase()}`}>
                  {invoice.paymentMethod}
                </span>
                <span className="actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewReceipt(invoice.id)}
                    title="View Receipt">
                    👁️ View
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Receipt
          invoice={selectedInvoice}
          onClose={handleCloseReceipt}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default Reports;
