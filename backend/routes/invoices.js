const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

// GET all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET invoice by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE invoice by ID
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Restore stock when invoice deleted
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();
      }
    }

    res.json({
      message: "Invoice deleted successfully",
      deletedInvoice: invoice,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create invoice & reduce stock
router.post("/", async (req, res) => {
  try {
    let {
      customerName,
      customerMobile,
      customerAddress,
      items = [],
      subtotal,
      totalAmount,
      paymentMethod,
      paymentDetails,
      transactionId,
      status,
      date,
    } = req.body;

    // 1. Auto-calc subtotal & total
    if (!subtotal || !totalAmount) {
      subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      totalAmount = subtotal;
    }

    // 2. Default values
    if (!transactionId) transactionId = `TXN${Date.now()}`;
    if (!status) status = "completed";
    if (!date) date = new Date();
    if (!paymentMethod) paymentMethod = "CASH";

    // 3. Reduce stock
    for (const item of items) {
      let product = null;

      if (item.productId) {
        product = await Product.findById(item.productId);
      } else {
        product = await Product.findOne({ name: item.name });
      }

      if (!product) {
        return res
          .status(400)
          .json({ error: `Product not found: ${item.productId || item.name}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Not enough stock for ${product.name}` });
      }

      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // 4. Save invoice (invoiceId auto-generated in model pre-save hook)
    const invoice = new Invoice({
      customerName,
      customerMobile,
      customerAddress,
      items,
      subtotal,
      totalAmount,
      paymentMethod,
      paymentDetails,
      transactionId,
      status,
      date,
    });

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
