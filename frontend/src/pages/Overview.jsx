import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Overview = () => {
  const [medicines, setMedicines] = useState([]);
  const [stepsToday] = useState(4200);
  const goal = 10000;

  const [breathLast] = useState({ bpm: 16, min: 11, max: 22 });

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

  const medsToday = useMemo(() => {
    return medicines
      .slice()
      .sort((a, b) => ((a.time || "") > (b.time || "") ? 1 : -1))
      .slice(0, 10);
  }, [medicines]);

  const stepsProgress = Math.round((stepsToday / goal) * 100);
  const weekly = [4200, 5600, 7000, 8000, 9500, 4000, stepsToday];

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

  return (
    <div
      className="
        layout-content-container flex flex-col w-full flex-1 overflow-y-auto
        p-6
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#0f172a]
        dark:text-slate-200
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Overview</h1>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/dashboard/steps"
            className="
              px-4 py-2 rounded shadow text-sm
              bg-slate-100 hover:bg-slate-200
              text-[var(--text-primary)]
              dark:bg-[#1e293b] dark:hover:bg-[#273549]
              dark:text-slate-200
            "
          >
            Start Walk
          </Link>
          <Link
            to="/dashboard/breath"
            className="
              px-4 py-2 rounded shadow text-sm
              bg-slate-100 hover:bg-slate-200
              text-[var(--text-primary)]
              dark:bg-[#1e293b] dark:hover:bg-[#273549]
              dark:text-slate-200
            "
          >
            Start Breath Tracking
          </Link>
          <Link
            to="/dashboard/medication"
            className="
              px-4 py-2 rounded shadow text-sm
              bg-slate-100 hover:bg-slate-200
              text-[var(--text-primary)]
              dark:bg-[#1e293b] dark:hover:bg-[#273549]
              dark:text-slate-200
            "
          >
            Add Medicine
          </Link>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Steps */}
        <div className="p-4 bg-white rounded-xl shadow border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Steps Today
          </div>
          <div className="text-3xl font-bold mt-1 dark:text-white">
            {stepsToday.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {stepsProgress}% of {goal.toLocaleString()}
          </div>
        </div>

        {/* Breathing */}
        <div className="p-4 bg-white rounded-xl shadow border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Breathing
          </div>
          <div className="text-3xl font-bold mt-1 dark:text-white">
            {breathLast.bpm} BPM
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            {breathLast.bpm >= 12 && breathLast.bpm <= 20
              ? "Normal"
              : breathLast.bpm < 12
              ? "Low"
              : "Elevated"}
          </div>
          <Link
            to="/dashboard/breath"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 block"
          >
            View Details
          </Link>
        </div>

        {/* Medicine Summary */}
        <div className="p-4 bg-white rounded-xl shadow border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Medicines Today
          </div>
          <div className="text-3xl font-bold mt-1 dark:text-white">
            {medicinesSummary.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            M ({medicinesSummary.counts.Morning}) • A (
            {medicinesSummary.counts.Afternoon}) • N (
            {medicinesSummary.counts.Night})
          </div>
        </div>

        {/* Active Session */}
        <div className="p-4 bg-white rounded-xl shadow border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Active Session
          </div>
          <div className="text-xl font-bold mt-1 dark:text-white">
            Mobile connected
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Viewer Code: {localStorage.getItem("sessionCode") || "—"}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300">
            1 device listening
          </div>
        </div>
      </div>

      {/* DAILY HEALTH SCORE */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
        <h3 className="font-semibold text-lg mb-4 dark:text-white">
          Daily Health Score
        </h3>

        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Score Text */}
          <div>
            <div className="text-5xl font-bold dark:text-white">{score}</div>
            <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              Healthy routine maintained.
            </div>
          </div>

          {/* Circle */}
          <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-100 to-sky-200 dark:from-sky-700/40 dark:to-sky-500/40 shadow-md">
            <div className="text-4xl font-extrabold dark:text-white">
              {score}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Weekly Steps */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-2 border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <h3 className="font-semibold text-lg mb-3 dark:text-white">
            Weekly Steps
          </h3>

          <div className="flex items-end gap-3 h-36">
            {weekly.map((val, i) => {
              const h = Math.max(10, Math.round((val / goal) * 100));
              return (
                <div key={i} className="flex-1 text-center">
                  <div
                    className="w-6 mx-auto bg-sky-500 rounded-sm"
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="text-xs mt-1 text-gray-600 dark:text-slate-300">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Medicines */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-1 border border-gray-200 dark:bg-[#1e293b] dark:border-gray-600">
          <h3 className="font-semibold text-lg mb-3 dark:text-white">
            Upcoming Medicines
          </h3>

          {medsToday.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-slate-400">
              No medicines today.
            </div>
          )}

          {medsToday.map((m) => (
            <div
              key={m._id}
              className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="font-medium dark:text-white">{m.name}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {m.dosage} • {m.beforeFood ? "Before" : "After"} food
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-200">
                {m.time || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
