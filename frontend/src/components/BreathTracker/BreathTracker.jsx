import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";

export default function BreathTracker({
  active = false,
  onStop,
  onSave,
  resetSignal = 0,
  // only save when parent explicitly requests (prevents accidental saves on unmount/refresh)
  shouldSave = false,
  // called after a requested save has been delivered
  onSaved = () => {},
  // sensitivity slider value from parent (1..5). Higher means more sensitive (detect smaller motion)
  sensitivity = 3,
  // optional callback invoked for each new sample { x, y }
  onSample = null,
}) {
  // Simplified tracker: no sensors, no sockets. Keep UI only.
  const [status, setStatus] = useState("Idle — press Start to begin");
  const [breathIn, setBreathIn] = useState(0);
  const [breathOut, setBreathOut] = useState(0);
  const [points, setPoints] = useState([]);
  const breathInRef = useRef(0);
  const breathOutRef = useRef(0);
  const [bpm, setBpm] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const startedAtRef = useRef(null);
  const gravityRef = useRef(0);
  const lastFiltered = useRef(0);
  const lastDir = useRef(0);
  const inhaleTimesRef = useRef([]);
  const exhaleTimesRef = useRef([]);
  const cycleTimesRef = useRef([]);
  const pointsRef = useRef([]);
  const listenerRef = useRef(null);
  const bpmRef = useRef(0);
  const bpmTimerRef = useRef(null);

  useEffect(() => {
    if (active) {
      // prepare for listening; do not mark startedAt until we receive first motion event
      setStatus("Requesting sensor access — place phone on chest and keep still");

      // start BPM timer
      if (bpmTimerRef.current) clearInterval(bpmTimerRef.current);
      bpmTimerRef.current = setInterval(() => {
        try {
          const now = Date.now();
          const windowMs = 60000;
          const recent = (cycleTimesRef.current || []).filter((ts) => ts >= now - windowMs);
          if (recent.length < 2) {
            bpmRef.current = Math.max(0, bpmRef.current * 0.9);
            setBpm(Math.round(bpmRef.current));
            return;
          }
          const first = recent[0];
          const last = recent[recent.length - 1];
          const intervals = recent.length - 1;
          const meanMs = (last - first) / intervals;
          const instantBpm = 60000 / meanMs;
          const alpha = 0.25;
          bpmRef.current = alpha * instantBpm + (1 - alpha) * bpmRef.current;
          setBpm(Math.round(bpmRef.current));
        } catch {
          /* ignore */
        }
      }, 1000);

      // attach devicemotion listener
      const gravityAlpha = 0.98;
      const motionAlpha = 0.4;
      const emaAlpha = 0.05;
      let emaMean = 0;
      let emaSq = 0;
      let lastEventTime = 0;
      let lastCountTime = 0;

      const handler = (ev) => {
        const t = Date.now();
        const acc = ev.accelerationIncludingGravity || ev.acceleration;
        if (!acc) return;
        const raw = acc.y ?? acc.x ?? acc.z ?? 0;
        gravityRef.current = gravityAlpha * gravityRef.current + (1 - gravityAlpha) * raw;
        const motion = raw - gravityRef.current;
        const filtered = motionAlpha * lastFiltered.current + (1 - motionAlpha) * motion;
        lastFiltered.current = filtered;

        // adaptive threshold
        emaMean = emaAlpha * filtered + (1 - emaAlpha) * emaMean;
        emaSq = emaAlpha * (filtered * filtered) + (1 - emaAlpha) * emaSq;
        const variance = Math.max(0, emaSq - emaMean * emaMean);
        const std = Math.sqrt(variance);
  // Map sensitivity (1..5) to a multiplier where 3 -> 1.2 (original behavior)
  // Higher sensitivity -> smaller multiplier -> smaller threshold (more sensitive)
  const s = Math.min(5, Math.max(1, sensitivity || 3));
  const multiplier = 1.8 - (s - 1) * 0.3; // 1 -> 1.8, 3 -> 1.2, 5 -> 0.6
  const threshold = Math.max(0.002, std * multiplier);

        // set startedAt on first meaningful motion (use ref to ensure synchronous value)
        if (!startedAtRef.current && Math.abs(filtered) > threshold) {
          const nowDate = new Date();
          startedAtRef.current = nowDate;
          try { setStartedAt(nowDate); } catch { /* ignore */ }
          setStatus("Tracking — collecting motion data");
        }

        // append point at most every 120ms
        if (!lastEventTime || t - lastEventTime > 120) {
          const p = { x: t, y: Number(filtered.toFixed(4)) };
          pointsRef.current = pointsRef.current.concat(p).slice(-400);
          setPoints(pointsRef.current.slice());
          try {
            if (typeof onSample === 'function') {
              // log sample emission for debugging
              try { console.debug('BreathTracker onSample ->', { t: p.x, v: p.y }); } catch (e) { console.warn('log failed', e); }
              // include current aggregate counts and estimated BPM so listeners can show same stats
              try {
                const samplePayload = { t: p.x, v: p.y, value: p.y, breathIn: breathInRef.current || 0, breathOut: breathOutRef.current || 0, avgRespiratoryRate: Math.round(bpmRef.current || bpm) || 0 };
                onSample(samplePayload);
              } catch {
                // fallback to minimal sample
                try { onSample({ t: p.x, v: p.y, value: p.y }); } catch (err) { console.warn('onSample fallback failed', err); }
              }
            }
          } catch (err) { console.warn('onSample callback failed', err); }
          lastEventTime = t;
        }

        const minInterval = 300;
        if (filtered > threshold && lastDir.current !== 1 && t - lastCountTime > minInterval) {
          inhaleTimesRef.current.push(t);
          // update synchronous refs first so emitted samples include the new counts
          breathInRef.current = (breathInRef.current || 0) + 1;
          try { setBreathIn((v) => v + 1); } catch (e) { console.warn('setBreathIn failed', e); }
          // emit an immediate summary update so listeners can update counts without waiting for next sample
          try {
            if (typeof onSample === 'function') onSample({ breathIn: breathInRef.current, breathOut: breathOutRef.current, avgRespiratoryRate: Math.round(bpmRef.current || bpm) || 0 });
          } catch (err) { console.warn('onSample summary emit failed', err); }
          lastDir.current = 1;
          lastCountTime = t;
        } else if (filtered < -threshold && lastDir.current !== -1 && t - lastCountTime > minInterval) {
          exhaleTimesRef.current.push(t);
          breathOutRef.current = (breathOutRef.current || 0) + 1;
          try { setBreathOut((v) => v + 1); } catch (e) { console.warn('setBreathOut failed', e); }
          try {
            if (typeof onSample === 'function') onSample({ breathIn: breathInRef.current, breathOut: breathOutRef.current, avgRespiratoryRate: Math.round(bpmRef.current || bpm) || 0 });
          } catch (err) { console.warn('onSample summary emit failed', err); }
          lastDir.current = -1;
          lastCountTime = t;
        }

        // try to pair cycles
        while (cycleTimesRef.current.length < Math.min(inhaleTimesRef.current.length, exhaleTimesRef.current.length)) {
          const idx = cycleTimesRef.current.length;
          const iT = inhaleTimesRef.current[idx];
          const eT = exhaleTimesRef.current[idx];
          if (iT && eT) {
            cycleTimesRef.current.push(Math.max(iT, eT));
            if (cycleTimesRef.current.length > 200) cycleTimesRef.current.shift();
          } else break;
        }
      };

      try {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
          // mobile iOS permission flow
          DeviceMotionEvent.requestPermission().then((resp) => {
            if (resp === 'granted') window.addEventListener('devicemotion', handler, true);
            else setStatus('Motion permission denied');
          }).catch(() => {
            // still try to listen
            try { window.addEventListener('devicemotion', handler, true); } catch { setStatus('Motion not available'); }
          });
        } else {
          window.addEventListener('devicemotion', handler, true);
        }
        listenerRef.current = handler;
      } catch {
        setStatus('Motion listener failed');
      }

      // If this device is producing a session (has a session code stored), announce streaming
      const announceStreamingIfNeeded = () => {
        try {
          const code = typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null;
          if (code) {
            window.dispatchEvent(new CustomEvent('session:updated', { detail: { code, role: 'producer', listenersCount: 0, streaming: true } }));
          }
        } catch { /* ignore */ }
      };

      // If active and we already have startedAtRef (maybe from prior events), announce now
      if (active && startedAtRef.current) announceStreamingIfNeeded();

    } else {
      // stop listening and cleanup
      try {
        if (listenerRef.current) {
          try { window.removeEventListener('devicemotion', listenerRef.current, true); } catch { /* ignore */ }
          listenerRef.current = null;
        }
      } catch { /* ignore */ }

      // announce stream ended for any active session code
      try {
        const code = typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null;
        if (code) {
          window.dispatchEvent(new CustomEvent('session:updated', { detail: { code, role: 'producer', listenersCount: 0, streaming: false } }));
        }
      } catch { /* ignore */ }

      // when stopping, call onStop. Only call onSave if parent explicitly asked (shouldSave)
      try {
        if (typeof onStop === "function") onStop();
      } catch (err) {
        console.debug("BreathTracker onStop callback error", err);
      }

  const endedAt = new Date();
  const started = startedAtRef.current || startedAt || new Date(endedAt.getTime());
  const durationMs = Math.max(0, endedAt - started);
      const durationSeconds = +(durationMs / 1000).toFixed(3);

      // Build the session payload with collected data. Include sample points so the
      // backend stores the waveform if available. Each sample has { x: timestamp, y: value }.
      const session = {
        startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
        endedAt: endedAt.toISOString(),
        durationSeconds,
        avgRespiratoryRate: bpm || 0,
        breathIn: breathIn || 0,
        breathOut: breathOut || 0,
        totalBreaths: total || 0,
        // include only samples within the session window and include raw value
        samples: (pointsRef.current || []).filter((p) => {
          return p && p.x && p.x >= (started ? started.getTime() : 0) && p.x <= endedAt.getTime();
        }).map((p) => ({ t: p.x, v: p.y, value: p.y })),
        // include cycle timestamps (ms) for advanced analysis if available
  cycleTimestamps: (cycleTimesRef.current || []).slice(),
      };

      // Only persist when parent explicitly requests a save. This avoids accidental
      // session inserts during navigations or page refreshes where the component
      // might unmount.
      if (shouldSave && startedAt) {
        try {
          if (typeof onSave === "function") onSave(session);
        } catch (err) {
          console.warn("BreathTracker onSave failed", err);
        }
  try { onSaved(); } catch { /* ignore */ }
      }

      setStatus("Stopped");
      setStartedAt(null);
    }
    return () => {
      // cleanup when effect re-runs or component unmounts
      try { if (listenerRef.current) { window.removeEventListener('devicemotion', listenerRef.current, true); listenerRef.current = null; } } catch { /* ignore */ }
      try { if (bpmTimerRef.current) { clearInterval(bpmTimerRef.current); bpmTimerRef.current = null; } } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // reset handler
  useEffect(() => {
    setBreathIn(0);
    setBreathOut(0);
  breathInRef.current = 0;
  breathOutRef.current = 0;
    setPoints([]);
    setBpm(0);
    setStartedAt(null);
  }, [resetSignal]);

  // Listen for incoming socket data when acting as a listener. The backend forwards
  // 'breath_data' payloads which may contain samples and summary fields.
  useEffect(() => {
    const handler = (ev) => {
      const payload = ev && ev.detail ? ev.detail : ev;
      if (!payload) return;
      const samples = Array.isArray(payload.samples) ? payload.samples : (Array.isArray(payload) ? payload : (payload.t ? [payload] : []));
      if (samples.length) {
        try {
          const mapped = samples.map((s) => ({ x: s.t || s.x, y: Number((s.v ?? s.y ?? s.value ?? 0).toFixed ? (s.v ?? s.y ?? s.value ?? 0) : Number(s.v ?? s.y ?? s.value ?? 0)) }));
          pointsRef.current = pointsRef.current.concat(mapped).slice(-400);
          setPoints(pointsRef.current.slice());
        } catch {
          /* ignore malformed samples */
        }
      }
      if (typeof payload.breathIn === 'number') {
        console.debug('BreathTracker(listener) set breathIn ->', payload.breathIn);
        breathInRef.current = payload.breathIn;
        setBreathIn(payload.breathIn);
      }
      if (typeof payload.breathOut === 'number') {
        console.debug('BreathTracker(listener) set breathOut ->', payload.breathOut);
        breathOutRef.current = payload.breathOut;
        setBreathOut(payload.breathOut);
      }
      if (typeof payload.avgRespiratoryRate === 'number') {
        // smooth incoming BPM updates to reduce jitter on listeners
        const alpha = 0.4;
        const incoming = payload.avgRespiratoryRate || 0;
        bpmRef.current = alpha * incoming + (1 - alpha) * (bpmRef.current || incoming);
        setBpm(Math.round(bpmRef.current));
      }
    };
    try { window.addEventListener('socket:breath_data', handler); } catch { /* ignore */ }
    try { window.addEventListener('socket:session_snapshot', handler); } catch { /* ignore */ }
    return () => {
      try { window.removeEventListener('socket:breath_data', handler); } catch { /* ignore */ }
      try { window.removeEventListener('socket:session_snapshot', handler); } catch { /* ignore */ }
    };
  }, []);

  const total = Math.floor((breathIn + breathOut) / 2);

  const chartOptions = {
    chart: { id: "breath-chart", animations: { enabled: false }, toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: false } },
    xaxis: { type: "datetime" },
    stroke: { curve: "smooth", width: 3, colors: ["#1193d4"] },
    tooltip: { enabled: true, x: { format: "HH:mm:ss" } },
    legend: { show: false },
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600">{status}</div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 bg-slate-100 rounded">
              <div className="text-sm">Breath In</div>
              <div className="text-2xl font-bold">{breathIn}</div>
            </div>
            <div className="p-3 bg-slate-100 rounded">
              <div className="text-sm">Breath Out</div>
              <div className="text-2xl font-bold">{breathOut}</div>
            </div>
            <div className="p-3 bg-slate-100 rounded">
              <div className="text-sm">Total</div>
              <div className="text-2xl font-bold">{total}</div>
            </div>
            <div className="p-3 rounded bg-slate-100">
              <div className="text-sm">Breathing Rate</div>
              <div className="text-2xl font-bold">{bpm} BPM</div>
            </div>
          </div>

          <div className="mt-4">
            {Chart ? (
              <Chart
                options={chartOptions}
                series={[{ name: "breath", data: points.map((p) => ({ x: p.x, y: p.y })), color: "#1193d4" }]}
                type="area"
                height={240}
              />
            ) : (
              <div className="p-3 border rounded text-sm">
                ApexCharts not installed — install react-apexcharts & apexcharts for a realtime chart.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
