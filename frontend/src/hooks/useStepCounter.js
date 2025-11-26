import { useEffect, useRef, useState } from "react";

/**
 * Foreground step counter using accelerometer magnitude + adaptive threshold.
 * Works on HTTPS or localhost. iOS needs a user gesture to grant permission.
 */
export default function useStepCounter({ minStepMs = 350, initialSteps = 0 } = {}) {
  const [steps, setSteps] = useState(initialSteps);
  const [active, setActive] = useState(false);

  const last = useRef(0);
  const lp = useRef({ x: 0, y: 0, z: 0 });
  const hp = useRef({ x: 0, y: 0, z: 0 });
  const stats = useRef({ mean: 0, var: 0, n: 0 });

  // keep steps in sync with initialSteps from backend
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  useEffect(() => {
    if (!active) return;

    const onMotion = (e) => {
      const ax = e.accelerationIncludingGravity?.x ?? 0;
      const ay = e.accelerationIncludingGravity?.y ?? 0;
      const az = e.accelerationIncludingGravity?.z ?? 0;

      // low-pass filter
      const alpha = 0.9;
      lp.current.x = alpha * lp.current.x + (1 - alpha) * ax;
      lp.current.y = alpha * lp.current.y + (1 - alpha) * ay;
      lp.current.z = alpha * lp.current.z + (1 - alpha) * az;

      // high-pass filter
      hp.current.x = ax - lp.current.x;
      hp.current.y = ay - lp.current.y;
      hp.current.z = az - lp.current.z;

      const m = Math.sqrt(
        hp.current.x * hp.current.x +
          hp.current.y * hp.current.y +
          hp.current.z * hp.current.z
      );

      // running variance / mean to adapt threshold
      const n = (stats.current.n = stats.current.n + 1);
      const delta = m - stats.current.mean;
      stats.current.mean += delta / n;
      stats.current.var += delta * (m - stats.current.mean);

      const std = Math.sqrt(stats.current.var / Math.max(1, n - 1));
      const threshold = stats.current.mean + std * 1.0;

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

  const start = async () => {
    try {
      await requestPermission();
    } catch (e) {
      // ignore permission errors for now
    }
    // reset filters / timing, but NOT the step count
    last.current = 0;
    lp.current = { x: 0, y: 0, z: 0 };
    hp.current = { x: 0, y: 0, z: 0 };
    stats.current = { mean: 0, var: 0, n: 0 };
    setActive(true);
  };

  const stop = () => setActive(false);

  return { steps, active, start, stop };
}
