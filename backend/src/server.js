import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// DB + Routes
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicineRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Connect to MongoDB
// -----------------------------
connectDB();

// -----------------------------
//  Middlewares
// -----------------------------
app.use(express.json());
app.use(cookieParser());

// CORS setup
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// -----------------------------
// API Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("<h1>Server running successfully</h1>");
});

// API reference route
app.get("/api", (req, res) => {
  res.send(`
        <div>
        <h1>API Reference</h1>
            <ul>
                <li><a href='/api/test'>/api/test</a></li>
            </ul>
        </div>`);
});

// Health route
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// -----------------------------
//  Start the server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
