import React, { useState } from "react";
import "./DashNav.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DashNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || "—";
  const displayGender = user?.gender
    ? user.gender === "prefer_not_to_say"
      ? "Prefer not to say"
      : user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
    : "—";

  const genderToColor = (g) => {
    if (!g) return "7a7a7a";
    if (g === "male") return "3b82f6";
    if (g === "female") return "ec4899";
    if (g === "prefer_not_to_say") return "6b7280";
    return "10b981";
  };

  const getDefaultAvatar = (gender, name) => {
    const bg = genderToColor(gender);
    const nm = name?.trim() ? name : "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nm
    )}&background=${bg}&color=ffffff&size=128`;
  };

  const avatarUrl = user?.avatar || getDefaultAvatar(user?.gender, user?.name);

  return (
    <aside
      className={`w-full md:w-80 md:h-screen overflow-y-auto p-4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-200 bg-transparent md:bg-slate-50`}
    >
      {/* DESKTOP USER INFO */}
      <div className="hidden md:flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0 cursor-pointer"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        />
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[#0d171b] text-base font-medium truncate max-w-[10rem]">
            {displayName}
          </h1>
          <p className="text-[#4c809a] text-sm truncate max-w-[10rem]">
            {displayGender}
          </p>
        </div>
      </div>

      {/* DESKTOP NAV */}
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

      {/* MOBILE HEADER */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10 cursor-pointer"
            style={{ backgroundImage: `url("${avatarUrl}")` }}
          />
          <MobileMenuToggle />
        </div>
      </div>

      {/* DESKTOP LOGOUT */}
      <div className="mt-auto hidden md:flex">
        <LogoutButton />
      </div>

      {/* MOBILE MENU OVERLAY */}
      <MobileOverlay
        avatarUrl={avatarUrl}
        displayName={displayName}
        displayGender={displayGender}
      />
    </aside>
  );
};

/* ------------------------------- MOBILE TOGGLE ------------------------------- */

const MobileMenuToggle = () => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const ev = new CustomEvent("dashnav-toggle", {
      detail: { open: !open },
    });
    window.dispatchEvent(ev);
    setOpen(!open);
  };

  React.useEffect(() => {
    const handler = (e) => setOpen(Boolean(e.detail?.open));
    window.addEventListener("dashnav-toggle", handler);
    return () => window.removeEventListener("dashnav-toggle", handler);
  }, []);

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-md bg-white/10 hover:bg-white/20 dash-menu-toggle ${
        open ? "open" : ""
      }`}
      aria-label="Toggle menu"
    >
      <div className={`hamburger ${open ? "open" : ""}`}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  );
};

/* ------------------------------- MOBILE OVERLAY ------------------------------ */

const MobileOverlay = ({ avatarUrl, displayName, displayGender }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handler = (e) => setIsOpen(Boolean(e.detail?.open));
    window.addEventListener("dashnav-toggle", handler);
    return () => window.removeEventListener("dashnav-toggle", handler);
  }, []);

  const close = () => {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("dashnav-toggle", { detail: { open: false } })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden dash-overlay">
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative z-50 w-full h-full flex flex-col bg-[rgba(2,6,23,0.84)] text-white backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 pt-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                close();
                navigate("/dashboard/settings");
              }}
              className="w-12 h-12 rounded-full bg-center bg-cover"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
            <div>
              <div className="text-lg font-semibold">{displayName}</div>
              <div className="text-sm text-white/70">{displayGender}</div>
            </div>
          </div>

          <button onClick={close} className="p-2 rounded-md bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="mt-10 px-6 flex-1 overflow-auto">
          <MobileNav close={close} />
        </nav>

        <div className="px-6 pb-10">
          <LogoutMobileButton />
        </div>
      </div>
    </div>
  );
};

/* ---------------------------- MOBILE NAV LINKS ---------------------------- */

const MobileNav = ({ close }) => (
  <ul className="flex flex-col gap-4">
    <MobileNavItem to="/dashboard" icon="home" label="Overview" close={close} />
    <MobileNavItem
      to="/dashboard/medication"
      icon="medication"
      label="Medication"
      close={close}
    />
    <MobileNavItem
      to="/dashboard/steps"
      icon="directions_walk"
      label="Steps"
      close={close}
    />
    <MobileNavItem
      to="/dashboard/breath"
      icon="air"
      label="Breath"
      close={close}
    />
    <MobileNavItem
      to="/dashboard/settings"
      icon="settings"
      label="Settings"
      close={close}
    />
  </ul>
);

const MobileNavItem = ({ to, icon, label, close }) => (
  <li>
    <NavLink
      to={to}
      onClick={close}
      className={({ isActive }) =>
        `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${
          isActive
            ? "text-[var(--primary-color)]"
            : "text-white/90 hover:bg-white/10"
        }`
      }
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      {label}
    </NavLink>
  </li>
);

/* -------------------------------- COMPONENTS -------------------------------- */

const NavItem = ({ label, iconClass, to, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg ${
        isActive
          ? "bg-[#e7eff3] text-[#0d171b]"
          : "text-[#0d171b] hover:bg-slate-100"
      }`
    }
  >
    <i className={`${iconClass} text-sm`}></i>
    <p className="font-medium">{label}</p>
  </NavLink>
);

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    await logout().catch(() => {});
    navigate("/login");
  };

  return (
    <button
      onClick={handle}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium"
    >
      <i className="fas fa-sign-out-alt"></i>
      Logout
    </button>
  );
};

const LogoutMobileButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    await logout().catch(() => {});
    navigate("/login");
  };

  return (
    <button
      className="flex flex-col items-center text-white/90"
      onClick={handle}
    >
      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
        <i className="fas fa-sign-out-alt text-sm"></i>
      </div>
      <span className="text-xs mt-1">Logout</span>
    </button>
  );
};

export default DashNav;
