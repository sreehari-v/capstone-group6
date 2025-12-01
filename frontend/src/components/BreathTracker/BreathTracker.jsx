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
  onSample = null,               // real-time live sharing
}) {
  //
  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  //
  const [status, setStatus] = useState("Idle — press Start");
  const [breathIn, setBreathIn] = useState(0);
  const [breathOut, setBreathOut] = useState(0);
  const breathInRef = useRef(0);
  const breathOutRef = useRef(0);

  const [bpm, setBpm] = useState(0);
  const bpmRef = useRef(0);

  const [points, setPoints] = useState([]);
  const pointsRef = useRef([]);

  const startedAtRef = useRef(null);

  const gravityRef = useRef(0);
  const lastFiltered = useRef(0);

  const inhaleTimesRef = useRef([]);
  const exhaleTimesRef = useRef([]);
  const cycleTimesRef = useRef([]);

  const listenerRef = useRef(null);
  const bpmTimerRef = useRef(null);

  //
  // ─────────────────────────────────────────────
  // EFFECT: Start/Stop Motion Tracking
  // ─────────────────────────────────────────────
  //
  useEffect(() => {
    if (active) {
      setStatus("Requesting motion access…");

      //
      // BPM smoothing timer (running every second)
      //
      if (bpmTimerRef.current) clearInterval(bpmTimerRef.current);
      bpmTimerRef.current = setInterval(() => {
        const now = Date.now();
        const recent = cycleTimesRef.current.filter(
          (t) => t >= now - 60000
        );

        if (recent.length < 2) {
          bpmRef.current *= 0.9;
          setBpm(Math.round(bpmRef.current));
          return;
        }

        const first = recent[0];
        const last = recent[recent.length - 1];
        const meanMs = (last - first) / (recent.length - 1);

        const instant = 60000 / meanMs;
        bpmRef.current = 0.25 * instant + 0.75 * bpmRef.current;

        setBpm(Math.round(bpmRef.current));
      }, 1000);

      //
      // Motion parameters
      //
      const gravityAlpha = 0.98;
      const motionAlpha = 0.4;
      const emaAlpha = 0.05;

      let emaMean = 0;
      let emaSq = 0;
      let lastPointTime = 0;
      let lastDetectTime = 0;

      //
      // Motion Handler
      //
      const handler = (ev) => {
        const t = Date.now();
        const acc =
          ev.accelerationIncludingGravity || ev.acceleration;
        if (!acc) return;

        const raw = acc.y ?? acc.x ?? acc.z ?? 0;

        // Gravity removal
        gravityRef.current =
          gravityAlpha * gravityRef.current + (1 - gravityAlpha) * raw;

        const motion = raw - gravityRef.current;

        // Low-pass
        const filtered =
          motionAlpha * lastFiltered.current +
          (1 - motionAlpha) * motion;
        lastFiltered.current = filtered;

        // Adaptive noise estimation
        emaMean = emaAlpha * filtered + (1 - emaAlpha) * emaMean;
        emaSq =
          emaAlpha * filtered * filtered + (1 - emaAlpha) * emaSq;

        const variance = Math.max(0, emaSq - emaMean * emaMean);
        const std = Math.sqrt(variance);

        // Sensitivity → threshold
        const s = Math.min(5, Math.max(1, sensitivity));
        const multiplier = 1.8 - (s - 1) * 0.3;
        const threshold = Math.max(0.002, std * multiplier);

        //
        // FIRST MOTION → start session
        //
        if (!startedAtRef.current && Math.abs(filtered) > threshold) {
          startedAtRef.current = new Date();
          setStatus("Tracking…");
        }

        //
        // GRAPH SAMPLE (120ms interval)
        //
        if (!lastPointTime || t - lastPointTime > 120) {
          const p = { x: t, y: Number(filtered.toFixed(4)) };

          // Keep 400 most recent samples
          pointsRef.current = pointsRef.current.concat(p).slice(-400);
          setPoints(pointsRef.current.slice());

          // --- Live Sharing Emit ---
          if (typeof onSample === "function") {
            onSample({
              t: p.x,
              v: p.y,
              value: p.y,
              breathIn: breathInRef.current,
              breathOut: breathOutRef.current,
              avgRespiratoryRate: Math.round(bpmRef.current),
            });
          }

          lastPointTime = t;
        }

        //
        // Detect inhale/exhale events
        //
        const minGap = 300;

        if (
          filtered > threshold &&
          t - lastDetectTime > minGap &&
          lastFiltered.current >= 0
        ) {
          inhaleTimesRef.current.push(t);
          breathInRef.current += 1;
          setBreathIn(breathInRef.current);
          lastDetectTime = t;
        }

        if (
          filtered < -threshold &&
          t - lastDetectTime > minGap &&
          lastFiltered.current <= 0
        ) {
          exhaleTimesRef.current.push(t);
          breathOutRef.current += 1;
          setBreathOut(breathOutRef.current);
          lastDetectTime = t;
        }

        //
        // Cycle pairing
        //
        while (
          cycleTimesRef.current.length <
          Math.min(
            inhaleTimesRef.current.length,
            exhaleTimesRef.current.length
          )
        ) {
          const idx = cycleTimesRef.current.length;
          cycleTimesRef.current.push(
            Math.max(
              inhaleTimesRef.current[idx],
              exhaleTimesRef.current[idx]
            )
          );
          if (cycleTimesRef.current.length > 200)
            cycleTimesRef.current.shift();
        }
      };

      //
      // iOS permission
      //
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
            .catch(() =>
              window.addEventListener("devicemotion", handler, true)
            );
        } else {
          window.addEventListener("devicemotion", handler, true);
        }
      } catch {
        setStatus("Motion not available");
      }

      listenerRef.current = handler;
    }

    //
    // ─────────────────────────────────────────────
    // STOP TRACKING
    // ─────────────────────────────────────────────
    //
    else {
      try {
        if (listenerRef.current)
          window.removeEventListener(
            "devicemotion",
            listenerRef.current,
            true
          );
        listenerRef.current = null;
      } catch {}

      try {
        if (bpmTimerRef.current)
          clearInterval(bpmTimerRef.current);
        bpmTimerRef.current = null;
      } catch {}

      try {
        if (typeof onStop === "function") onStop();
      } catch {}

      //
      // Save session if requested
      //
      if (shouldSave && startedAtRef.current) {
        const endedAt = new Date();
        const started = startedAtRef.current;

        const durationSeconds = +(
          (endedAt - started) /
          1000
        ).toFixed(3);

        const session = {
          startedAt: started.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSeconds,
          avgRespiratoryRate: bpm,
          breathIn: breathInRef.current,
          breathOut: breathOutRef.current,
          totalBreaths: Math.floor(
            (breathInRef.current + breathOutRef.current) / 2
          ),
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

    //
    // CLEANUP
    //
    return () => {
      try {
        if (listenerRef.current)
          window.removeEventListener(
            "devicemotion",
            listenerRef.current,
            true
          );
      } catch {}

      try {
        if (bpmTimerRef.current)
          clearInterval(bpmTimerRef.current);
      } catch {}
    };
  }, [active, sensitivity, shouldSave]);

  //
  // ─────────────────────────────────────────────
  // RESET HANDLER
  // ─────────────────────────────────────────────
  //
  useEffect(() => {
    setBreathIn(0);
    setBreathOut(0);
    breathInRef.current = 0;
    breathOutRef.current = 0;

    setPoints([]);
    pointsRef.current = [];

    inhaleTimesRef.current = [];
    exhaleTimesRef.current = [];
    cycleTimesRef.current = [];

    setBpm(0);
    bpmRef.current = 0;

    startedAtRef.current = null;
  }, [resetSignal]);

  //
  // ─────────────────────────────────────────────
  // LISTENER MODE — RECEIVE SOCKET DATA
  // ─────────────────────────────────────────────
  //
  useEffect(() => {
    const handler = (ev) => {
      const payload = ev?.detail;
      if (!payload) return;

      //
      // Waveform samples
      //
      const samples = Array.isArray(payload.samples)
        ? payload.samples
        : payload.t
        ? [payload]
        : [];

      if (samples.length) {
        const mapped = samples.map((s) => ({
          x: s.t || s.x,
          y: Number(s.v ?? s.y ?? s.value ?? 0),
        }));

        pointsRef.current = pointsRef.current.concat(mapped).slice(-400);
        setPoints(pointsRef.current.slice());
      }

      //
      // Summary fields
      //
      if (typeof payload.breathIn === "number") {
        breathInRef.current = payload.breathIn;
        setBreathIn(payload.breathIn);
      }

      if (typeof payload.breathOut === "number") {
        breathOutRef.current = payload.breathOut;
        setBreathOut(payload.breathOut);
      }

      if (typeof payload.avgRespiratoryRate === "number") {
        const incoming = payload.avgRespiratoryRate;
        bpmRef.current =
          0.4 * incoming + 0.6 * bpmRef.current;
        setBpm(Math.round(bpmRef.current));
      }
    };

    window.addEventListener("socket:breath_data", handler);
    window.addEventListener("socket:session_snapshot", handler);

    return () => {
      window.removeEventListener("socket:breath_data", handler);
      window.removeEventListener("socket:session_snapshot", handler);
    };
  }, []);

  //
  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  //
  const total = Math.floor(
    (breathInRef.current + breathOutRef.current) / 2
  );

  const chartOptions = {
    chart: {
      id: "breath-chart",
      animations: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    xaxis: { type: "datetime" },
    stroke: { curve: "smooth", width: 3, colors: ["#1193d4"] },
    tooltip: { enabled: true },
    grid: { borderColor: "#475569", strokeDashArray: 3 },
    legend: { show: false },
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600 dark:text-slate-300">
        {status}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Box label="Breath In" value={breathIn} />
        <Box label="Breath Out" value={breathOut} />
        <Box label="Total" value={total} />
        <Box label="Breathing Rate" value={`${bpm} BPM`} highlight />
      </div>

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

function Box({ label, value, highlight = false }) {
  return (
    <div className="p-3 rounded bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700">
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
