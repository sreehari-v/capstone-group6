import React from "react";
import { Outlet } from "react-router";
import DashNav from "../components/DashNav/DashNav";

function DashboardLayout() {
  return (
    <div className="h-screen bg-background-light flex">

        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 min-h-0">
          {/* Sidebar nav (DashNav) */}
          <DashNav />

          {/* Main dashboard container */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
            <div className="px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
  );
}

export default DashboardLayout;
