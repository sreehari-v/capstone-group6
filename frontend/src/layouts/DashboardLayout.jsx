// src/layouts/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router";
import DashNav from "../components/DashNav/DashNav";
import MainNavBar from "../components/MainNavBar/MainNavBar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Top fixed main navbar */}
      <MainNavBar />

      {/* Content below navbar */}
      <div className="pt-20 px-4 md:px-8 pb-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Sidebar nav (DashNav) */}
          <DashNav />

          {/* Main dashboard container */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[60vh]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
