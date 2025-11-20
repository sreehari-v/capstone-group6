import React, { useState } from 'react'
import BreathTracker from '../components/BreathTracker/BreathTracker'
import BreathStartModal from '../components/BreathTracker/BreathStartModal'

function Breaths() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [everStarted, setEverStarted] = useState(false);

  return (
    <div className="flex flex-col max-w-[960px] flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d171b] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Breath Tracking
        </p>
      </div>

      {/* Single start/pause button (Reset shown when paused) */}
      <div className="flex justify-stretch px-4 py-3">
        <div className="flex flex-1 gap-3 flex-wrap justify-start items-center">
          <button
            onClick={() => {
              if (trackingStarted) {
                // pause
                setTrackingStarted(false);
              } else if (everStarted) {
                // resume without modal
                setTrackingStarted(true);
              } else {
                // show start modal
                setShowStartModal(true);
              }
            }}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1193d4] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
          >
            {trackingStarted ? 'Pause Tracking' : 'Start Tracking'}
          </button>
          {/* Reset appears when paused and user has previously started */}
          {!trackingStarted && everStarted && (
            <button
              onClick={() => setResetCounter((c) => c + 1)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7eff3] text-[#0d171b] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

  {/* Breath start modal (instructions). When user presses Start in the modal,
      the inline tracker below will become active. */}
  <BreathStartModal
    open={showStartModal}
    onStart={() => { setShowStartModal(false); setTrackingStarted(true); setEverStarted(true); }}
    onCancel={() => setShowStartModal(false)}
  />

  {/* Sensor error modal */}
  {sensorError && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
        <h3 className="text-lg font-bold mb-2">Sensor unavailable</h3>
        <p className="mb-4">{sensorError.message || 'Motion sensor not available or permission denied.'}</p>
        <div className="flex justify-end">
          <button onClick={() => setSensorError(null)} className="px-3 py-2 bg-[#1193d4] text-white rounded">OK</button>
        </div>
      </div>
    </div>
  )}


      {/* Inline BreathTracker (dynamic stats live inside the component) */}
      <div className="px-4 py-6">
        <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
            <div className="w-full">
              <BreathTracker
                active={trackingStarted}
                resetSignal={resetCounter}
                onStop={() => setTrackingStarted(false)}
                onError={(err) => {
                  setSensorError(err);
                  setTrackingStarted(false);
                }}
              />
          </div>
          <div className="flex justify-around">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
              <p key={day} className="text-[#4c809a] text-[13px] font-bold leading-normal tracking-[0.015em]">{day}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Breaths;
