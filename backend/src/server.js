import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import csrfProtection from "./middleware/csrfMiddleware.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import donationRoutes from "./routes/donationRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicineRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// -------------------- CORS --------------------
// Allow frontend origin and credentials
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV !== "production"
  ? "http://localhost:5173"
  : "https://creon-frontend.onrender.com");

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// -------------------- CSRF --------------------
// Only check CSRF for state-changing methods
app.use((req, res, next) => {
  if (["GET", "OPTIONS", "HEAD"].includes(req.method)) return next();
  return csrfProtection(req, res, next);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/donations", donationRoutes);

// Serve frontend
const FRONTEND_DIST = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/socket.io")) return next();
    const indexHtml = path.join(FRONTEND_DIST, "index.html");
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    return next();
  });
}

// Test & health routes
app.get("/api/test-server", (req, res) => res.send("<h1>Server running successfully</h1>"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// WebSocket logic (unchanged from your code)
const sessions = new Map();
function genCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }
io.on("connection", socket => {
  console.log("ws: socket connected", socket.id);
  // your socket events...
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}, frontend origin: ${FRONTEND_URL}`));
