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

// CORS setup
// Local dev example (uncomment in .env or here if you need to force localhost):
// const LOCAL_FRONTEND = "http://localhost:5173";
// Production FRONTEND_URL should be set in backend/.env (e.g. https://prince-pr.com)
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV !== 'production' ? "http://localhost:5173" : "");

// In development allow the dev server origin(s). Allow any origin when running locally to make
// frontend dev on different ports (5173/5174) convenient. In production restrict to FRONTEND_URL.
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: true, // reflect request origin
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );
}

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
    origin: process.env.NODE_ENV !== 'production' ? true : FRONTEND_URL,
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
    // notify producer that a new listener joined and request a snapshot
    io.to(s.producerId).emit("listener_joined", { listenerId: socket.id, listenerCount: s.listeners.size });
    // request snapshot from producer to send initial state to this listener
    io.to(s.producerId).emit("request_snapshot", { to: socket.id });
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
    // broadcast to all others in room
    socket.to(code).emit("breath_data", payload);
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
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(` - Dev frontend should be reachable at http://<your-host-ip>:5173 or :5174 (Vite)`);
  } else {
    console.log(` - Frontend origin configured: ${FRONTEND_URL}`);
  }
});
