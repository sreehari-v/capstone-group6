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
        <div>
          <div
            className="
        layout-content-container flex flex-col max-w-[960px] flex-1
        bg-[var(--background-light)] 
        dark:bg-[#000000ff]
        text-[var(--text-primary)]
        dark:text-slate-200
      "
          >
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1
                className="tracking-light text-[32px] font-bold 
               text-[#0d171b] dark:text-white"
              >
                Step Tracking
              </h1>
            </div>

            <h2
              className="text-[24px] font-bold 
               text-[#0d171b] dark:text-white"
            >
              Step Tracking Summary
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <Card label="Daily Steps" value={steps.toLocaleString()} />
              <Card label="Weekly Steps" value="—" />
              <Card label="Monthly Steps" value="—" />
            </div>

            <div className="px-4 pb-5 flex gap-3">
              {!active ? (
                <button
                  onClick={start}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Start Walk
                </button>
              ) : (
                <button
                  onClick={stop}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Pause
                </button>
              )}
              <p
                className="self-center text-sm 
               text-gray-600 dark:text-slate-300"
              >
                iOS requires tapping <b className="font-semibold">Start Walk</b>{" "}
                to grant motion access.
              </p>
            </div>

            <h2
              className="text-[22px] font-bold 
               text-[#0d171b] dark:text-white"
            >
              Distance and Calories
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <Card
                label="Distance Covered"
                value={`${distanceKm.toFixed(2)} km`}
              />
              <Card label="Calories Burned" value={`${kcal.toFixed(0)} kcal`} />
            </div>
          </div>
        </div>
      </div>
    </main>
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
    <p
      className="text-base font-medium leading-normal 
             text-[#0d171b] dark:text-white"
    >
      {label}
    </p>
    <p
      className="tracking-light text-2xl font-bold 
             text-[#0d171b] dark:text-white"
    >
      {value}
    </p>
  </div>
);

export default StepTracking;
