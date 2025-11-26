import React, { useEffect, useState, useCallback } from "react";
import useStepCounter from "../hooks/useStepCounter";
import { getMySteps, saveMySteps } from "../api/stepsApi";

const StepTracking = () => {
  const [initialSteps, setInitialSteps] = useState(0);
  const [initialActive, setInitialActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [distanceKm, setDistanceKm] = useState(0);
  const [kcal, setKcal] = useState(0);
  const [hasWalkStarted, setHasWalkStarted] = useState(false); // 🔹 new

  // hook now accepts initialSteps
  const { steps, active, start, stop } = useStepCounter({ initialSteps });

  // load from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMySteps();
        const loadedSteps = data.steps ?? 0;
        const loadedActive = !!data.isActive;

        setInitialSteps(loadedSteps);
        setInitialActive(loadedActive);
        setHasWalkStarted(loadedSteps > 0 || loadedActive); // 🔹 remember previous walk
      } catch (err) {
        console.error("Failed to load step tracking", err);
      } finally {
        setHydrated(true);
      }
    };

    load();
  }, []);

  // auto-start if backend says it was active
  useEffect(() => {
    if (hydrated && initialActive) {
      start();
    }
  }, [hydrated, initialActive, start]);

  // distance & kcal derived from steps
  useEffect(() => {
    const strideM = 0.78;
    const kcalPerStep = 0.04;
    setDistanceKm((steps * strideM) / 1000);
    setKcal(steps * kcalPerStep);
  }, [steps]);

  const persistSteps = useCallback(
    async (isActiveValue) => {
      try {
        await saveMySteps({ steps, isActive: isActiveValue });
      } catch (err) {
        console.error("Failed to save steps", err);
      }
    },
    [steps]
  );

  const handleStart = async () => {
    setHasWalkStarted(true);                // 🔹 so label becomes "Resume Walk" next time
    await persistSteps(true);
    await start();
  };

  const handlePause = async () => {
    await persistSteps(false);
    stop();
  };

  if (!hydrated) {
    return (
      <main className="relative flex min-h-screen w-full flex-col bg-slate-50">
        <div className="layout-container flex h-full grow flex-col">
          <div className="p-4 text-gray-600">Loading step data…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-slate-50">
      <div
        className="layout-container flex h-full grow flex-col"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72 scroll-mt-28">
                Step Tracking
              </h1>
            </div>

            <h2 className="text-[#0d171b] text-[24px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
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
                  onClick={handleStart}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {hasWalkStarted ? "Resume Walk" : "Start Walk"}
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Pause
                </button>
              )}
              <p className="self-center text-sm text-gray-500">
                iOS requires tapping{" "}
                <b>{hasWalkStarted ? "Resume Walk" : "Start Walk"}</b> to grant
                motion access.
              </p>
            </div>

            <h2 className="text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 scroll-mt-28">
              Distance and Calories
            </h2>

            <div className="flex flex-wrap gap-4 p-4">
              <Card
                label="Distance Covered"
                value={`${distanceKm.toFixed(2)} km`}
              />
              <Card
                label="Calories Burned"
                value={`${kcal.toFixed(0)} kcal`}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
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
