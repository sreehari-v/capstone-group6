// backend/src/controllers/stepTrackingController.js
import StepTracking from "../models/StepTracking.js";

export const getMySteps = async (req, res) => {
  try {
    const userId = req.user._id; // set by auth middleware

    let doc = await StepTracking.findOne({ user: userId });

    if (!doc) {
      doc = await StepTracking.create({
        user: userId,
        steps: 0,
        isActive: false,
      });
    }

    res.json({
      steps: doc.steps,
      isActive: doc.isActive,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("getMySteps error:", err);
    res.status(500).json({ message: "Failed to load step tracking" });
  }
};

export const saveMySteps = async (req, res) => {
  try {
    const userId = req.user._id;
    const { steps, isActive } = req.body;

    if (typeof steps !== "number") {
      return res.status(400).json({ message: "steps must be a number" });
    }

    const doc = await StepTracking.findOneAndUpdate(
      { user: userId },
      {
        steps,
        isActive: !!isActive,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({
      steps: doc.steps,
      isActive: doc.isActive,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("saveMySteps error:", err);
    res.status(500).json({ message: "Failed to save step tracking" });
  }
};
