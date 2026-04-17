const express = require("express");
const router = express.Router();
const Village = require("../models/Village");
const { verifyToken } = require("./middleware/auth");

// Add village
router.post("/", verifyToken, async (req, res) => {
  try {
    const village = new Village({ ...req.body, uploadedBy: req.user.id });
    await village.save();
    res.status(201).json(village);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all villages (with optional filter)
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.villageType = req.query.type;
    if (req.query.department) filter.department = req.query.department;
    const villages = await Village.find(filter).sort({ createdAt: -1 });
    res.json(villages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete village
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Village.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;