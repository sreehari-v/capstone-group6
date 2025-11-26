// backend/src/models/StepTracking.js
import mongoose from "mongoose";

const stepTrackingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one record per user
    },
    steps: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StepTracking = mongoose.model("StepTracking", stepTrackingSchema);
export default StepTracking;
