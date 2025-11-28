import React, { useEffect, useState } from "react";
import useStepCounter from "../hooks/useStepCounter";

const StepTracking = () => {
  const { steps, active, start, stop } = useStepCounter({});
  const [distanceKm, setDistanceKm] = useState(0);
  const [kcal, setKcal] = useState(0);

  useEffect(() => {
    const strideM = 0.78;
    const kcalPerStep = 0.04;
    setDistanceKm((steps * strideM) / 1000);
    setKcal(steps * kcalPerStep);
  }, [steps]);

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      <div className="flex items-start md:items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">Step Tracking</h1>
      </div>

      <div className="section-card mb-4">
        <h2 className="section-title">Step Tracking Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl shadow min-w-0">
            <div className="text-sm text-gray-500">Daily Steps</div>
            <div className="text-3xl font-bold mt-1">{steps.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow min-w-0">
            <div className="text-sm text-gray-500">Weekly Steps</div>
            <div className="text-3xl font-bold mt-1">—</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow min-w-0">
            <div className="text-sm text-gray-500">Monthly Steps</div>
            <div className="text-3xl font-bold mt-1">—</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {!active ? (
            <button onClick={start} className="btn bg-[var(--primary-color)] text-white">Start Walk</button>
          ) : (
            <button onClick={stop} className="btn bg-slate-200 text-slate-800">Pause</button>
          )}
          <p className="text-sm text-gray-600">iOS requires tapping <b>Start Walk</b> to grant motion access.</p>
        </div>
      </div>

      <div className="section-card">
        <h2 className="section-title">Distance and Calories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow min-w-0">
            <div className="text-sm text-gray-500">Distance Covered</div>
            <div className="text-2xl font-bold mt-1">{distanceKm.toFixed(2)} km</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow min-w-0">
            <div className="text-sm text-gray-500">Calories Burned</div>
            <div className="text-2xl font-bold mt-1">{kcal.toFixed(0)} kcal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ label, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
    <p className="text-[#0d171b] text-base font-medium leading-normal">{label}</p>
    <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">{value}</p>
  </div>
);

export default StepTracking;
