import React, { useState, useEffect, useCallback } from "react";
import { getInvoices } from "../api/index";
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

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 10;

  const loadInvoices = useCallback(async () => {
    try {
      const allInvoices = await getInvoices();
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

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

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

    if (filterDate) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.date).toDateString();
        const filterDateObj = new Date(filterDate).toDateString();
        return invoiceDate === filterDateObj;
      });
    }

    if (filterPaymentMethod !== "ALL") {
      filtered = filtered.filter(
        (invoice) => invoice.paymentMethod === filterPaymentMethod
      );
    }

    setFilteredInvoices(filtered);
    calculateSummary(filtered);
    setCurrentPage(1); // ✅ Reset page when filters change
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterPaymentMethod("ALL");
    setFilteredInvoices(invoices);
    calculateSummary(invoices);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
      invoice.id ?? "N/A",
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
    const counts = { CASH: 0, CARD: 0, UPI: 0, WALLET: 0 };
    filteredInvoices.forEach((invoice) => {
      counts[invoice.paymentMethod] = (counts[invoice.paymentMethod] || 0) + 1;
    });
    return counts;
  };

  const handleViewReceipt = (invoiceId) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowReceipt(true);
    } else {
      console.error("Invoice not found:", invoiceId);
    }
  };

  const handlePrintReceipt = () => window.print();
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedInvoice(null);
  };

  const paymentMethodCounts = getPaymentMethodCounts();

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

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

      {/* Payment Distribution */}
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
          <>
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
              {currentInvoices.map((invoice) => (
                <div key={invoice._id} className="table-row">
                  <span className="invoice-id">
                    {invoice.invoiceId ?? invoice._id}
                  </span>
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
                      onClick={() => handleViewReceipt(invoice._id)}
                      title="View Receipt">
                      👁️ View
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(1)}>
                  ⏮ First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}>
                  ◀ Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active-page" : ""}
                    onClick={() => goToPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}>
                  Next ▶
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(totalPages)}>
                  Last ⏭
                </button>
              </div>
            )}
          </>
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
