import React from "react";

function DashBoard() {
  return (
    <div
      className="
        flex-1 p-6
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#0f172a]
        dark:text-slate-200
        min-h-screen
      "
    >
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="
        card p-6 rounded-lg mt-4
        bg-[var(--background-light)]
        dark:bg-[#1e293b]
        dark:border-slate-700
        dark:text-white
      ">
        Your dashboard content goes here...
      </div>
    </div>
  );
}

export default DashBoard;
