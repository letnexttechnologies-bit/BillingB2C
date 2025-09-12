const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// GET all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by mobile
router.get("/mobile/:mobile", async (req, res) => {
  try {
    const customer = await Customer.findOne({ mobile: req.params.mobile });
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create or update customer
router.post("/", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const customer = await Customer.findOneAndUpdate({ mobile }, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
