// ⭐ FINAL MERGED VERSION — NO MERGE CONFLICTS

import React, { useContext, useEffect, useState, useCallback } from "react";
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

  const notify = useCallback(
    (message, type = "info") => {
      try {
        if (typeof showToast === "function") showToast(message, type);
        else alert(message);
      } catch {
        alert(message);
      }
    },
    [showToast]
  );

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

  // Recalculate metrics when steps change
  useEffect(() => {
    const strideM = 0.78;
    const kcalPerStep = 0.04;

    setDistanceKm((steps * strideM) / 1000);
    setKcal(steps * kcalPerStep);
  }, [steps]);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);

    try {
      const res = await axios.get(`${API_BASE}/api/steps/summary`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res?.data) {
        setSummary({
          daily: res.data.daily || summary.daily,
          weekly: res.data.weekly || summary.weekly,
          monthly: res.data.monthly || summary.monthly,
        });
      }
    } catch (err) {
      console.error("Failed to load step summary", err);
      notify("Could not load step summary", "error");
    } finally {
      setLoadingSummary(false);
    }
  }, [notify]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleStopAndSave = () => {
    if (savingSession) return;
    if (!isRunning && !isPaused) return;

    setRequestedStop(true);
    stop(); // triggers finalization in effect below
  };

  // Save final session after hook goes to idle
  useEffect(() => {
    if (!requestedStop) return;
    if (status !== "idle") return;

    if (!startedAt || !endedAt) {
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
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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
  }, [
    requestedStop,
    status,
    startedAt,
    endedAt,
    steps,
    distanceKm,
    kcal,
    durationMinutes,
    loadSummary,
    notify,
  ]);

  const formatTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main
      className="
        relative flex min-h-screen w-full flex-col 
        bg-[var(--background-light)] 
        dark:bg-[#000000ff]
        text-[var(--text-primary)]
        dark:text-slate-200
      "
    >
      <div
        className="layout-container flex h-full grow flex-col"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div
          className="
            layout-content-container flex flex-col max-w-[960px] flex-1
            bg-[var(--background-light)]
            dark:bg-[#000000ff]
            text-[var(--text-primary)]
            dark:text-slate-200
          "
        >
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <h1 className="tracking-light text-[32px] font-bold text-[#0d171b] dark:text-white">
              Step Tracking
            </h1>
          </div>

          {/* ---- LIVE SESSION SUMMARY (NEW) ---- */}
          <h2 className="text-[24px] font-bold text-[#0d171b] dark:text-white">
            Step Tracking Summary
          </h2>

          <div className="flex flex-wrap gap-4 p-4">
            <Card label="Daily Steps" value={steps.toLocaleString()} />
            <Card label="Weekly Steps" value={summary.weekly.steps.toLocaleString()} />
            <Card label="Monthly Steps" value={summary.monthly.steps.toLocaleString()} />
          </div>

          {/* ---- SESSION CONTROL ---- */}
          <div className="px-4 pb-5 flex gap-3">
            {status === "idle" && (
              <button
                onClick={start}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Start Walk
              </button>
            )}

            {status === "running" && (
              <>
                <button
                  onClick={pause}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Pause
                </button>
                <button
                  onClick={handleStopAndSave}
                  disabled={savingSession}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
                >
                  {savingSession ? "Saving…" : "Stop & Save"}
                </button>
              </>
            )}

            {status === "paused" && (
              <>
                <button
                  onClick={resume}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Resume
                </button>
                <button
                  onClick={handleStopAndSave}
                  disabled={savingSession}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
                >
                  {savingSession ? "Saving…" : "Stop & Save"}
                </button>
              </>
            )}

            <p className="self-center text-sm text-gray-600 dark:text-slate-300">
              iOS requires tapping <b>Start Walk</b> to enable motion access.
            </p>
          </div>

          {/* ---- Distance and Calories ---- */}
          <h2 className="text-[22px] font-bold text-[#0d171b] dark:text-white">
            Distance and Calories
          </h2>

          <div className="flex flex-wrap gap-4 p-4">
            <Card label="Distance Covered" value={`${distanceKm.toFixed(2)} km`} />
            <Card label="Calories Burned" value={`${kcal.toFixed(0)} kcal`} />
          </div>
        </div>
      </div>
    </main>
  );
};

// Unified Card component
const Card = ({ label, value }) => (
  <div
    className="
      flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6
      border border-[#cfdfe7]
      bg-white
      dark:bg-[#1e293b] dark:border-gray-600
    "
  >
    <p className="text-base font-medium text-[#0d171b] dark:text-white">
      {label}
    </p>
    <p className="text-2xl font-bold text-[#0d171b] dark:text-white">
      {value}
    </p>
  </div>
);

export default StepTracking;
