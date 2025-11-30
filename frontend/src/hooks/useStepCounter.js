import { useEffect, useRef, useState } from "react";

/**
 * Foreground step counter using accelerometer magnitude + adaptive threshold.
 * Works on HTTPS or localhost. iOS needs a user gesture to grant permission.
 */
export default function useStepCounter({ minStepMs = 350 } = {}) {
  const [steps, setSteps] = useState(0);

  // "idle" | "running" | "paused"
  const [status, setStatus] = useState("idle");

  // Session timing
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Internal refs for step detection
  const last = useRef(0);
  const lp = useRef({ x: 0, y: 0, z: 0 });
  const hp = useRef({ x: 0, y: 0, z: 0 });
  const stats = useRef({ mean: 0, var: 0, n: 0 });

  // Internal refs for timing (only count "running" time, not paused)
  const activeMsRef = useRef(0);       // accumulated active milliseconds
  const lastResumeRef = useRef(null);  // timestamp when we last started/resumed

  const active = status === "running";

  useEffect(() => {
    if (!active) return;

    const onMotion = (e) => {
      const ax = e.accelerationIncludingGravity?.x ?? 0;
      const ay = e.accelerationIncludingGravity?.y ?? 0;
      const az = e.accelerationIncludingGravity?.z ?? 0;

      // low-pass gravity
      const alpha = 0.1;
      lp.current.x = alpha * ax + (1 - alpha) * lp.current.x;
      lp.current.y = alpha * ay + (1 - alpha) * lp.current.y;
      lp.current.z = alpha * az + (1 - alpha) * lp.current.z;

      // high-pass motion
      hp.current.x = ax - lp.current.x;
      hp.current.y = ay - lp.current.y;
      hp.current.z = az - lp.current.z;

      const m = Math.hypot(hp.current.x, hp.current.y, hp.current.z);

      // adaptive threshold: mean + 1*std (with floor)
      const d = stats.current;
      d.n++;
      const delta = m - d.mean;
      d.mean += delta / d.n;
      d.var += delta * (m - d.mean);
      const std = Math.sqrt(d.var / Math.max(1, d.n - 1));
      const threshold = Math.max(0.8, d.mean + 1.0 * std);

      const now = performance.now();
      if (m > threshold && now - last.current > minStepMs) {
        last.current = now;
        setSteps((s) => s + 1);
      }
    };

    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [active, minStepMs]);

  const requestPermission = async () => {
    const DM = window.DeviceMotionEvent;
    if (typeof DM?.requestPermission === "function") {
      const res = await DM.requestPermission();
      if (res !== "granted") throw new Error("Motion permission denied");
    }
  };

  const resetDetectionState = () => {
    last.current = 0;
    lp.current = { x: 0, y: 0, z: 0 };
    hp.current = { x: 0, y: 0, z: 0 };
    stats.current = { mean: 0, var: 0, n: 0 };
  };

  const start = async () => {
    try {
      await requestPermission();
    } catch {
      // ignore permission errors; iOS may still work after user grants it
    }

    // New session always starts from 0
    setSteps(0);
    resetDetectionState();

    const now = new Date();

    setStartedAt(now);
    setEndedAt(null);
    setDurationMinutes(0);

    activeMsRef.current = 0;
    lastResumeRef.current = Date.now();

    setStatus("running");
  };

  const pause = () => {
    if (status !== "running") return;

    const now = Date.now();
    if (lastResumeRef.current != null) {
      activeMsRef.current += now - lastResumeRef.current;
    }
    lastResumeRef.current = null;
    setStatus("paused");
  };

  const resume = () => {
    if (status !== "paused") return;

    lastResumeRef.current = Date.now();
    setStatus("running");
  };

  const stop = () => {
    if (status === "running" && lastResumeRef.current != null) {
      const nowMs = Date.now();
      activeMsRef.current += nowMs - lastResumeRef.current;
      lastResumeRef.current = null;
    }

    const end = new Date();
    setEndedAt(end);

    const totalMinutes = Math.max(
      0,
      Math.round(activeMsRef.current / 60000)
    );
    setDurationMinutes(totalMinutes);

    setStatus("idle");
  };

  return {
    steps,
    // for backwards compatibility if needed
    active,
    // more explicit status flags
    status,
    isRunning: status === "running",
    isPaused: status === "paused",

    // timing info
    startedAt,
    endedAt,
    durationMinutes,

    // controls
    start,
    pause,
    resume,
    stop,
  };
}
