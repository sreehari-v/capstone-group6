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
    <div
      className="
        flex flex-col max-w-[960px] w-full flex-1 overflow-y-auto
        p-6
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#0f172a]
        dark:text-slate-200
      "
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <h1 className="tracking-light text-[32px] font-bold leading-tight min-w-72 dark:text-white">
          Step Tracking
        </h1>
      </div>

      <h2 className="text-[24px] font-bold leading-tight tracking-[-0.015em] mb-3 dark:text-white">
        Step Tracking Summary
      </h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <Card label="Daily Steps" value={steps.toLocaleString()} />
        <Card label="Weekly Steps" value="—" />
        <Card label="Monthly Steps" value="—" />
      </div>

      <div className="flex gap-3 mb-6 items-center">
        {!active ? (
          <button
            onClick={start}
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-blue-600 text-white
              hover:bg-blue-700
              dark:bg-blue-700 dark:hover:bg-blue-800
            "
          >
            Start Walk
          </button>
        ) : (
          <button
            onClick={stop}
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-gray-200 text-gray-800
              hover:bg-gray-300
              dark:bg-[#1e293b] dark:text-slate-200
              dark:border dark:border-gray-600 dark:hover:bg-[#273549]
            "
          >
            Pause
          </button>
        )}
        <p className="self-center text-sm text-gray-500 dark:text-slate-400">
          iOS requires tapping <b>Start Walk</b> to grant motion access.
        </p>
      </div>

      <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3 dark:text-white">
        Distance and Calories
      </h2>

      <div className="flex flex-wrap gap-4">
        <Card
          label="Distance Covered"
          value={`${distanceKm.toFixed(2)} km`}
        />
        <Card label="Calories Burned" value={`${kcal.toFixed(0)} kcal`} />
      </div>
    </div>
  );
};

const Card = ({ label, value }) => (
  <div
    className="
      flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6
      border border-[#cfdfe7]
      bg-white
      dark:bg-[#1e293b] dark:border-gray-600
    "
  >
    <p className="text-base font-medium leading-normal text-[#0d171b] dark:text-slate-200">
      {label}
    </p>
    <p className="tracking-light text-2xl font-bold leading-tight text-[#0d171b] dark:text-white">
      {value}
    </p>
  </div>
);

export default StepTracking;
