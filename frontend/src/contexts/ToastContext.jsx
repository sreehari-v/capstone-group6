import React, { createContext, useCallback, useEffect, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map(t =>
      setTimeout(() => {
        setToasts(curr => curr.filter(x => x.id !== t.id));
      }, t.duration || 4000)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, [toasts]);

  const showToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(curr => [{ id, message, type, duration }, ...curr]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(curr => curr.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-2 rounded shadow-md text-sm text-white ${t.type === TOAST_TYPES.SUCCESS ? 'bg-emerald-500' : t.type === TOAST_TYPES.ERROR ? 'bg-red-500' : 'bg-sky-500'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
