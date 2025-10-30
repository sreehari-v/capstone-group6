import React from "react";
import { Outlet } from "react-router";

function DashboardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default DashboardLayout;
