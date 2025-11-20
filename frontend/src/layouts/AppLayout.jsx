// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router"; // or "react-router-dom" if you prefer
import MainNavBar from "../components/MainNavBar/MainNavBar";
import MainFooter from "../components/MainFooter/MainFooter";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Top navbar */}
      <MainNavBar />

      {/* Page content under fixed navbar */}
      <main className="pt-20 px-4 md:px-8 pb-8">
        <Outlet />
      </main>
      {/* Footer */}
      <MainFooter />
    </div>
  );
};

export default AppLayout;
