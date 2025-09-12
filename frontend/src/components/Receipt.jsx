import React from "react";
import "./Receipt.css";

const Receipt = ({ invoice, onClose, onPrint }) => {
  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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

  // ✅ New computed total
  const computedTotal = subtotal + gst.cgst + gst.sgst;

  const getFullGSTAmount = (item) => {
    const gstRate = item.gstRate || 0.18;
    return item.price * item.quantity * gstRate;
  };

  const invoiceNumber = invoice.invoiceId ?? invoice._id ?? "N/A";

  return (
    <div className="receipt-overlay">
      <div className="receipt-container">
        {/* Printable receipt */}
        <div className="receipt" id="receipt-to-print">
          <div className="receipt-header">
            <p className="company-name">{invoice.companyName || "LetNext"}</p>
            <p className="company-info">
              {invoice.companyAddress ||
                "307, VELA STORES COMPLEX, T.V.S ROAD, ERODE - 600000"}
            </p>
            <p className="company-info">
              GSTIN: {invoice.gstin || "33ABCDE1234F1Z5"}
            </p>
            <p className="company-info">
              STATE: {invoice.state || "Tamil Nadu (33)"}
            </p>
            <p className="company-info">
              PH NO: {invoice.phone || "9025562875"}
            </p>
            <div className="invoice-details">
              <span>BILL DATE & TIME: {formatDateTime(invoice.date)}</span>
              <span>
                <strong>INVOICE ID: {invoiceNumber}</strong>
              </span>
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
              <strong>Invoice ID:</strong> {invoiceNumber}
            </p>
          </div>

          <div className="receipt-items-table">
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
              <span>{formatCurrency(computedTotal)}</span>
            </div>
          </div>
          <div className="total-in-words">
            <p>** {`RUPEES ${Math.round(computedTotal)} ONLY`} **</p>
          </div>

          <div className="receipt-footer">
            <div className="receipt-footer-row">
              <span className="label">Total Taxable Value:</span>
              <span className="value">{formatCurrency(computedTotal)}</span>
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
