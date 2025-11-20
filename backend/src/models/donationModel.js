import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    orderId: { type: String, required: true },
    captureId: { type: String },
    payerEmail: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
