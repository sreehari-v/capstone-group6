import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import useStepCounter from "../hooks/useStepCounter";
import ToastContext from "../contexts/ToastContext.jsx";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

const StepTracking = () => {
  const {
    steps,
    active,
    status,
    isRunning,
    isPaused,
    startedAt,
    endedAt,
    durationMinutes,
    start,
    pause,
    resume,
    stop,
  } = useStepCounter({});

  const { showToast } = useContext(ToastContext);

  const notify = (message, type = "info") => {
    try {
      if (typeof showToast === "function") showToast(message, type);
      else alert(message);
    } catch {
      alert(message);
    }
  };

  const [distanceKm, setDistanceKm] = useState(0);
  const [kcal, setKcal] = useState(0);

  const [summary, setSummary] = useState({
    daily: { steps: 0, distanceKm: 0, kcal: 0 },
    weekly: { steps: 0, distanceKm: 0, kcal: 0 },
    monthly: { steps: 0, distanceKm: 0, kcal: 0 },
  });

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [requestedStop, setRequestedStop] = useState(false);

  // Recalculate distance and kcal whenever steps change
  useEffect(() => {
    const strideM = 0.78; // average stride length in meters
    const kcalPerStep = 0.04;
    setDistanceKm((steps * strideM) / 1000);
    setKcal(steps * kcalPerStep);
  }, [steps]);

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await axios.get(`${API_BASE}/api/steps/summary`, {
        withCredentials: true,
      });
      if (res?.data) {
        setSummary({
          daily: res.data.daily || { steps: 0, distanceKm: 0, kcal: 0 },
          weekly: res.data.weekly || { steps: 0, distanceKm: 0, kcal: 0 },
          monthly: res.data.monthly || { steps: 0, distanceKm: 0, kcal: 0 },
        });
      }
    } catch (err) {
      console.error("Failed to load step summary", err);
      notify("Could not load step summary", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Load daily/weekly/monthly totals once when page loads
  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user clicks "Stop & Save"
  const handleStopAndSave = () => {
    if (savingSession) return;
    if (!isRunning && !isPaused) return;

    // Trigger hook stop; once hook finishes and goes to "idle",
    // the effect below will actually save to the backend.
    setRequestedStop(true);
    stop();
  };

  // After stop(), when status becomes "idle", save the session to backend
  useEffect(() => {
    if (!requestedStop) return;
    if (status !== "idle") return;
    if (!startedAt || !endedAt) {
      // Nothing useful to save; reset flag
      setRequestedStop(false);
      return;
    }

    const saveSession = async () => {
      setSavingSession(true);
      try {
        await axios.post(
          `${API_BASE}/api/steps/session`,
          {
            steps,
            distanceKm,
            kcal,
            startedAt,
            endedAt,
            durationMinutes,
          },
          { withCredentials: true }
        );

        notify("Step session saved", "success");
        await loadSummary();
      } catch (err) {
        console.error("Failed to save step session", err);
        notify("Failed to save step session", "error");
      } finally {
        setSavingSession(false);
        setRequestedStop(false);
      }
    };

    saveSession();
    // We intentionally include these so we use the final values after stop()
  }, [
    requestedStop,
    status,
    startedAt,
    endedAt,
    steps,
    distanceKm,
    kcal,
    durationMinutes,
  ]);

  const formatTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      <div className="flex items-start md:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Step Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">
            Use your phone&apos;s motion sensor to track walking sessions and
            store them securely.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.6fr] w-full">
        {/* Left: Live session metrics */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Current Session</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Card label="Steps" value={steps} />
              <Card
                label="Distance (km)"
                value={distanceKm.toFixed(2)}
              />
              <Card
                label="Calories (kcal)"
                value={kcal.toFixed(0)}
              />
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                Status:{" "}
                <span className="font-medium">
                  {status === "running"
                    ? "Running"
                    : status === "paused"
                    ? "Paused"
                    : "Idle"}
                </span>
              </p>
              <p>
                Started at: <span className="font-medium">{formatTime(startedAt)}</span>
              </p>
              <p>
                Last ended at: <span className="font-medium">{formatTime(endedAt)}</span>
              </p>
              <p>
                Duration (active, minutes):{" "}
                <span className="font-medium">
                  {durationMinutes ?? 0}
                </span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {status === "idle" && (
                <button
                  onClick={start}
                  className="btn bg-[var(--primary-color)] text-white px-5 py-2 rounded-full font-medium"
                >
                  Start Walk
                </button>
              )}

              {status === "running" && (
                <>
                  <button
                    onClick={pause}
                    className="btn bg-slate-200 text-slate-800 px-4 py-2 rounded-full font-medium"
                  >
                    Pause
                  </button>
                  <button
                    onClick={handleStopAndSave}
                    disabled={savingSession}
                    className="btn bg-red-500 text-white px-4 py-2 rounded-full font-medium disabled:opacity-60"
                  >
                    {savingSession ? "Saving..." : "Stop & Save"}
                  </button>
                </>
              )}

              {status === "paused" && (
                <>
                  <button
                    onClick={resume}
                    className="btn bg-[var(--primary-color)] text-white px-4 py-2 rounded-full font-medium"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleStopAndSave}
                    disabled={savingSession}
                    className="btn bg-red-500 text-white px-4 py-2 rounded-full font-medium disabled:opacity-60"
                  >
                    {savingSession ? "Saving..." : "Stop & Save"}
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              iOS requires tapping <b>Start Walk</b> to grant motion access.
              Keep this page open and your phone in a pocket while walking.
            </p>
          </div>
        </div>

        {/* Right: Daily / Weekly / Monthly summary */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Step Summary</h2>
              {loadingSummary && (
                <span className="text-xs text-gray-500">Refreshing…</span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Daily Steps
                </div>
                <div className="text-3xl font-bold mt-1">
                  {summary.daily.steps}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Weekly Steps
                </div>
                <div className="text-3xl font-bold mt-1">
                  {summary.weekly.steps}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Monthly Steps
                </div>
                <div className="text-3xl font-bold mt-1">
                  {summary.monthly.steps}
                </div>
              </div>
            </div>

            <button
              onClick={loadSummary}
              className="mt-4 text-sm text-[var(--primary-color)] font-medium"
            >
              Refresh summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ label, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
    <p className="text-[#0d171b] text-base font-medium leading-normal">
      {label}
    </p>
    <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">
      {value}
    </p>
  </div>
);

export default StepTracking;
