import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import csrfProtection from "./middleware/csrfMiddleware.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import donationRoutes from "./routes/donationRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";

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

// Connect to MongoDB

connectDB();

//  Middlewares
app.use(express.json());
app.use(cookieParser());
// CSRF double-submit protection (checks X-CSRF-Token against csrfToken cookie)
app.use(csrfProtection);
app.use("/api/donations", donationRoutes);

// CORS setup - allow one or more frontend origins configured via env
// Set FRONTEND_URL to the production origin (e.g. https://creon-frontend.onrender.com)
// or FRONTEND_URLS to a comma-separated list of allowed origins.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND_URLS = (process.env.FRONTEND_URLS || "").split(",").map((s) => s.trim()).filter(Boolean);
// Default production origins we allow (can be overridden via FRONTEND_URL / FRONTEND_URLS env)
const DEFAULT_ALLOWED = [
  "https://careon-backend-rzbf.onrender.com",
  "https://creon-frontend.onrender.com",
];
const allowedOrigins = new Set([FRONTEND_URL, ...FRONTEND_URLS, ...DEFAULT_ALLOWED].filter(Boolean));

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      console.warn(`CORS: blocked origin ${origin} — allowed: ${Array.from(allowedOrigins).join(",")}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// API Routes
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

// Create HTTP server so we can attach socket.io
const server = http.createServer(app);

// Setup Socket.IO
const io = new IOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// In-memory session map: code -> { producerId, listeners: Set, createdAt }
const sessions = new Map();

function genCode() {
  // generate 6-digit code, avoid collisions
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (!sessions.has(code)) return code;
  }
  // fallback
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on("connection", (socket) => {
  console.log("ws: socket connected", socket.id);

  socket.on("create_session", () => {
    const code = genCode();
    sessions.set(code, { producerId: socket.id, listeners: new Set(), createdAt: Date.now() });
    socket.join(code);
    socket.emit("session_created", { code });
    console.log(`ws: session created ${code} by ${socket.id}`);
  });

  socket.on("join_session", ({ code }) => {
    const s = sessions.get(code);
    if (!s) {
      socket.emit("join_error", { message: "Session not found" });
      return;
    }
    if (s.listeners.size >= 3) {
      socket.emit("join_error", { message: "Session already has maximum listeners" });
      return;
    }
    s.listeners.add(socket.id);
    socket.join(code);
    // notify listener that join succeeded
    socket.emit("joined", { code, producerId: s.producerId, listenerCount: s.listeners.size });
    console.log(`ws: listener ${socket.id} joined session ${code}, producer=${s.producerId}, listeners=${s.listeners.size}`);
    // notify producer that a new listener joined and request a snapshot
    io.to(s.producerId).emit("listener_joined", { listenerId: socket.id, listenerCount: s.listeners.size });
    // request snapshot from producer to send initial state to this listener
    io.to(s.producerId).emit("request_snapshot", { to: socket.id });
    // if server already has a recent snapshot from producer, send it immediately
    if (s.lastSnapshot) {
      socket.emit("session_snapshot", s.lastSnapshot);
    }
    console.log(`ws: ${socket.id} joined session ${code}`);
  });

  socket.on("leave_session", ({ code }) => {
    const s = sessions.get(code);
    if (!s) return;
    s.listeners.delete(socket.id);
    socket.leave(code);
    io.to(s.producerId).emit("listener_left", { listenerId: socket.id, listenerCount: s.listeners.size });
  });

  socket.on("breath_data", (payload) => {
    // payload should include { code, point?, breathIn?, breathOut?, bpm? }
    const { code } = payload || {};
    if (!code) return;
    // store last snapshot if this is from the producer
    const s = sessions.get(code);
    if (s && s.producerId === socket.id) {
      // keep a small shallow copy (avoid big arrays)
      s.lastSnapshot = {
        breathIn: payload.breathIn,
        breathOut: payload.breathOut,
        bpm: payload.bpm,
        point: payload.point,
        t: payload.t,
      };
      console.log(`ws: received breath_data from producer ${socket.id} for ${code} bpm=${payload.bpm} point=${payload.point?true:false}`);
    }
    // broadcast to all others in room
    socket.to(code).emit("breath_data", payload);
    console.log(`ws: broadcasted breath_data to room ${code}`);
  });

  socket.on("session_snapshot", ({ to, snapshot }) => {
    if (!to) return;
    io.to(to).emit("session_snapshot", snapshot);
  });

  socket.on("close_session", ({ code }) => {
    const s = sessions.get(code);
    if (!s) return;
    // notify listeners
    io.to(code).emit("session_ended", { code });
    // cleanup
    sessions.delete(code);
  });

  socket.on("disconnect", () => {
    // cleanup any sessions where this socket was producer or listener
    for (const [code, s] of sessions.entries()) {
      if (s.producerId === socket.id) {
        // notify listeners
        io.to(code).emit("session_ended", { code });
        sessions.delete(code);
        console.log(`ws: producer ${socket.id} disconnected, ended session ${code}`);
      } else if (s.listeners.has(socket.id)) {
        s.listeners.delete(socket.id);
        io.to(s.producerId).emit("listener_left", { listenerId: socket.id, listenerCount: s.listeners.size });
        console.log(`ws: listener ${socket.id} left session ${code}`);
      }
    }
    console.log("ws: socket disconnected", socket.id);
  });
});

//  Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
