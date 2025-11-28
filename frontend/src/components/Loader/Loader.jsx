import React from 'react';

export default function Loader({ showText = false, animatedText = false, fullScreen = true, size = 64 }) {
  // size in pixels
  const border = Math.max(6, Math.round(size / 8));
  const spinnerStyle = {
    width: size,
    height: size,
    borderWidth: border,
    borderColor: 'rgba(17,147,212,0.12)',
    borderTopColor: '#1193d4',
  };

  const containerClass = fullScreen ? 'min-h-screen flex items-center justify-center' : 'flex items-center justify-center w-full py-12';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div
          role="status"
          aria-live="polite"
          className="inline-block rounded-full animate-spin"
          style={spinnerStyle}
        />
        {showText && (
          <div className="text-sm text-slate-700">
            {animatedText ? (
              <span className="inline-block">Loading<span className="animate-pulse">...</span></span>
            ) : (
              <span>Loading…</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
