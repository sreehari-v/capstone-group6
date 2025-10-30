import { Outlet } from "react-router";
import DashNav from "../components/DashNav/DashNav";

function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <DashNav />
      <div style={{ flexGrow: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
