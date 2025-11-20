import express from "express";
import Donation from "../models/donationModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save a donation
router.post("/", protect, async (req, res) => {
  try {
    const { amount, orderId, captureId, payerEmail, status } = req.body;

    const donation = await Donation.create({
      userId: req.user._id,
      amount,
      orderId,
      captureId,
      payerEmail,
      status,
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Donation Error:", error);
    res.status(500).json({ message: "Could not save donation" });
  }
});

// Get all donations for logged-in user
router.get("/my", protect, async (req, res) => {
  const donations = await Donation.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(donations);
});

export default router;
