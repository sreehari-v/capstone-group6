import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import StepSession from "../models/StepSession.js";

const router = express.Router();

/**
 * POST /api/steps/session
 * Save a finished step session for the logged-in user.
 *
 * Expects JSON body:
 * {
 *   steps: number,
 *   distanceKm?: number,
 *   kcal?: number,
 *   startedAt: string (ISO date),
 *   endedAt: string (ISO date),
 *   durationMinutes?: number
 * }
 */
router.post("/session", protect, async (req, res) => {
  try {
    const { steps, distanceKm, kcal, startedAt, endedAt, durationMinutes } = req.body;

    if (typeof steps !== "number" || steps < 0) {
      return res.status(400).json({ message: "steps is required and must be a non-negative number" });
    }

    if (!startedAt || !endedAt) {
      return res.status(400).json({ message: "startedAt and endedAt are required" });
    }

    const start = new Date(startedAt);
    const end = new Date(endedAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid startedAt or endedAt date" });
    }

    let duration = durationMinutes;
    if (typeof duration !== "number" || duration < 0) {
      // Fallback: compute from timestamps (rounded to nearest minute)
      const diffMs = end.getTime() - start.getTime();
      duration = diffMs > 0 ? Math.round(diffMs / 60000) : 0;
    }

    const session = await StepSession.create({
      user: req.user._id,
      steps,
      distanceKm: typeof distanceKm === "number" ? distanceKm : 0,
      kcal: typeof kcal === "number" ? kcal : 0,
      startedAt: start,
      endedAt: end,
      durationMinutes: duration,
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error("Error saving step session:", err);
    return res.status(500).json({ message: "Failed to save step session" });
  }
});

/**
 * GET /api/steps/summary
 * Returns total steps (and optional distance/kcal) for:
 * - last 24 hours ("daily")
 * - last 7 days ("weekly")
 * - last 30 days ("monthly")
 */
router.get("/summary", protect, async (req, res) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all sessions from the last 30 days, then aggregate in JS
    const sessions = await StepSession.find({
      user: req.user._id,
      createdAt: { $gte: monthAgo },
    }).lean();

    const baseTotal = () => ({
      steps: 0,
      distanceKm: 0,
      kcal: 0,
    });

    const daily = baseTotal();
    const weekly = baseTotal();
    const monthly = baseTotal();

    for (const s of sessions) {
      const t = new Date(s.createdAt);
      const steps = s.steps || 0;
      const dist = s.distanceKm || 0;
      const kc = s.kcal || 0;

      if (t >= monthAgo) {
        monthly.steps += steps;
        monthly.distanceKm += dist;
        monthly.kcal += kc;
      }
      if (t >= weekAgo) {
        weekly.steps += steps;
        weekly.distanceKm += dist;
        weekly.kcal += kc;
      }
      if (t >= dayAgo) {
        daily.steps += steps;
        daily.distanceKm += dist;
        daily.kcal += kc;
      }
    }

    // ---- New: per-day buckets for the last 7 days ----
    // Build 7 days: from 6 days ago up to today
    const dayBuckets = [];
    const indexByKey = new Map();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

      dayBuckets.push({
        key,
        date: d,
        steps: 0,
        distanceKm: 0,
        kcal: 0,
      });
      indexByKey.set(key, dayBuckets.length - 1);
    }

    // Fill buckets using sessions within last 7 days
    for (const s of sessions) {
      const t = new Date(s.createdAt);
      if (t < weekAgo) continue;

      const key = t.toISOString().slice(0, 10);
      const idx = indexByKey.get(key);
      if (idx === undefined) continue;

      const bucket = dayBuckets[idx];
      bucket.steps += s.steps || 0;
      bucket.distanceKm += s.distanceKm || 0;
      bucket.kcal += s.kcal || 0;
    }

    const weeklyByDay = dayBuckets.map((d) => ({
      date: d.date.toISOString(),
      steps: d.steps,
      distanceKm: d.distanceKm,
      kcal: d.kcal,
    }));

    return res.json({ daily, weekly, monthly, weeklyByDay });
  } catch (err) {
    console.error("Error getting step summary:", err);
    return res.status(500).json({ message: "Failed to load step summary" });
  }
});


export default router;
