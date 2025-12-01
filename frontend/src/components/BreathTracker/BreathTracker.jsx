import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";

export default function BreathTracker({
  active = false,
  onStop,
  onSave,
  resetSignal = 0,
  shouldSave = false,
  onSaved = () => {},
  sensitivity = 3,
  onSample = null,
}) {
  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [status, setStatus] = useState("Idle — press Start");
  const [breathIn, setBreathIn] = useState(0);
  const [breathOut, setBreathOut] = useState(0);
  const [points, setPoints] = useState([]);
  const [bpm, setBpm] = useState(0);

  const startedAtRef = useRef(null);
  const gravityRef = useRef(0);
  const lastFiltered = useRef(0);
  const lastDir = useRef(0);

  const inhaleTimesRef = useRef([]);
  const exhaleTimesRef = useRef([]);
  const cycleTimesRef = useRef([]);

  const pointsRef = useRef([]);
  const bpmRef = useRef(0);
  const bpmTimerRef = useRef(null);

  const listenerRef = useRef(null);

  // ─────────────────────────────────────────────
  // START / STOP MOTION TRACKING
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (active) {
      setStatus("Requesting motion access…");

      if (bpmTimerRef.current) clearInterval(bpmTimerRef.current);
      bpmTimerRef.current = setInterval(() => {
        try {
          const now = Date.now();
          const windowMs = 60_000;
          const recent = cycleTimesRef.current.filter(
            (t) => t >= now - windowMs
          );

          if (recent.length < 2) {
            bpmRef.current *= 0.9;
            setBpm(Math.round(bpmRef.current));
            return;
          }

          const first = recent[0];
          const last = recent[recent.length - 1];
          const intervals = recent.length - 1;

          const meanMs = (last - first) / intervals;
          const insta = 60000 / meanMs;

          bpmRef.current = 0.25 * insta + 0.75 * bpmRef.current;
          setBpm(Math.round(bpmRef.current));
        } catch {}
      }, 1000);

      const gravityAlpha = 0.98;
      const motionAlpha = 0.4;
      const emaAlpha = 0.05;

      let emaMean = 0;
      let emaSq = 0;
      let lastPointTime = 0;
      let lastDetectTime = 0;

      const handler = (ev) => {
        const t = Date.now();
        const acc = ev.accelerationIncludingGravity || ev.acceleration;
        if (!acc) return;

        const raw = acc.y ?? acc.x ?? acc.z ?? 0;

        gravityRef.current =
          gravityAlpha * gravityRef.current + (1 - gravityAlpha) * raw;

        const motion = raw - gravityRef.current;

        const filtered =
          motionAlpha * lastFiltered.current +
          (1 - motionAlpha) * motion;

        lastFiltered.current = filtered;

        // adaptive threshold
        emaMean = emaAlpha * filtered + (1 - emaAlpha) * emaMean;
        emaSq = emaAlpha * filtered * filtered + (1 - emaAlpha) * emaSq;

        const variance = Math.max(0, emaSq - emaMean * emaMean);
        const std = Math.sqrt(variance);

        const s = Math.min(5, Math.max(1, sensitivity));
        const multiplier = 1.8 - (s - 1) * 0.3; // sensitivity → multiplier mapping
        const threshold = Math.max(0.002, std * multiplier);

        // first valid motion marks session start
        if (!startedAtRef.current && Math.abs(filtered) > threshold) {
          const now = new Date();
          startedAtRef.current = now;
          setStatus("Tracking…");
        }

        // Sample graph point every ~120ms
        if (!lastPointTime || t - lastPointTime > 120) {
          const p = { x: t, y: Number(filtered.toFixed(4)) };
          pointsRef.current = pointsRef.current
            .concat(p)
            .slice(-400);

          setPoints(pointsRef.current.slice());

          try {
            if (typeof onSample === "function") {
              onSample({ t: p.x, v: p.y, value: p.y });
            }
          } catch {}

          lastPointTime = t;
        }

        // Detect inhale/exhale events
        const minGap = 300;

        if (
          filtered > threshold &&
          lastDir.current !== 1 &&
          t - lastDetectTime > minGap
        ) {
          inhaleTimesRef.current.push(t);
          setBreathIn((v) => v + 1);
          lastDir.current = 1;
          lastDetectTime = t;
        } else if (
          filtered < -threshold &&
          lastDir.current !== -1 &&
          t - lastDetectTime > minGap
        ) {
          exhaleTimesRef.current.push(t);
          setBreathOut((v) => v + 1);
          lastDir.current = -1;
          lastDetectTime = t;
        }

        // Pair cycles
        while (
          cycleTimesRef.current.length <
          Math.min(
            inhaleTimesRef.current.length,
            exhaleTimesRef.current.length
          )
        ) {
          const idx = cycleTimesRef.current.length;
          const iT = inhaleTimesRef.current[idx];
          const eT = exhaleTimesRef.current[idx];
          const cycleT = Math.max(iT, eT);

          cycleTimesRef.current.push(cycleT);
          if (cycleTimesRef.current.length > 200)
            cycleTimesRef.current.shift();
        }
      };

      // permission for iOS
      try {
        if (
          typeof DeviceMotionEvent !== "undefined" &&
          typeof DeviceMotionEvent.requestPermission === "function"
        ) {
          DeviceMotionEvent.requestPermission()
            .then((resp) => {
              if (resp === "granted") {
                window.addEventListener("devicemotion", handler, true);
              } else {
                setStatus("Motion permission denied");
              }
            })
            .catch(() => {
              window.addEventListener("devicemotion", handler, true);
            });
        } else {
          window.addEventListener("devicemotion", handler, true);
        }
      } catch {
        setStatus("Motion not available");
      }

      listenerRef.current = handler;
    } else {
      // STOP TRACKING
      try {
        if (listenerRef.current) {
          window.removeEventListener("devicemotion", listenerRef.current, true);
          listenerRef.current = null;
        }
      } catch {}

      try {
        if (bpmTimerRef.current) {
          clearInterval(bpmTimerRef.current);
          bpmTimerRef.current = null;
        }
      } catch {}

      // finalize session payload
      try {
        if (typeof onStop === "function") onStop();
      } catch {}

      if (shouldSave && startedAtRef.current) {
        const endedAt = new Date();
        const started = startedAtRef.current;
        const durationMs = endedAt - started;

        const session = {
          startedAt: started.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSeconds: +(durationMs / 1000).toFixed(3),
          avgRespiratoryRate: bpm,
          breathIn,
          breathOut,
          totalBreaths: Math.floor((breathIn + breathOut) / 2),
          samples: pointsRef.current.map((p) => ({
            t: p.x,
            v: p.y,
            value: p.y,
          })),
          cycleTimestamps: cycleTimesRef.current.slice(),
        };

        try {
          onSave?.(session);
        } catch {}

        try {
          onSaved();
        } catch {}
      }

      setStatus("Stopped");
      startedAtRef.current = null;
    }

    return () => {
      try {
        if (listenerRef.current) {
          window.removeEventListener("devicemotion", listenerRef.current, true);
          listenerRef.current = null;
        }
      } catch {}
      try {
        if (bpmTimerRef.current) {
          clearInterval(bpmTimerRef.current);
          bpmTimerRef.current = null;
        }
      } catch {}
    };
  }, [active, shouldSave, sensitivity]);

  // ─────────────────────────────────────────────
  // RESET HANDLER
  // ─────────────────────────────────────────────
  useEffect(() => {
    setBreathIn(0);
    setBreathOut(0);
    setPoints([]);
    setBpm(0);

    inhaleTimesRef.current = [];
    exhaleTimesRef.current = [];
    cycleTimesRef.current = [];
    pointsRef.current = [];
  }, [resetSignal]);

  // ─────────────────────────────────────────────
  // CHART OPTIONS
  // ─────────────────────────────────────────────
  const chartOptions = {
    chart: {
      id: "breath-chart",
      animations: { enabled: false },
      toolbar: { show: false },
      background: "transparent",
    },
    xaxis: { type: "datetime" },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#1193d4"],
    },
    tooltip: { enabled: true },
    grid: {
      borderColor: "#475569",
      strokeDashArray: 3,
    },
  };

  const total = Math.floor((breathIn + breathOut) / 2);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600 dark:text-slate-300">
        {status}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Box label="Breath In" value={breathIn} />
        <Box label="Breath Out" value={breathOut} />
        <Box label="Total" value={total} />
        <Box label="Breathing Rate" value={`${bpm} BPM`} highlight />
      </div>

      {/* GRAPH */}
      <div className="mt-4">
        <Chart
          options={chartOptions}
          series={[
            {
              name: "breath",
              data: points.map((p) => ({ x: p.x, y: p.y })),
            },
          ]}
          type="area"
          height={240}
        />
      </div>
    </div>
  );
}

// helper UI
function Box({ label, value, highlight = false }) {
  return (
    <div
      className="
      p-3 rounded 
      bg-white dark:bg-[#1e293b]
      border border-slate-200 dark:border-slate-700
      text-[#0d171b] dark:text-white
    "
    >
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${
          highlight ? "text-[#1193d4] dark:text-blue-400" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
