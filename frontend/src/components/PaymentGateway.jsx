// import React, { useState, useEffect } from "react";
// import "./PaymentGateway.css";

// const PaymentGateway = ({
//   amount,
//   paymentMethod,
//   onSuccess,
//   onFailure,
//   onCancel,
// }) => {
//   const [cardNumber, setCardNumber] = useState("");
//   const [cardHolder, setCardHolder] = useState("");
//   const [expiryDate, setExpiryDate] = useState("");
//   const [cvv, setCvv] = useState("");
//   const [walletNumber, setWalletNumber] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [qrCodeUrl, setQrCodeUrl] = useState("");

//   // Define your static UPI ID
//   const shopUpiId = "ayyasamym420-2@okicici";

//   useEffect(() => {
//     if (paymentMethod === "UPI") {
//       // Generate a QR code for UPI payment with the specific UPI ID
//       generateQrCode();
//     }
//   }, [paymentMethod, amount]);

//   const generateQrCode = () => {
//     // We use the shopUpiId variable here to create the UPI payment link
//     const upiLink = `upi://pay?pa=${shopUpiId}&pn=YourStoreName&am=${amount}`;
//     setQrCodeUrl(
//       `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
//         upiLink
//       )}`
//     );
//   };

//   const handleCardPayment = () => {
//     setIsProcessing(true);
//     // Simulate API call
//     setTimeout(() => {
//       if (cardNumber && cardHolder && expiryDate && cvv) {
//         onSuccess({
//           method: "CARD",
//           cardLastFour: cardNumber.slice(-4),
//           transactionId: `CARD${Date.now()}`,
//         });
//       } else {
//         onFailure("Please fill all card details");
//       }
//       setIsProcessing(false);
//     }, 2000);
//   };

//   const handleWalletPayment = () => {
//     setIsProcessing(true);
//     // Simulate API call
//     setTimeout(() => {
//       if (walletNumber) {
//         onSuccess({
//           method: "WALLET",
//           walletNumber: walletNumber,
//           transactionId: `WALLET${Date.now()}`,
//         });
//       } else {
//         onFailure("Please enter wallet number");
//       }
//       setIsProcessing(false);
//     }, 2000);
//   };

//   const handleUpiPayment = () => {
//     setIsProcessing(true);
//     // Simulate API call
//     setTimeout(() => {
//       onSuccess({
//         method: "UPI",
//         upiId: shopUpiId, // Use the shop's UPI ID for the transaction record
//         transactionId: `UPI${Date.now()}`,
//       });
//       setIsProcessing(false);
//     }, 2000);
//   };

//   const handlePayment = () => {
//     switch (paymentMethod) {
//       case "CARD":
//         handleCardPayment();
//         break;
//       case "WALLET":
//         handleWalletPayment();
//         break;
//       case "UPI":
//         handleUpiPayment();
//         break;
//       default:
//         onFailure("Invalid payment method");
//     }
//   };

//   return (
//     <div className="payment-gateway-overlay">
//       <div className="payment-gateway">
//         <h2>Payment Gateway</h2>
//         <div className="payment-amount">
//           Amount to pay: <strong>₹{amount.toFixed(2)}</strong>
//         </div>

//         {paymentMethod === "CARD" && (
//           <div className="payment-form">
//             <div className="form-group">
//               <label>Card Number</label>
//               <input
//                 type="text"
//                 placeholder="1234 5678 9012 3456"
//                 value={cardNumber}
//                 onChange={(e) =>
//                   setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
//                 }
//               />
//             </div>
//             <div className="form-group">
//               <label>Card Holder Name</label>
//               <input
//                 type="text"
//                 placeholder="John Doe"
//                 value={cardHolder}
//                 onChange={(e) => setCardHolder(e.target.value)}
//               />
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Expiry Date</label>
//                 <input
//                   type="text"
//                   placeholder="MM/YY"
//                   value={expiryDate}
//                   onChange={(e) => setExpiryDate(e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>CVV</label>
//                 <input
//                   type="text"
//                   placeholder="123"
//                   value={cvv}
//                   onChange={(e) =>
//                     setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {paymentMethod === "WALLET" && (
//           <div className="payment-form">
//             <div className="form-group">
//               <label>Wallet Number</label>
//               <input
//                 type="text"
//                 placeholder="Enter your wallet number"
//                 value={walletNumber}
//                 onChange={(e) => setWalletNumber(e.target.value)}
//               />
//             </div>
//           </div>
//         )}

//         {paymentMethod === "UPI" && (
//           <div className="payment-form upi-payment">
//             <div className="qr-code-container">
//               <img src={qrCodeUrl} alt="UPI QR Code" />
//               <p>Scan QR code to pay</p>
//             </div>
//             <div className="or-divider">OR</div>
//             <div className="form-group">
//               <label>UPI ID</label>
//               <input
//                 type="text"
//                 placeholder="customer@upi"
//                 value={shopUpiId}
//                 readOnly // Make the input read-only to prevent editing the shop's UPI ID
//               />
//             </div>
//           </div>
//         )}

//         <div className="payment-actions">
//           <button
//             onClick={handlePayment}
//             disabled={isProcessing}
//             className="pay-now-btn">
//             {isProcessing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
//           </button>
//           <button onClick={onCancel} className="cancel-btn">
//             Cancel
//           </button>
//         </div>

//         <div className="payment-security">
//           <p>
//             <i className="fas fa-lock"></i> Secure payment encrypted
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentGateway;
