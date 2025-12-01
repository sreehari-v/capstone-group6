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
import stepRoutes from "./routes/stepRoutes.js";
import breathRoutes from "./routes/breathRoutes.js";

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
app.use("/api/steps", stepRoutes);
app.use("/api/breaths", breathRoutes);

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

// WebSocket logic: in-memory session map for producers/listeners
// session shape: { producer: socketId, listeners: Set<socketId> }
const sessions = new Map();
const socketSession = new Map(); // reverse lookup: socketId -> { code, role }
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on("connection", (socket) => {
  console.log("ws: socket connected", socket.id);

  // Create a new session as a producer
  socket.on("create_session", () => {
    try {
      let code;
      // ensure uniqueness (very small chance of collision)
      do {
        code = genCode();
      } while (sessions.has(code));

      sessions.set(code, { producer: socket.id, listeners: new Set() });
      socketSession.set(socket.id, { code, role: "producer" });
      socket.emit("session_created", { code });
      console.debug("ws: session created", { code, producer: socket.id });
    } catch (e) {
      console.warn("ws: create_session failed", e);
      socket.emit("session_error", { message: "Failed to create session" });
    }
  });

  // Listener asks to join a session
  socket.on("join_session", ({ code } = {}) => {
    try {
      if (!code || typeof code !== "string") return socket.emit("join_error", { message: "Invalid code" });
      const s = sessions.get(code);
      if (!s) return socket.emit("join_error", { message: "Session not found" });
      // optional listener limit
      const maxListeners = 6;
      if (s.listeners.size >= maxListeners)
        return socket.emit("join_error", { message: "Session is full" });

      s.listeners.add(socket.id);
      socketSession.set(socket.id, { code, role: "listener" });

      // tell the listener it joined and give the producer id (so listener can request a snapshot)
      socket.emit("joined", { code, producerId: s.producer });

      // notify producer that a listener joined (optional)
      try {
        io.to(s.producer).emit("listener_joined", { listenerId: socket.id });
      } catch {}

      console.debug("ws: listener joined", { code, listener: socket.id, producer: s.producer });
    } catch (e) {
      console.warn("ws: join_session failed", e);
      socket.emit("join_error", { message: "Failed to join session" });
    }
  });

  // Listener requests a snapshot from producer: server forwards to producer with the listener's socket id
  socket.on("request_snapshot", ({ to } = {}) => {
    try {
      if (!to) return;
      // forward request to producer, include the listener id so producer can reply
      io.to(to).emit("request_snapshot", { to: socket.id });
    } catch (e) {
      console.warn("ws: request_snapshot forward failed", e);
    }
  });

  // Producer or listener can send session_snapshot -- forward it to the target socket id
  socket.on("session_snapshot", ({ to, snapshot } = {}) => {
    try {
      if (!to || !snapshot) return;
      io.to(to).emit("session_snapshot", snapshot);
    } catch (e) {
      console.warn("ws: session_snapshot forward failed", e);
    }
  });

  // Producer sends breath_data; forward to all listeners in the session
  socket.on("breath_data", (payload = {}) => {
    try {
      const { code } = payload || {};
      if (!code) return; // no session code provided
      const s = sessions.get(code);
      if (!s) return;
      // forward to listeners
      for (const lid of s.listeners) {
        io.to(lid).emit("breath_data", payload);
      }
    } catch (e) {
      console.warn("ws: breath_data forward failed", e);
    }
  });

  // Cleanup when a socket disconnects
  socket.on("disconnect", () => {
    try {
      const meta = socketSession.get(socket.id);
      if (!meta) return;
      const { code, role } = meta;
      const s = sessions.get(code);
      if (!s) {
        socketSession.delete(socket.id);
        return;
      }

      if (role === "producer") {
        // notify listeners that session ended
        for (const lid of s.listeners) {
          try {
            io.to(lid).emit("session_ended", { code });
          } catch {}
          socketSession.delete(lid);
        }
        sessions.delete(code);
        console.debug("ws: producer disconnected, session ended", { code, producer: socket.id });
      } else if (role === "listener") {
        s.listeners.delete(socket.id);
        // notify producer optionally
        try {
          io.to(s.producer).emit("listener_left", { listenerId: socket.id });
        } catch {}
        console.debug("ws: listener disconnected", { code, listener: socket.id });
      }

      socketSession.delete(socket.id);
    } catch (e) {
      console.warn("ws: disconnect handler failed", e);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}, allowed frontends: ${allowedOrigins.join(',') || rawFrontend || 'none'}`));
