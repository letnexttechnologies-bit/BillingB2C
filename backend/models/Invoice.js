const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true }, // 👈 Only 5 digit number

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

// 👇 Auto-generate sequential 5-digit invoiceId
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceId) {
    const lastInvoice = await mongoose
      .model("Invoice", invoiceSchema)
      .findOne({})
      .sort({ createdAt: -1 });

    let nextNumber = 10000; // start from 10000
    if (lastInvoice && lastInvoice.invoiceId) {
      const lastNumber = parseInt(lastInvoice.invoiceId, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    this.invoiceId = String(nextNumber);
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
