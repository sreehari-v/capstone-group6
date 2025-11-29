import React, { useState } from "react";
import BreathTracker from "../components/BreathTracker/BreathTracker";
import BreathStartModal from "../components/BreathTracker/BreathStartModal";

function Breaths() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [everStarted, setEverStarted] = useState(false);
  const [sensitivity, setSensitivity] = useState(3);

  return (
    <div
      className="
        flex flex-col max-w-[960px] w-full flex-1 overflow-y-auto
        p-6
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#000000ff]
        dark:text-slate-200
      "
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <p className="tracking-light text-[32px] font-bold leading-tight min-w-72 dark:text-white">
          Breath Tracking
        </p>
      </div>

      {/* Start / Pause / Reset Buttons */}
      <div className="flex justify-stretch px-4 py-3">
        <div className="flex flex-1 gap-3 flex-wrap items-center">
          <button
            onClick={() => {
              if (trackingStarted) {
                setTrackingStarted(false); // pause
              } else if (everStarted) {
                setTrackingStarted(true); // resume
              } else {
                setShowStartModal(true); // first time → modal
              }
            }}
            className="
              flex min-w-[84px] max-w-[480px] cursor-pointer 
              items-center justify-center rounded-lg h-10 px-4 
              bg-[#1193d4] text-slate-50 text-sm font-bold
            "
          >
            {trackingStarted ? "Pause Tracking" : "Start Tracking"}
          </button>

          {/* Reset if paused & started before */}
          {!trackingStarted && everStarted && (
            <button
              onClick={() => {
                setResetCounter((c) => c + 1);
                setEverStarted(false);
                setTrackingStarted(false);
              }}
              className="
                flex min-w-[84px] max-w-[480px] cursor-pointer 
                items-center justify-center rounded-lg h-10 px-4 
                bg-[#e7eff3] text-[#0d171b] text-sm font-bold
              "
            >
              Reset
            </button>
          )}

          {/* Sensitivity Slider */}
          <div className="flex items-center gap-2 ml-2">
            <label className="text-sm text-gray-600">Sensitivity</label>

            <input
              type="range"
              min={1}
              max={5}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-36"
              style={{
                accentColor: "#1193d4",
                background: "#e7eff3",
                height: 6,
                borderRadius: 6,
              }}
            />
          </div>

          <p className="text-sm text-gray-600 md:ml-auto">
            iOS requires tapping <b>Start Walk</b> to grant motion access.
          </p>
        </div>
      </div>

      {/* Start Modal */}
      <BreathStartModal
        open={showStartModal}
        onStart={() => {
          setShowStartModal(false);
          setTrackingStarted(true);
          setEverStarted(true);
        }}
        onCancel={() => setShowStartModal(false)}
      />

      {/* Sensor Error */}
      {sensorError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-bold mb-2">Sensor unavailable</h3>
            <p className="mb-4">
              {sensorError.message ||
                "Motion sensor not available or permission denied."}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSensorError(null)}
                className="px-3 py-2 bg-[#1193d4] text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breath Tracker */}
      <div className="px-4 py-6">
        <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
          <div className="w-full">
            <BreathTracker
              active={trackingStarted}
              resetSignal={resetCounter}
              sensitivity={sensitivity}
              onStop={() => setTrackingStarted(false)}
              onError={(err) => {
                setSensorError(err);
                setTrackingStarted(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Breaths;
