import React from "react";
import { Outlet } from "react-router"; // or "react-router-dom" if you prefer
import MainNavBar from "../components/MainNavBar/MainNavBar";
import MainFooter from "../components/MainFooter/MainFooter";

const AppLayout = () => {
  return (
    // Make layout a column flex so <main> can grow and push the footer to the bottom
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Top navbar */}
      <MainNavBar />

      {/* Page content under fixed navbar; flex-1 lets the main area grow so the footer sits at the bottom */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer */}
      <MainFooter />
    </div>
  );
};

export default AppLayout;
