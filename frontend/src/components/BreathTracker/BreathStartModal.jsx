import React from "react";

export default function BreathStartModal({ open, onStart, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-[92%] max-w-md p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Place phone on your chest</h3>
          <button onClick={onCancel} className="text-sm text-gray-500">Close</button>
        </div>

        <div className="mt-3">
          <p className="text-sm text-gray-600">Place your phone flat on your chest with the screen facing up. Keep still except for breathing.</p>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={onStart} className="px-4 py-2 bg-primary text-white rounded">Start</button>
        </div>
      </div>
    </div>
  );
}
