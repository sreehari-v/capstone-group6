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
    <main className="relative flex min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden pt-24 md:pt-28">
      <div className="layout-container flex h-full grow flex-col" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="w-80 min-h-[700px]" />
            </div>
          </div>

          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72 scroll-mt-28">
                Step Tracking
              </h1>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Step Tracking Summary
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <Card label="Daily Steps" value={steps.toLocaleString()} />
              <Card label="Weekly Steps" value="—" />
              <Card label="Monthly Steps" value="—" />
            </div>

            <div className="px-4 pb-5 flex gap-3">
              {!active ? (
                <button onClick={start} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Start Walk
                </button>
              ) : (
                <button onClick={stop} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">
                  Pause
                </button>
              )}
              <p className="self-center text-sm text-gray-500">
                iOS requires tapping <b>Start Walk</b> to grant motion access.
              </p>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Distance and Calories
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <Card label="Distance Covered" value={`${distanceKm.toFixed(2)} km`} />
              <Card label="Calories Burned" value={`${kcal.toFixed(0)} kcal`} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const Card = ({ label, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#cfdfe7]">
    <p className="text-[#0d171b] text-base font-medium leading-normal">{label}</p>
    <p className="text-[#0d171b] tracking-light text-2xl font-bold leading-tight">{value}</p>
  </div>
);

export default StepTracking;
