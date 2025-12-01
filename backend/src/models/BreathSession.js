import mongoose from "mongoose";

const breathSampleSchema = new mongoose.Schema({
  // timestamp of the sample (client-provided or server-fill)
  t: { type: Date, required: true },
  // inhale/exhale amplitude or sensor value (optional)
  inhale: { type: Number },
  exhale: { type: Number },
  // instantaneous respiratory rate (breaths per minute)
  rr: { type: Number },
});

const breathSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Array of raw samples (may be large - clients should keep reasonable sizes)
    samples: { type: [breathSampleSchema], default: [] },
    // Aggregates
    durationSeconds: { type: Number, default: 0, min: 0 },
    avgRespiratoryRate: { type: Number, default: 0, min: 0 },
    // Client-provided session bounds
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("BreathSession", breathSessionSchema);
