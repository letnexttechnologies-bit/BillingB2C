import React, { useState, useEffect, useRef } from "react";
import {
  getCustomers,
  getCustomerByMobile,
  saveCustomer,
  saveInvoice,
  getProducts,
} from "../api/index";

import "./PointOfSale.css";
import Receipt from "../components/Receipt";
import PaymentGateway from "../components/PaymentGateway";

const PointOfSale = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    address: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [allCustomers, setAllCustomers] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const scannerInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // ✅ Load products & customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedProducts = await getProducts();
        const loadedCustomers = await getCustomers();
        setProducts(Array.isArray(loadedProducts) ? loadedProducts : []);
        setAllCustomers(Array.isArray(loadedCustomers) ? loadedCustomers : []);
      } catch (err) {
        console.error("Failed to load products or customers:", err);
        setProducts([]);
        setAllCustomers([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (scanning && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [scanning]);

  // ✅ Search customer by mobile
  useEffect(() => {
    const fetchCustomer = async () => {
      if (customer.mobile && customer.mobile.length >= 10) {
        try {
          const existingCustomer = await getCustomerByMobile(customer.mobile);
          if (existingCustomer) {
            setCustomer(existingCustomer);
          }
        } catch (err) {
          console.error("Failed to fetch customer:", err);
        }
      }
    };
    fetchCustomer();
  }, [customer.mobile]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tagNo &&
        product.tagNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const findProductBySearchTerm = (term) => {
    return products.find(
      (product) =>
        product.name.toLowerCase() === term.toLowerCase() ||
        (product.tagNo && product.tagNo.toLowerCase() === term.toLowerCase())
    );
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      const product = findProductBySearchTerm(searchTerm.trim());
      if (product) {
        addToCart(product);
        setSearchTerm("");
      } else {
        alert("Product not found: " + searchTerm);
      }
    }
  };

  const handleScanCode = (code) => {
    setScannedCode(code);
    const product = products.find(
      (p) =>
        p.barcode === code ||
        p.qrCode === code ||
        p._id === code ||
        p.tagNo === code
    );
    if (product) {
      addToCart(product);
      setScannedCode("");
      if (scanning) setScanning(false);
    } else {
      alert("Product not found for code: " + code);
    }
  };

  // ✅ Mobile search
  const handleMobileSearch = async () => {
    if (mobileSearch.trim()) {
      try {
        const existingCustomer = await getCustomerByMobile(mobileSearch);
        if (existingCustomer) {
          setCustomer(existingCustomer);
        } else {
          setCustomer({ name: "", mobile: mobileSearch, address: "" });
        }
        setMobileSearch("");
      } catch (err) {
        console.error("Failed to search customer:", err);
      }
    }
  };

  const getProductDisplay = (product) => {
    const unit = product.unit || "piece";
    switch (unit) {
      case "kg":
        return `${product.name} (per kg)`;
      case "gram":
        return `${product.name} (per 100g)`;
      case "pack":
        return `${product.name} (per pack)`;
      case "litre":
        return `${product.name} (per litre)`; // ✅ NEW
      default:
        return product.name;
    }
  };

  const getStockDisplay = (product) => {
    const unit = product.unit || "piece";
    switch (unit) {
      case "kg":
        return `${product.stockQuantity} kg in stock`;
      case "gram":
        return `${product.stockQuantity} g in stock`;
      case "pack":
        return `${product.stockQuantity} pack${
          product.stockQuantity !== 1 ? "s" : ""
        } in stock`;
      case "litre":
        return `${product.stockQuantity} litre${
          product.stockQuantity !== 1 ? "s" : ""
        } in stock`; // ✅ NEW
      default:
        return `${product.stockQuantity} pc${
          product.stockQuantity !== 1 ? "s" : ""
        } in stock`;
    }
  };

  const getCartItemDisplay = (item) => {
    const product = products.find((p) => p._id === item.productId);
    const unit = product?.unit || "piece";
    switch (unit) {
      case "kg":
        return `${item.quantity} kg ${item.name}`;
      case "gram":
        return `${item.quantity} g ${item.name}`;
      case "pack":
        return `${item.quantity} pack${item.quantity !== 1 ? "s" : ""} ${
          item.name
        }`;
      case "litre":
        return `${item.quantity} litre${item.quantity !== 1 ? "s" : ""} ${
          item.name
        }`; // ✅ NEW
      default:
        return `${item.quantity} ${item.name}`;
    }
  };

  // ✅ Add to Cart with quantity
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      alert("This product is out of stock!");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        alert("Not enough stock available!");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id, // ✅ MongoDB ID for backend
          name: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit || "piece",
        },
      ]);
    }

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p._id === productId);
    if (product && newQuantity > product.stockQuantity) {
      alert("Not enough stock available!");
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartItemCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  // ✅ Payment success → FIXED invoice payload
  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      await saveCustomer(customer);

      const invoice = {
        customerName: customer.name || "Walk-in Customer",
        customerMobile: customer.mobile || "0000000000", // ✅ always present
        customerAddress: customer.address || "",

        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit || "piece",
        })),

        subtotal: getCartTotal(),
        totalAmount: getCartTotal(),
        paymentMethod,
        paymentDetails,
        transactionId: `TXN${Date.now()}`,
        status: "completed",
        date: new Date().toISOString(),
      };

      try {
        await saveInvoice(invoice);
      } catch (err) {
        console.error("Save invoice failed, storing locally instead:", err);
        localStorage.setItem("failed_invoice", JSON.stringify(invoice));
      }

      setCurrentInvoice(invoice);
      setShowReceipt(true);
      setShowPaymentGateway(false);

      // Reset cart
      setCart([]);
      setPaymentMethod("CASH");
    } catch (err) {
      console.error("Failed during payment success:", err);
    }
  };

  const handlePaymentFailure = (error) => {
    alert(`Payment failed: ${error}`);
    setShowPaymentGateway(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!customer.name || !customer.mobile) {
      alert("Please enter customer name and mobile number!");
      return;
    }

    if (paymentMethod === "CASH") {
      await handlePaymentSuccess({
        method: "CASH",
        transactionId: `CASH${Date.now()}`,
      });
    } else {
      setShowPaymentGateway(true);
    }
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm("Clear all items from cart?")) {
      setCart([]);
    }
  };

  const clearCustomer = () => {
    setCustomer({ name: "", mobile: "", address: "" });
    setMobileSearch("");
  };

  const handlePrint = () => window.print();
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentInvoice(null);
  };

  return (
    <div className="pos-container">
      {/* Scanner overlay */}
      {scanning && (
        <div className="scanner-overlay">
          <div className="scanner-container">
            <h3>Scan Barcode/QR Code or Enter Tag Number</h3>
            <input
              ref={scannerInputRef}
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleScanCode(scannedCode)
              }
              placeholder="Scan or enter code/tag number manually"
              className="scanner-input"
              autoFocus
            />
            <div className="scanner-actions">
              <button
                onClick={() => handleScanCode(scannedCode)}
                className="scan-confirm-btn">
                Add Product
              </button>
              <button
                onClick={() => setScanning(false)}
                className="scan-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway */}
      {showPaymentGateway && (
        <PaymentGateway
          amount={getCartTotal()}
          paymentMethod={paymentMethod}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={() => setShowPaymentGateway(false)}
        />
      )}

      {/* Products */}
      <div className="product-selection">
        <div className="search-header">
          <h2>Point of Sale</h2>
          <div className="search-controls">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by name or tag number (Press Enter to add)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="search-input"
            />
            <button
              onClick={() => setScanning(true)}
              className="scan-btn"
              title="Scan Barcode/QR Code or Enter Tag Number">
              📷 Scan
            </button>
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`product-item ${
                product.stockQuantity <= 0 ? "out-of-stock" : ""
              }`}
              onClick={() => product.stockQuantity > 0 && addToCart(product)}>
              <div className="product-info">
                <h4>{getProductDisplay(product)}</h4>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                <p className="product-stock">{getStockDisplay(product)}</p>
                {product.tagNo && (
                  <p className="product-code">Tag: {product.tagNo}</p>
                )}
                {product.barcode && (
                  <p className="product-code">Barcode: {product.barcode}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Customer */}
      <div className="cart-container">
        <div className="customer-section">
          <h3>Customer Details</h3>
          <div className="customer-search">
            <input
              type="text"
              placeholder="Enter mobile number to search"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="mobile-search-input"
            />
            <button
              onClick={handleMobileSearch}
              className="search-customer-btn">
              🔍 Search
            </button>
            <button onClick={clearCustomer} className="clear-customer-btn">
              ❌ Clear
            </button>
          </div>
          <div className="customer-form">
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                value={customer.mobile}
                onChange={(e) =>
                  setCustomer({ ...customer, mobile: e.target.value })
                }
                placeholder="Customer mobile number"
                required
              />
            </div>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Customer full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
                placeholder="Customer address"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="cart-header">
          <h2>Shopping Cart ({getCartItemCount()} items)</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="clear-cart-btn">
              Clear All
            </button>
          )}
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">
              Cart is empty. Add products to get started.
            </p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-details">
                  <h4>{getCartItemDisplay(item)}</h4>
                  <p>₹{item.price.toFixed(2)} each</p>
                </div>
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="quantity-btn">
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="quantity-btn">
                    +
                  </button>
                </div>
                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="remove-btn">
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="checkout-form">
              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="WALLET">Mobile Wallet</option>
                </select>
              </div>
              <button onClick={handleCheckout} className="checkout-btn">
                Complete Sale - ₹{getCartTotal().toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>

      {showReceipt && (
        <Receipt
          invoice={currentInvoice}
          onClose={handleCloseReceipt}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default PointOfSale;
