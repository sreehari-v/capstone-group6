import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

const Overview = () => {
  const [medicines, setMedicines] = useState([]);

  // Steps state (coming from backend summary)
  const [stepsToday, setStepsToday] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyByDay, setWeeklyByDay] = useState([]); // new
  const [loadingSteps, setLoadingSteps] = useState(false);

  const goal = 10000;

  const [breathLast] = useState({ bpm: 16, min: 11, max: 22 });
  const [sessionInfo, setSessionInfo] = useState(() => ({
    code: typeof window !== 'undefined' ? localStorage.getItem('sessionCode') : null,
    listeners: 0,
    role: null,
  }));

  const navigate = useNavigate();

  // Verify user JWT session on load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        await axios.get("/api/auth/me", { withCredentials: true });
      } catch {
        return navigate("/login");
      }
    };
    verifyUser();
  }, [navigate]);

  // Load medicines
  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await axios.get("/api/medicines", {
          withCredentials: true,
        });
        setMedicines(Array.isArray(res.data) ? res.data : []);
      } catch {
        setMedicines([]);
      }
    };
    fetchMeds();
  }, []);

  // Listen for session updates dispatched by BreathTracker (or other components)
  useEffect(() => {
    const handler = (ev) => {
      const d = ev && ev.detail ? ev.detail : {};
      if (d && d.code === null) {
        setSessionInfo({ code: null, listeners: 0, role: null });
        return;
      }
      setSessionInfo((prev) => ({
        code: d.code || prev.code,
        role: d.role || prev.role,
        // If a listeners count is provided, use it; otherwise keep previous or set 1 if a listener joined
        listeners: typeof d.listenersCount === 'number' ? d.listenersCount : (d.role === 'listener' ? Math.max(1, prev.listeners) : prev.listeners),
      }));
    };

    try {
      window.addEventListener('session:updated', handler);
    } catch (err) { void err; }
    return () => {
      try { window.removeEventListener('session:updated', handler); } catch (err) { void err; }
    };
  }, []);

  const medsToday = useMemo(() => {
    return medicines
      .slice()
      .sort((a, b) => ((a.time || "") > (b.time || "") ? 1 : -1))
      .slice(0, 10);
  }, [medicines]);

  const stepsProgress = Math.round((stepsToday / goal) * 100);

  // Prepare weekly bars from weeklyByDay
  const weeklyBars = useMemo(() => {
    if (!weeklyByDay || weeklyByDay.length === 0) {
      // fallback: 7 zeros
      return Array.from({ length: 7 }, () => ({ date: null, steps: 0 }));
    }
    // ensure exactly 7 entries oldest -> newest
    const arr = weeklyByDay.slice(-7);
    if (arr.length < 7) {
      const padCount = 7 - arr.length;
      const padded = Array.from({ length: padCount }, () => ({
        date: null,
        steps: 0,
      }));
      return [...padded, ...arr];
    }
    return arr;
  }, [weeklyByDay]);

  const medicinesSummary = useMemo(() => {
    const counts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    medicines.forEach((m) => {
      if (m?.schedule && counts[m.schedule] !== undefined)
        counts[m.schedule]++;
    });

    return { counts, total: medicines.length };
  }, [medicines]);

  const score = Math.round(
    0.3 * Math.min(100, stepsProgress) +
      0.4 * (medicinesSummary.total ? 100 : 0) +
      0.3 * 100
  );

  const formatDayLabel = (isoDate, fallbackIndex) => {
    if (!isoDate) {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][fallbackIndex];
    }
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { weekday: "short" });
  };

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold">Overview</h1>

        {/* Buttons: stack below title on small screens, inline on md+ */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/steps"
            className="px-4 py-2 bg-slate-100 rounded shadow hover:bg-slate-200"
          >
            Start Walk
          </Link>
          <Link
            to="/dashboard/breath"
            className="px-4 py-2 bg-slate-100 rounded shadow hover:bg-slate-200"
          >
            Start Breath Tracking
          </Link>
          <Link
            to="/dashboard/medication"
            className="px-4 py-2 bg-slate-100 rounded shadow hover:bg-slate-200"
          >
            Add Medicine
          </Link>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Steps */}
        <div className="p-4 bg-white rounded-xl shadow min-w-0">
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>Steps Today</span>
            {loadingSteps && (
              <span className="text-[10px] text-gray-400">Loading…</span>
            )}
          </div>
          <div className="text-3xl font-bold mt-1">
            {stepsToday.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stepsProgress}% of {goal.toLocaleString()}
          </div>
        </div>

        {/* Breathing */}
        <div className="p-4 bg-white rounded-xl shadow min-w-0">
          <div className="text-sm text-gray-500">Breathing</div>
          <div className="text-3xl font-bold mt-1">{breathLast.bpm} BPM</div>
          <div className="text-sm text-gray-600 mt-1">
            {breathLast.bpm >= 12 && breathLast.bpm <= 20
              ? "Normal"
              : breathLast.bpm < 12
              ? "Low"
              : "Elevated"}
          </div>
          <Link
            to="/dashboard/breath"
            className="text-sm text-blue-600 mt-2 block"
          >
            View Details
          </Link>
        </div>

        {/* Medicine Summary */}
        <div className="p-4 bg-white rounded-xl shadow min-w-0">
          <div className="text-sm text-gray-500">Medicines Today</div>
          <div className="text-3xl font-bold mt-1">
            {medicinesSummary.total}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            M ({medicinesSummary.counts.Morning}) • A (
            {medicinesSummary.counts.Afternoon}) • N (
            {medicinesSummary.counts.Night})
          </div>
        </div>

        {/* Active Session */}
        <div className="p-4 bg-white rounded-xl shadow min-w-0">
          <div className="text-sm text-gray-500">Active Session</div>
          <div className="text-xl font-bold mt-1">{sessionInfo.code ? 'Session active' : 'No active session'}</div>
          <div className="text-sm text-gray-600">Viewer Code: {sessionInfo.code || "—"}</div>
          <div className="text-sm text-gray-600">{sessionInfo.listeners} device{sessionInfo.listeners === 1 ? '' : 's'} listening</div>
        </div>
      </div>

      {/* DAILY HEALTH SCORE */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 min-w-0">
        <h3 className="font-semibold text-lg mb-4">Daily Health Score</h3>

        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          {/* Score Text */}
          <div className="min-w-0">
            <div className="text-5xl font-bold">{score}</div>
            <div className="text-sm text-gray-600 mt-1">
              Healthy routine maintained.
            </div>
          </div>

          {/* Circle */}
          <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-100 to-sky-200 shadow-md">
            <div className="text-4xl font-extrabold">{score}</div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Weekly Steps */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-2 min-w-0">
          <h3 className="font-semibold text-lg mb-3">Weekly Steps</h3>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              height: "180px",
              position: "relative",
            }}
          >
            {weeklyBars.map((d, i) => {
              const steps = Number(d.steps) || 0;
              const maxSteps =
                weeklyBars.reduce(
                  (max, item) => Math.max(max, Number(item.steps) || 0),
                  0
                ) || 1;

              const ratio = steps / maxSteps;
              const barHeight = 20 + ratio * 120;

              const dayLabel = formatDayLabel(d.date, i);

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  {/* Tooltip on Hover */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${barHeight + 8}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "4px 8px",
                      background: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      fontSize: "10px",
                      borderRadius: "4px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 10,
                      opacity: steps ? 0 : 0, // default hidden
                    }}
                    className="tooltip"
                  >
                    {dayLabel}: {steps.toLocaleString()} steps
                  </div>

                  {/* Bar */}
                  <div
                    style={{
                      width: "14px",
                      height: `${barHeight}px`,
                      margin: "0 auto",
                      borderRadius: "4px",
                      backgroundColor: "#0ea5e9",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.previousSibling.style.opacity = 1;
                      e.currentTarget.style.backgroundColor = "#0284c7"; // darker on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.previousSibling.style.opacity = 0;
                      e.currentTarget.style.backgroundColor = "#0ea5e9";
                    }}
                  ></div>

                  {/* Labels */}
                  <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                    {dayLabel}
                  </div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {steps.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-sm text-gray-600 mt-3">
            Weekly total:{" "}
            <span className="font-semibold">
              {weeklyTotal.toLocaleString()} steps
            </span>
          </div>
        </div>

        {/* Upcoming Medicines */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-1 min-w-0">
          <h3 className="font-semibold text-lg mb-3">Upcoming Medicines</h3>

          {medsToday.length === 0 && (
            <div className="text-sm text-gray-500">No medicines today.</div>
          )}

          {medsToday.map((m) => (
            <div
              key={m._id}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <div className="min-w-0">
                <div className="font-medium break-words">{m.name}</div>
                <div className="text-sm text-gray-500">
                  {m.dosage} • {m.beforeFood ? "Before" : "After"} food
                </div>
              </div>
              <div className="text-sm text-gray-700">{m.time || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
