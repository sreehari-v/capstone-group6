import jwt from "jsonwebtoken";
import BreathSession from "../models/BreathSession.js";
import User from "../models/user.model.js";

// POST /api/breaths
export const createBreathSession = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      startedAt,
      endedAt,
      durationSeconds,
      avgRespiratoryRate,
      samples,
      notes,
      breathIn,
      breathOut,
      totalBreaths,
      cycleTimestamps,
    } = req.body || {};

    if (!startedAt || !endedAt) return res.status(400).json({ message: "startedAt and endedAt are required" });

    const s = await BreathSession.create({
      user: user._id,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
      durationSeconds: durationSeconds ? Number(durationSeconds) : Math.max(0, (new Date(endedAt) - new Date(startedAt)) / 1000),
      avgRespiratoryRate: avgRespiratoryRate ? Number(avgRespiratoryRate) : 0,
      breathIn: breathIn ? Number(breathIn) : 0,
      breathOut: breathOut ? Number(breathOut) : 0,
      totalBreaths: totalBreaths ? Number(totalBreaths) : 0,
      cycleTimestamps: Array.isArray(cycleTimestamps) ? cycleTimestamps.map((t) => new Date(t)) : [],
      samples: Array.isArray(samples)
        ? samples.map((p) => {
            const t = p.t ? new Date(p.t) : new Date();
            // sensor value may be in different keys
            const val = p.v ?? p.y ?? p.value ?? null;
            let inhale = undefined;
            let exhale = undefined;
            if (typeof val === 'number') {
              if (val > 0) inhale = Number(val);
              else if (val < 0) exhale = Math.abs(Number(val));
            } else if (typeof p.inhale === 'number' || typeof p.exhale === 'number') {
              inhale = p.inhale; exhale = p.exhale;
            }
            return { t, inhale, exhale, rr: p.rr };
          })
        : [],
      notes: typeof notes === 'string' ? notes : undefined,
    });

    // Log a concise server-side message to help local debugging / verification
    try {
      console.log(`breath:create -> user=${user._id} session=${s._id} samples=${(s.samples || []).length}`);
    } catch (e) { /* ignore logging errors */ }

    return res.status(201).json({ ok: true, id: s._id, session: s });
  } catch (err) {
    console.error("createBreathSession error:", err && err.message ? err.message : err);
    return res.status(500).json({ message: "Failed to create breath session" });
  }
};

// (Optional) GET user's sessions - minimal implementation
export const listMySessions = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });
    const sessions = await BreathSession.find({ user: decoded.id }).sort({ createdAt: -1 }).limit(50);
    return res.json({ ok: true, sessions });
  } catch (err) {
    console.error("listMySessions error:", err && err.message ? err.message : err);
    return res.status(500).json({ message: "Failed to list sessions" });
  }
};
