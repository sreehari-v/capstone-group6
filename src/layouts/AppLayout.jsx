import React from "react";
import MainNavBar from "../components/MainNavBar/MainNavBar";
import MainFooter from "../components/MainFooter/MainFooter";
import { Outlet } from "react-router";

function AppLayout() {
  return (
    <>
      <MainNavBar />
      <Outlet />
      <MainFooter />
    </>
  );
}

export default AppLayout;
