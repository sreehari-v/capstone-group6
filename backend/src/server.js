import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import medicineRoutes from "./routes/medicineRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Routes
app.use("/api/medicines", medicineRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("<h1>Server running successfully</h1>");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
