import mongoose from "mongoose";

const stepSessionSchema = new mongoose.Schema(
  {
    // The logged-in user who owns this walking session
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Total steps counted in this session
    steps: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional: distance in kilometers for this session
    distanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Optional: calories burned for this session
    kcal: {
      type: Number,
      default: 0,
      min: 0,
    },

    // When the session started (client will send this)
    startedAt: {
      type: Date,
      required: true,
    },

    // When the session ended (client will send this)
    endedAt: {
      type: Date,
      required: true,
    },

    // Total walking duration (active time) in minutes
    durationMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    // Adds createdAt and updatedAt
    timestamps: true,
  }
);

export default mongoose.model("StepSession", stepSessionSchema);
