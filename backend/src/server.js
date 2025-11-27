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
// Allow frontend origin(s) and credentials. Support comma-separated FRONTEND_URLS or single FRONTEND_URL.
const defaultDevOrigin = "http://localhost:5173";
const rawFrontend = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || (process.env.NODE_ENV !== "production" ? defaultDevOrigin : undefined);
const allowedOrigins = rawFrontend ? rawFrontend.split(',').map(s => s.trim()).filter(Boolean) : [];

// CORS origin function checks the incoming Origin header and allows it if it's in the whitelist.
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser tools or same-origin requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(new Error('No allowed origins configured'));
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

app.use((req, res, next) => {
  // Wrap CORS so errors become plain rejections instead of uncaught exceptions
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.warn('CORS warning:', err.message || err);
      return res.status(403).json({ message: 'CORS origin denied' });
    }
    next();
  });
});

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

// Start reminder scheduler
import "./scheduler/medicineReminder.js";

// Test route
app.get("/", (req, res) => {
  res.send("<h1>Server running successfully</h1>");
});
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

// Temporary debug endpoint - disabled by default. Set ENABLE_DEBUG_ENDPOINT=true in env to enable.
// Returns the request headers and parsed cookies so you can inspect what the server receives
// (useful when diagnosing missing cookies / CORS issues in production).
if (process.env.ENABLE_DEBUG_ENDPOINT === "true") {
  app.get("/api/debug/echo", (req, res) => {
    // Do not return any sensitive values in production unless you explicitly enable this endpoint.
    return res.json({
      ok: true,
      origin: req.get("origin") || null,
      headers: req.headers,
      cookies: req.cookies || {}
    });
  });
}

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: function (origin, callback) {
      // allow non-browser tools or same-origin requests with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(new Error('No allowed origins configured'));
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by Socket.IO CORS'));
    },
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}, allowed frontends: ${allowedOrigins.join(',') || rawFrontend || 'none'}`));
