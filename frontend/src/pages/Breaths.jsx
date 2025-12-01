import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import BreathTracker from "../components/BreathTracker/BreathTracker";
import BreathStartModal from "../components/BreathTracker/BreathStartModal";
import ToastContext from "../contexts/ToastContext.jsx";
import { io } from "socket.io-client";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.REACT_APP_API_BASE ||
  "http://localhost:5000";

function Breaths() {
  //
  // ─────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────
  //
  const [showStartModal, setShowStartModal] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [everStarted, setEverStarted] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [sensitivity, setSensitivity] = useState(3);

  const { showToast } = useContext(ToastContext);
  const notify = useCallback(
    (msg, type = "info") => {
      try {
        showToast?.(msg, type);
      } catch {
        alert(msg);
      }
    },
    [showToast]
  );

  // Saving
  const [savingSession, setSavingSession] = useState(false);
  const [saveRequested, setSaveRequested] = useState(false);

  // Session history
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState(null);

  // Live sharing session info
  const [sessionInfo, setSessionInfo] = useState(() => ({
    code:
      typeof window !== "undefined"
        ? localStorage.getItem("sessionCode")
        : null,
    role:
      typeof window !== "undefined"
        ? localStorage.getItem("sessionRole")
        : null,
    listeners: 0,
    streaming: false,
  }));
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Device capability
  const [hasSensor, setHasSensor] = useState(true);

  // Refs
  const socketRef = useRef(null);
  const sampleBufferRef = useRef([]);

  //
  // ─────────────────────────────────────────────
  //  SOCKET INITIALIZATION
  // ─────────────────────────────────────────────
  //
  const ensureSocket = () => {
    if (socketRef.current) return socketRef.current;

    try {
      const s = io(API_BASE, { withCredentials: true });
      socketRef.current = s;

      // Basic logging
      s.on("connect", () =>
        console.debug("socket connected", s.id)
      );
      s.on("disconnect", () =>
        console.debug("socket disconnected")
      );
      s.on("connect_error", (e) =>
        console.debug("socket connect error", e)
      );

      //
      // ─────────────────────────────────────────────
      //  SESSION EVENTS
      // ─────────────────────────────────────────────
      //
      s.on("session_created", ({ code }) => {
        localStorage.setItem("sessionCode", code);
        localStorage.setItem("sessionRole", "producer");
        setSessionInfo({
          code,
          role: "producer",
          listeners: 0,
          streaming: false,
        });
        setShareCode(code);
        setShowShareModal(true);
        notify(`Session created: ${code}`, "success");

        // flush buffer
        if (sampleBufferRef.current.length) {
          s.emit("breath_data", {
            code,
            samples: sampleBufferRef.current.slice(),
          });
          sampleBufferRef.current = [];
        }
      });

      s.on("joined", ({ code }) => {
        localStorage.setItem("sessionCode", code);
        localStorage.setItem("sessionRole", "listener");
        setSessionInfo({
          code,
          role: "listener",
          listeners: 1,
          streaming: false,
        });
        notify(`Joined session ${code}`, "success");
        setJoining(false);
      });

      s.on("join_error", (err) =>
        notify(err?.message || "Failed to join", "error")
      );

      s.on("listener_joined", () => {
        setSessionInfo((prev) => ({
          ...prev,
          listeners: prev.listeners + 1,
        }));
      });

      s.on("listener_left", () => {
        setSessionInfo((prev) => ({
          ...prev,
          listeners: Math.max(0, prev.listeners - 1),
        }));
      });

      //
      // ─────────────────────────────────────────────
      //  STREAM DATA EVENTS
      // ─────────────────────────────────────────────
      //
      s.on("breath_data", (payload) => {
        window.dispatchEvent(
          new CustomEvent("socket:breath_data", {
            detail: payload,
          })
        );
      });

      s.on("session_snapshot", (snap) => {
        window.dispatchEvent(
          new CustomEvent("socket:session_snapshot", {
            detail: snap,
          })
        );
      });

      s.on("session_ended", () => {
        localStorage.removeItem("sessionCode");
        localStorage.removeItem("sessionRole");
        setSessionInfo({
          code: null,
          role: null,
          listeners: 0,
          streaming: false,
        });
      });

      return s;
    } catch (err) {
      console.warn("socket init failed", err);
      return null;
    }
  };

  //
  // ─────────────────────────────────────────────
  //  EMIT BREATH DATA
  // ─────────────────────────────────────────────
  //
  const emitToSocket = (payload) => {
    const s = socketRef.current || ensureSocket();
    if (!s || s.disconnected) return;

    const code =
      sessionInfo.code ||
      localStorage.getItem("sessionCode") ||
      null;

    if (!code) {
      // buffer samples until code exists
      const arr = Array.isArray(payload)
        ? payload.slice()
        : [payload];
      sampleBufferRef.current = sampleBufferRef.current
        .concat(arr)
        .slice(-1000);
      return;
    }

    s.emit("breath_data", {
      code,
      samples: Array.isArray(payload) ? payload : [payload],
    });
  };

  //
  // ─────────────────────────────────────────────
  //  LOAD SAVED SESSIONS
  // ─────────────────────────────────────────────
  //
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const r = await axios.get(`${API_BASE}/api/breaths`, {
        withCredentials: true,
      });
      if (r?.data?.sessions) setSessions(r.data.sessions);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  //
  // ─────────────────────────────────────────────
  //  DEVICE CAPABILITY CHECK
  // ─────────────────────────────────────────────
  //
  useEffect(() => {
    try {
      const ua =
        navigator?.userAgent ||
        navigator?.vendor ||
        "";
      const isMobile = /Mobi|Android|iPhone/i.test(ua);

      let ok = false;
      if (isMobile && typeof DeviceMotionEvent !== "undefined") {
        ok = true;
      }

      setHasSensor(ok);
    } catch {
      setHasSensor(false);
    }
  }, []);

  //
  // ─────────────────────────────────────────────
  //  SUMMARY COMPUTATION
  // ─────────────────────────────────────────────
  //
  const computeSummary = (items) => {
    const now = new Date();
    const dayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekAgo = new Date(
      now.getTime() - 7 * 86400000
    );
    const monthAgo = new Date(
      now.getTime() - 30 * 86400000
    );

    const sum = {
      today: { count: 0, avgBpm: 0, avgDur: 0 },
      week: { count: 0, avgBpm: 0, avgDur: 0 },
      month: { count: 0, avgBpm: 0, avgDur: 0 },
    };

    const bucket = (key, bpm, dur) => {
      sum[key].count++;
      sum[key].avgBpm += bpm;
      sum[key].avgDur += dur;
    };

    items.forEach((s) => {
      const st = s.startedAt ? new Date(s.startedAt) : null;
      if (!st) return;
      const dur = Number(s.durationSeconds || 0);
      const bpm = Number(s.avgRespiratoryRate || 0);

      if (st >= dayStart) bucket("today", bpm, dur);
      if (st >= weekAgo) bucket("week", bpm, dur);
      if (st >= monthAgo) bucket("month", bpm, dur);
    });

    // finalize averages
    Object.keys(sum).forEach((k) => {
      if (sum[k].count > 0) {
        sum[k].avgBpm = Math.round(
          sum[k].avgBpm / sum[k].count
        );
        sum[k].avgDur = Math.round(
          sum[k].avgDur / sum[k].count
        );
      }
    });

    return sum;
  };

  const summary = computeSummary(sessions);

  const lastSession = useMemo(() => {
    if (!sessions.length) return null;
    if (savedSessionId)
      return (
        sessions.find(
          (s) => s._id === savedSessionId
        ) || sessions[0]
      );
    return sessions[0];
  }, [sessions, savedSessionId]);

  const isConnected =
    sessionInfo.code &&
    (sessionInfo.listeners > 0 ||
      sessionInfo.role === "listener" ||
      sessionInfo.streaming);

  //
  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  //
  return (
    <div
      className="
        layout-content-container flex flex-col max-w-[960px]
        w-full flex-1 overflow-y-auto
        p-6 bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#000] dark:text-slate-200
      "
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-bold dark:text-white">
          Breath Tracking
        </h1>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          ["Today", summary.today],
          ["Last 7 days", summary.week],
          ["Last 30 days", summary.month],
        ].map(([label, data]) => (
          <div
            key={label}
            className="
              bg-white dark:bg-[#1e293b]
              border border-gray-200 dark:border-gray-700
              rounded-xl p-4 shadow-sm
            "
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {data.count} sessions
              </span>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="text-3xl font-bold dark:text-white">
                  {data.count}
                </div>
                <div className="text-xs text-gray-500">
                  sessions
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium">
                  Avg BPM
                </div>
                <div className="text-xl font-semibold">
                  {data.avgBpm}
                </div>
                <div className="text-xs text-gray-500">
                  Avg dur {data.avgDur}s
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LIVE GRAPH */}
      <div
        className="
          bg-white dark:bg-[#1e293b]
          border border-gray-200 dark:border-gray-700
          rounded-xl p-4 shadow-sm mb-6
        "
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">
              Live Breath Graph
            </h2>
            <p className="text-sm text-gray-500">
              Real-time waveform & stats
            </p>
          </div>
        </div>

        <BreathTracker
          active={trackingStarted}
          resetSignal={resetCounter}
          sensitivity={sensitivity}
          shouldSave={saveRequested}
          onSaved={() => setSaveRequested(false)}
          onStop={() => setTrackingStarted(false)}
          onError={(err) => {
            setSensorError(err);
            setTrackingStarted(false);
          }}
          onSample={emitToSocket}
          onSave={async (session) => {
            try {
              setSavingSession(true);
              const res = await axios.post(
                `${API_BASE}/api/breaths`,
                session,
                { withCredentials: true }
              );
              if (res?.data?.id)
                setSavedSessionId(res.data.id);

              await loadSessions();
              notify("Session saved", "success");
            } catch {
              notify("Failed to save", "error");
            } finally {
              setSavingSession(false);
            }
          }}
        />
      </div>

      {/* CONTROLS + SESSION OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Controls */}
        <div
          className="
            bg-white dark:bg-[#1e293b]
            border border-gray-200 dark:border-gray-700
            rounded-xl p-4 shadow-sm
          "
        >
          {hasSensor ? (
            <>
              <button
                className="btn btn-primary w-full mb-3"
                onClick={() => {
                  if (trackingStarted)
                    setTrackingStarted(false);
                  else if (everStarted)
                    setTrackingStarted(true);
                  else setShowStartModal(true);

                  setSavedSessionId(null);
                }}
              >
                {trackingStarted
                  ? "Pause Tracking"
                  : "Start Tracking"}
              </button>

              {trackingStarted && (
                <div className="flex gap-2 mb-3">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setResetCounter((c) => c + 1);
                      setTrackingStarted(false);
                      setEverStarted(false);
                      setSavedSessionId(null);
                    }}
                  >
                    Reset
                  </button>

                  <button
                    className="btn btn-primary flex-1"
                    disabled={savingSession}
                    onClick={() => {
                      setSaveRequested(true);
                      setTrackingStarted(false);
                    }}
                  >
                    {savingSession
                      ? "Saving..."
                      : "Stop & Save"}
                  </button>
                </div>
              )}

              <label className="text-sm text-gray-700 dark:text-gray-300">
                Sensitivity
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={sensitivity}
                onChange={(e) =>
                  setSensitivity(Number(e.target.value))
                }
                className="w-full"
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No motion sensor detected.  
              This device can only **join** sessions.
            </p>
          )}
        </div>

        {/* LIVE SHARING */}
        <div
          className="
            bg-white dark:bg-[#1e293b]
            border border-gray-200 dark:border-gray-700
            rounded-xl p-4 shadow-sm
          "
        >
          <h3 className="text-sm font-medium mb-3">
            Live Sharing
          </h3>

          <div className="flex gap-2 mb-3">
            <button
              className="btn btn-outline flex-1"
              onClick={() => {
                const s = ensureSocket();
                s?.emit("create_session");
              }}
            >
              Create code
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.toUpperCase())
              }
              placeholder="Enter code"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                const code = joinCode.trim().toUpperCase();
                if (!code)
                  return notify("Enter a code", "error");

                setJoining(true);
                const s = ensureSocket();
                s?.emit("join_session", { code });
              }}
            >
              {joining ? "Joining…" : "Join"}
            </button>
          </div>

          {isConnected ? (
            <div className="p-3 bg-slate-50 dark:bg-[#0d1b2a] rounded text-sm">
              <div className="">Code: {sessionInfo.code}</div>
              <div className="text-xs text-gray-500">
                Role: {sessionInfo.role}
              </div>
              <div className="text-xs text-gray-500">
                {sessionInfo.listeners} device(s)
                connected
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No active session
            </div>
          )}
        </div>

        {/* LAST SESSION */}
        <div
          className="
            bg-white dark:bg-[#1e293b]
            border border-gray-200 dark:border-gray-700
            rounded-xl p-4 shadow-sm
          "
        >
          <h3 className="font-semibold mb-3">Last Session</h3>

          {!lastSession ? (
            <p className="text-sm text-gray-500">
              No sessions yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded p-3 bg-gray-50 dark:bg-[#0d1b2a]">
                <div className="text-xs text-gray-500">
                  Duration
                </div>
                <div className="text-xl font-bold">
                  {lastSession.durationSeconds}s
                </div>
              </div>

              <div className="border rounded p-3 bg-gray-50 dark:bg-[#0d1b2a]">
                <div className="text-xs text-gray-500">
                  Avg BPM
                </div>
                <div className="text-xl font-bold">
                  {lastSession.avgRespiratoryRate}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* START MODAL */}
      <BreathStartModal
        open={showStartModal}
        onCancel={() => setShowStartModal(false)}
        onStart={() => {
          setShowStartModal(false);
          setTrackingStarted(true);
          setEverStarted(true);
        }}
      />

      {/* SENSOR ERROR */}
      {sensorError && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-lg max-w-md">
            <h2 className="text-lg font-bold mb-2">
              Sensor Error
            </h2>
            <p className="mb-4">
              {sensorError.message ||
                "Motion sensor unavailable."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setSensorError(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Breaths;
