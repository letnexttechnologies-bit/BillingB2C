const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "piece" }, // kg, gram, pack, piece
    barcode: { type: String },
    qrCode: { type: String },
    tagNo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
