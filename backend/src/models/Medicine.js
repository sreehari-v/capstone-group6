// import mongoose from "mongoose";

// const medicineSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   dosage: { type: String, required: true },
//   schedule: { 
//     type: String, 
//     enum: ["Morning", "Afternoon", "Evening", "Night"], 
//     required: true 
//   },
//   time: { type: String, required: true },
//   beforeFood: { type: Boolean, required: true },
//   adherence: { type: Number, default: 0 },
// });

// const Medicine = mongoose.model("Medicine", medicineSchema);
// export default Medicine;

// Updated Code:
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  schedule: { 
    type: String, 
    enum: ["Morning", "Afternoon", "Evening", "Night"], 
    required: true 
  },
  time: { type: String, required: true },
  beforeFood: { type: Boolean, required: true },
  adherence: { type: Number, default: 0 },
});

export default mongoose.model("Medicine", medicineSchema);

