import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DashNav = () => {
  return (
    <aside
      className="
        bg-slate-50 p-4
        w-full md:w-80
        md:h-screen
        overflow-y-auto
        border-b md:border-b-0 md:border-r border-slate-200
        flex flex-col gap-4
      "
    >
      {/* User info */}
      <div className="flex items-center gap-3">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
          style={{
            backgroundImage:
              'url("https://cdn1.iconfinder.com/data/icons/user-pictures/101/malecostume-512.png")',
          }}
        ></div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[#0d171b] text-base font-medium">ANK Zaman</h1>
          <p className="text-[#4c809a] text-sm font-normal">Male</p>
        </div>
      </div>

      {/* MAIN NAV */}
      {/* Desktop: vertical list */}
      <div className="hidden md:flex flex-col gap-2">
        <NavItem label="Overview" iconClass="fas fa-home" to="/dashboard" end />
        <NavItem
          label="Medication"
          iconClass="fas fa-pills"
          to="/dashboard/medication"
        />
        <NavItem
          label="Step Tracking"
          iconClass="fas fa-shoe-prints"
          to="/dashboard/steps"
        />
        <NavItem
          label="Breath Tracking"
          iconClass="fas fa-lungs"
          to="/dashboard/breath"
        />
        <NavItem
          label="Settings"
          iconClass="fas fa-cog"
          to="/dashboard/settings"
        />
      </div>

      {/* Mobile: horizontal scroll bar */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2">
          <NavItem
            label="Overview"
            iconClass="fas fa-home"
            to="/dashboard"
            end
            compact
          />
          <NavItem
            label="Medication"
            iconClass="fas fa-pills"
            to="/dashboard/medication"
            compact
          />
          <NavItem
            label="Steps"
            iconClass="fas fa-shoe-prints"
            to="/dashboard/steps"
            compact
          />
          <NavItem
            label="Breath"
            iconClass="fas fa-lungs"
            to="/dashboard/breath"
            compact
          />
          <NavItem
            label="Settings"
            iconClass="fas fa-cog"
            to="/dashboard/settings"
            compact
          />
        </div>
      </div>

      {/* FOOTER: Logout */}
      <div className="mt-auto hidden md:flex flex-col gap-2">
        <LogoutButton />
      </div>

      {/* Mobile: below main nav row */}
      <div className="md:hidden flex gap-2 flex-wrap pt-2 border-t border-slate-200 mt-2">
        <div className="w-full">
          <LogoutButton compact />
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ label, iconClass, to, end, compact }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        flex items-center gap-2
        px-3 py-2 rounded-lg cursor-pointer
        whitespace-nowrap
        ${compact ? "text-xs" : "text-sm"}
        ${
          isActive
            ? "bg-[#e7eff3] text-[#0d171b]"
            : "text-[#0d171b] hover:bg-slate-100"
        }
      `
      }
    >
      <i className={`${iconClass} text-[#0d171b] text-sm`}></i>
      <p className="font-medium">{label}</p>
    </NavLink>
  );
};

const LogoutButton = ({ compact }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={
        `w-full flex items-center justify-center gap-3 py-2 px-3 rounded-md transition-colors ` +
        (compact
          ? "bg-red-600 text-white text-sm"
          : "bg-red-600 hover:bg-red-700 text-white font-medium")
      }
      aria-label="Logout"
    >
      <i className="fas fa-sign-out-alt"></i>
      {!compact && <span>Logout</span>}
    </button>
  );
};

export default DashNav;
