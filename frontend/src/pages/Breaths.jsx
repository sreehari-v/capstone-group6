import React, { useState } from 'react'
import BreathTracker from '../components/BreathTracker/BreathTracker'
import BreathStartModal from '../components/BreathTracker/BreathStartModal'

function Breaths() {
  const [showStartModal, setShowStartModal] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [sensorError, setSensorError] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [everStarted, setEverStarted] = useState(false);
  const [sensitivity, setSensitivity] = useState(3);

  return (
    <div className="layout-content-container flex flex-col w-full flex-1 overflow-y-auto p-4">
      <div className="flex items-start md:items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">Breath Tracking</h1>
      </div>

      <div className="section-card mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <button
                onClick={() => {
                  if (trackingStarted) setTrackingStarted(false);
                  else if (everStarted) setTrackingStarted(true);
                  else setShowStartModal(true);
                }}
                className="btn btn-primary"
              >
                {trackingStarted ? 'Pause Tracking' : 'Start Tracking'}
              </button>
            </div>

            {!trackingStarted && everStarted && (
              <button onClick={() => { setResetCounter((c) => c + 1); setEverStarted(false); setTrackingStarted(false); }} className="btn btn-outline">Reset</button>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sensitivity</label>
              <input type="range" min={1} max={5} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} className="w-36" style={{ accentColor: '#1193d4', background: '#e7eff3', height: 6, borderRadius: 6 }} />
            </div>
          </div>

          <p className="text-sm text-gray-600 md:ml-auto">iOS requires tapping <b>Start Walk</b> to grant motion access.</p>
        </div>
      </div>

      <BreathStartModal open={showStartModal} onStart={() => { setShowStartModal(false); setTrackingStarted(true); setEverStarted(true); }} onCancel={() => setShowStartModal(false)} />

      {sensorError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-bold mb-2">Sensor unavailable</h3>
            <p className="mb-4">{sensorError.message || 'Motion sensor not available or permission denied.'}</p>
            <div className="flex justify-end">
              <button onClick={() => setSensorError(null)} className="btn btn-primary">OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="w-full">
          <BreathTracker active={trackingStarted} resetSignal={resetCounter} sensitivity={sensitivity} onStop={() => setTrackingStarted(false)} onError={(err) => { setSensorError(err); setTrackingStarted(false); }} />
        </div>
      </div>
    </div>
  );
}

export default Breaths;
