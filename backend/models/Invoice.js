const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerAddress: { type: String },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        unit: { type: String },
      },
    ],

    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "WALLET"],
      required: true,
    },
    paymentDetails: { type: Object }, // flexible (transactionId, etc.)

    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
