import React from "react";
import DashNav from "../components/DashNav/DashNav";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        bg-[var(--background-light)]
        text-[var(--text-primary)]
        dark:bg-[#000000ff]
        dark:text-slate-200
      "
    >
      {/* Sidebar */}
      <DashNav />

      {/* Main Page */}
      <main
        className="
          flex-1
          overflow-y-auto
          p-6
          bg-[var(--background-light)]
          dark:bg-[#000000ff]
          dark:text-slate-200
          transition-colors
        "
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
