import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDarkMode } from "../../hooks/useDarkMode";

const DashNav = () => {
  return (
    <aside
      className="
    p-4
    w-full md:w-80
    md:h-screen
    overflow-y-auto
    border-b md:border-b-0 md:border-r
    flex flex-col gap-4
    bg-[var(--background-light)]
    border-slate-200
    dark:bg-[#1e293b]
    dark:border-slate-700
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
          <h1 className="text-[var(--text-primary)] dark:text-white text-base font-medium">ANK Zaman</h1>
          <p className="text-[var(--text-secondary)] dark:text-slate-300 text-sm font-normal">Male</p>
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
      {/* <div className="mt-auto hidden md:flex flex-col gap-2">
        <LogoutButton />
      </div> */}

      {/* Mobile: below main nav row */}
      {/* <div className="md:hidden flex gap-2 flex-wrap pt-2 border-t border-slate-200 mt-2">
        <div className="w-full">
          <LogoutButton compact />
        </div>
      </div> */}

      {/* FOOTER SECTION */}
      <div className="mt-auto hidden md:flex flex-col gap-3">
        {/* 🌙 NEW DARK MODE BUTTON */}
        <DarkModeButton />

        {/* Logout button */}
        <LogoutButton />
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden flex gap-3 flex-wrap pt-2 border-t border-slate-200 mt-2">
        <DarkModeButton compact />
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
            ? "bg-slate-200 text-[var(--text-primary)] dark:bg-slate-700 dark:text-white"
            : "text-[var(--text-primary)] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
      `w-full flex items-center justify-center gap-3 py-2 px-3 rounded-md transition-colors 
      ${compact 
        ? "text-sm bg-red-600 text-white" 
        : "font-medium bg-red-600 text-white hover:bg-red-700"}
        dark:bg-red-700 dark:hover:bg-red-800`
      }
      aria-label="Logout"
    >
      <i className="fas fa-sign-out-alt"></i>
      {!compact && <span>Logout</span>}
    </button>
  );
};

const DarkModeButton = ({ compact }) => {
  const { dark, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        w-full flex items-center justify-center gap-3 py-2 px-3 rounded-md 
        border transition-colors 
        ${compact ? "text-xs" : "text-sm font-medium"}
        bg-[var(--background-light)] text-[var(--text-primary)]
        dark:bg-[#334155] dark:text-white dark:border-slate-600
      `}
    >
      <i className={`fas ${dark ? "fa-sun" : "fa-moon"}`}></i>
      {!compact && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );
};

export default DashNav;
