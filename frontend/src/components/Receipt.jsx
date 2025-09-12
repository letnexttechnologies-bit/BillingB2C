import React from "react";
import "./Receipt.css"; // Ensure this CSS file is created as well

const Receipt = ({ invoice, onClose, onPrint }) => {
  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateSubtotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTaxableValue = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateGST = (items) => {
    const gstBreakdown = { cgst: 0, sgst: 0, total: 0 };
    items.forEach((item) => {
      // Assuming a default GST rate if not provided
      const gstRate = item.gstRate || 0.18;
      const taxableAmount = item.price * item.quantity;
      const gstAmount = taxableAmount * gstRate;
      gstBreakdown.cgst += gstAmount / 2;
      gstBreakdown.sgst += gstAmount / 2;
      gstBreakdown.total += gstAmount;
    });
    return gstBreakdown;
  };

  const subtotal = calculateSubtotal(invoice.items);
  const gst = calculateGST(invoice.items);
  const totalTaxableValue = calculateTaxableValue(invoice.items);

  const getFullGSTAmount = (item) => {
    const gstRate = item.gstRate || 0.18;
    return item.price * item.quantity * gstRate;
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-container">
        {/* Printable receipt */}
        <div className="receipt" id="receipt-to-print">
          <div className="receipt-header">
            <p className="company-name">
              {invoice.companyName || "SEENATH TRADERS"}
            </p>
            <p className="company-info">
              {invoice.companyAddress ||
                "307, VRLA STORES COMPLEX, T.V.S ROAD, PERANI - 626002"}
            </p>
            <p className="company-info">
              GSTIN: {invoice.gstin || "33ABCDE1234F1Z5"}
            </p>
            <p className="company-info">
              STATE: {invoice.state || "Tamil Nadu (33)"}
            </p>
            <p className="company-info">
              PH NO: {invoice.phone || "9583678702"}
            </p>
            <div className="invoice-details">
              <span>BILL DATE: {formatDate(invoice.date)}</span>
              <span>INVOICE #: {invoice.id}</span>
              <span>VRN NO: {invoice.vrnNo || "9383678702"}</span>
            </div>
          </div>

          <div className="receipt-divider">
            <span className="line">--------------------------------</span>
          </div>

          <div className="receipt-customer">
            <p>TO {invoice.customerName || "Customer Name Not Provided"}</p>
            <p>MOBILE: {invoice.customerMobile || "Mobile Not Provided"}</p>
            {invoice.customerAddress && (
              <p>ADDRESS: {invoice.customerAddress}</p>
            )}
            <p>
              <strong>Invoice ID:</strong> {invoice.id}
            </p>
          </div>

          <div className="receipt-items-table">
            <div className="table-header">
              <span
                colSpan="9"
                style={{ textAlign: "center", fontWeight: "bold" }}>
                Invoice #: {invoice.id}
              </span>
            </div>
            <div className="table-header">
              <span>SL.</span>
              <span className="desc">DESC</span>
              <span>HSN/SAC</span>
              <span>QTY</span>
              <span>RATE</span>
              <span>GROSS</span>
              <span>CGST</span>
              <span>SGST</span>
              <span>NET AMT</span>
            </div>
            {invoice.items.map((item, index) => (
              <div key={index} className="table-row">
                <span>{index + 1}.</span>
                <span className="item-desc">{item.name}</span>
                <span>{item.hsnSac || "19053100"}</span>
                <span>{item.quantity}</span>
                <span>{item.price.toFixed(2)}</span>
                <span>{(item.price * item.quantity).toFixed(2)}</span>
                <span>{(getFullGSTAmount(item) / 2).toFixed(2)}</span>
                <span>{(getFullGSTAmount(item) / 2).toFixed(2)}</span>
                <span>
                  {(
                    item.price * item.quantity +
                    getFullGSTAmount(item)
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="receipt-divider">
            <span className="line">--------------------------------</span>
          </div>

          <div className="receipt-totals">
            <div className="receipt-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="receipt-row">
              <span>CGST:</span>
              <span>{formatCurrency(gst.cgst)}</span>
            </div>
            <div className="receipt-row">
              <span>SGST:</span>
              <span>{formatCurrency(gst.sgst)}</span>
            </div>
            <div className="receipt-row total">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
          <div className="total-in-words">
            <p>** {`RUPEES ${Math.round(invoice.totalAmount)} ONLY`} **</p>
          </div>

          <div className="receipt-footer">
            <div className="receipt-footer-row">
              <span className="label">Total Taxable Value:</span>
              <span className="value">{formatCurrency(totalTaxableValue)}</span>
            </div>
            <p className="computer-note">
              ** This is a computer generated invoice **
            </p>
            <p className="thank-you">Thank you for your business!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="receipt-actions">
          <button onClick={onPrint} className="btn-primary">
            🖨️ Print Receipt
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
