import express from "express";
import Medicine from "../models/Medicine.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all medicines
// router.get("/", async (req, res) => {
//   const meds = await Medicine.find();
//   res.json(meds);
// });

// Get medicines of logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const meds = await Medicine.find({ user: req.user._id });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new medicine
// router.post("/", async (req, res) => {
//   try {
//     const { name, dosage, schedule, time, beforeFood } = req.body;
//     const newMed = new Medicine({ name, dosage, schedule, time, beforeFood });
//     await newMed.save();
//     res.status(201).json(newMed);
//   } catch (err) {
//     console.error("Add Error:", err);
//     res.status(400).json({ message: err.message });
//   }
// });

// Add new medicine for logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const { name, dosage, schedule, time, beforeFood, userId } = req.body;

    const newMed = new Medicine({
      user: req.user._id,
      name,
      dosage,
      schedule,
      time,
      beforeFood,
  });

    await newMed.save();
    res.status(201).json(newMed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update medicine
router.put("/:id", async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete medicine
router.delete("/:id", async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
