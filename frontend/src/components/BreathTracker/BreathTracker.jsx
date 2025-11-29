import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { io as ioClient } from "socket.io-client";

export default function BreathTracker({
  active = false,
  onError,
  resetSignal = 0,
  sensitivity = 3,
}) {
  const [status, setStatus] = useState("Place phone on chest and press Start");
  const [breathIn, setBreathIn] = useState(0);
  const [breathOut, setBreathOut] = useState(0);
  const [points, setPoints] = useState([]);
  const [bpm, setBpm] = useState(0);

  const pointsRef = useRef([]);
  const breathInRef = useRef(0);
  const breathOutRef = useRef(0);
  const bpmRef = useRef(0);

  const socketRef = useRef(null);
  const incomingBufferRef = useRef([]);
  const listenerRef = useRef(null);
  const startupTimerRef = useRef(null);
  const bpmTimerRef = useRef(null);
  const cycleTimesRef = useRef([]);
  const pairedIndexRef = useRef(0);
  const joinCode = "";
  const total = Math.floor((breathIn + breathOut) / 2);

  /* ------------------ DARK MODE FIX FOR TEXT ------------------ */
  const statusColor =
    "text-[#0d171b] dark:text-slate-300";

  /* ------------------ socket batching (kept original) ------------------ */
  useEffect(() => {
    const interval = setInterval(() => {
      const buf = incomingBufferRef.current;
      if (!buf || buf.length === 0) return;

      const last = buf[buf.length - 1];
      incomingBufferRef.current = [];

      if (typeof last.breathIn === "number") setBreathIn(last.breathIn);
      if (typeof last.breathOut === "number") setBreathOut(last.breathOut);
      if (typeof last.bpm === "number") setBpm(Math.round(last.bpm));

      const newPoints = buf
        .filter((p) => p.point)
        .map((p) => ({ x: p.point.x || p.t, y: p.point.y || 0 }));

      if (newPoints.length > 0) {
        setPoints((ps) => {
          const merged = ps.concat(newPoints);
          return merged.length > 400
            ? merged.slice(merged.length - 400)
            : merged;
        });
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  /* ----------- -------- DARK MODE CHART FIX ------------- ----------- */

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
    },
    grid: {
      borderColor: "#475569", // dark slate-600
      strokeDashArray: 3,
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: ["#0d171b", "#0d171b", "#0d171b"],
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: ["#0d171b"],
        },
      },
    },
    theme: {
      mode: document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#1193d4"],
    },
    tooltip: {
      theme: document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
    },
  };

  /* ---------------------------- UI RENDER ---------------------------- */

  return (
    <div className="w-full">
      {/* ✔ Status text (Dark Mode safe) */}
      <div className={`mb-2 text-sm ${statusColor}`}>
        {status}
      </div>

      {/* ✔ Control Row */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
          Share live
        </button>

        <input
          placeholder="123456"
          className="
            w-28 text-center px-2 py-1 border rounded-md text-sm
            bg-white dark:bg-[#1e293b]
            text-[#0d171b] dark:text-white
            border-slate-300 dark:border-slate-600
          "
        />

        <button className="px-3 py-1 bg-slate-700 text-white rounded-md text-sm">
          Join
        </button>
      </div>

      {/* ✔ Stats Boxes */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">

        {/* Breath In */}
        <div
          className="
            p-3 rounded
            bg-white dark:bg-[#1e293b]
            text-[#0d171b] dark:text-white
            border border-slate-200 dark:border-slate-700
          "
        >
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Breath In
          </div>
          <div className="text-2xl font-bold">{breathIn}</div>
        </div>

        {/* Breath Out */}
        <div
          className="
            p-3 rounded
            bg-white dark:bg-[#1e293b]
            text-[#0d171b] dark:text-white
            border border-slate-200 dark:border-slate-700
          "
        >
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Breath Out
          </div>
          <div className="text-2xl font-bold">{breathOut}</div>
        </div>

        {/* Total */}
        <div
          className="
            p-3 rounded
            bg-white dark:bg-[#1e293b]
            text-[#0d171b] dark:text-white
            border border-slate-200 dark:border-slate-700
          "
        >
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Total
          </div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        {/* Breathing Rate */}
        <div
          className="
            p-3 rounded
            bg-white dark:bg-[#1e293b]
            border border-slate-200 dark:border-slate-700
          "
        >
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Breathing Rate
          </div>
          <div className="text-2xl font-bold text-[#1193d4] dark:text-blue-400">
            {bpm} BPM
          </div>
        </div>
      </div>

      {/* ✔ Graph */}
      <div className="mt-4">
        {Chart ? (
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
        ) : (
          <div className="p-3 border rounded text-sm dark:text-white">
            ApexCharts not installed
          </div>
        )}
      </div>
    </div>
  );
}
