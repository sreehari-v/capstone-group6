import React, { useState } from "react";
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
    if (!g) return "7a7a7a"; // neutral gray
    if (g === "male") return "3b82f6"; // blue
    if (g === "female") return "ec4899"; // pink
    if (g === "prefer_not_to_say") return "6b7280"; // gray
    return "10b981"; // green for other
  };

  const getDefaultAvatar = (gender, name) => {
    const bg = genderToColor(gender);
    const nm = name && name.trim() ? name : "User";
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=${bg}&color=ffffff&size=128`;
    return url;
  };

  const avatarUrl = user?.avatar || getDefaultAvatar(user?.gender, user?.name);

  return (
    <aside
      className={
        `w-full md:w-80 md:h-screen overflow-y-auto p-4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-200 ` +
        // light background on desktop, dark/transparent on mobile for a glass effect
        `bg-transparent md:bg-slate-50`
      }
    >
      {/* User info (desktop) - hidden on small screens to avoid duplicates and overflow */}
      <div className="hidden md:flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0 cursor-pointer"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
          aria-label="Open settings"
        />
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-[#0d171b] text-base font-medium truncate max-w-[10rem]">{displayName}</h1>
          <p className="text-[#4c809a] text-sm font-normal truncate max-w-[10rem]">{displayGender}</p>
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

      {/* Mobile / Tablet: compact header + full-screen toggle menu */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-transparent justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0 cursor-pointer"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
              aria-label="Open settings"
            />
          </div>

          <MobileMenuToggle />
        </div>

        {/* spacer so main content won't be hidden by overlay when it opens */}
        <div className="h-2" />
      </div>

      {/* FOOTER: Logout */}
      <div className="mt-auto hidden md:flex flex-col gap-2">
        <LogoutButton />
      </div>

      {/* Mobile full-screen overlay menu (rendered by toggle) */}
      <MobileOverlay avatarUrl={avatarUrl} displayName={displayName} displayGender={displayGender} />
    </aside>
  );
};

const MobileMenuToggle = () => {
  const [open, setOpen] = useState(false);
  // communicate with overlay via custom event on window
  const toggle = () => {
    const ev = new CustomEvent('dashnav-toggle', { detail: { open: !open } });
    window.dispatchEvent(ev);
    setOpen(!open);
  };

  return (
    <button onClick={toggle} className="p-2 rounded-md bg-white/10 hover:bg-white/20">
      <span className="material-symbols-outlined">menu</span>
    </button>
  );
};

const MobileOverlay = ({ avatarUrl, displayName, displayGender }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e) => setIsOpen(Boolean(e.detail?.open));
    window.addEventListener('dashnav-toggle', handler);
    return () => window.removeEventListener('dashnav-toggle', handler);
  }, []);

  const close = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button aria-label="Close navigation" className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative z-50 h-full w-full flex flex-col bg-[rgba(2,6,23,0.84)] backdrop-blur-xl text-white">
        <div className="flex items-center justify-between px-6 pt-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings'); }}
              className="w-12 h-12 rounded-full bg-center bg-cover flex-shrink-0 cursor-pointer"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
              aria-label="Open settings"
            />
            <div>
              <div className="font-semibold text-lg">{displayName}</div>
              <div className="text-sm text-white/70">{displayGender}</div>
            </div>
          </div>
          <button onClick={close} className="p-2 rounded-md bg-white/10 hover:bg-white/20">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="mt-10 px-6 flex-1 overflow-auto">
          <ul className="flex flex-col gap-4">
            <li>
              <NavLink to="/dashboard" onClick={close} className={({isActive}) => `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-2xl">home</span>
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/medication" onClick={close} className={({isActive}) => `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-2xl">medication</span>
                Medication
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/steps" onClick={close} className={({isActive}) => `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-2xl">directions_walk</span>
                Steps
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/breath" onClick={close} className={({isActive}) => `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-2xl">air</span>
                Breath
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/settings" onClick={close} className={({isActive}) => `flex items-center gap-4 text-xl font-medium p-3 rounded-lg ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90 hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-2xl">settings</span>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="px-6 pb-10">
          <LogoutMobileButton />
        </div>
      </div>
    </div>
  );
};

const MobileNavButton = ({ to, iconClass, label }) => {
  return (
    <NavLink to={to} className={({ isActive }) => `flex-1 flex flex-col items-center justify-center gap-1 text-xs ${isActive ? 'text-[var(--primary-color)]' : 'text-white/90'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/10`}>
        <i className={`${iconClass} text-sm`} />
      </div>
      <span className="block mt-1">{label}</span>
    </NavLink>
  );
};

const LogoutMobileButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handle = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed", err);
    }
    navigate('/login');
  };

  return (
    <button onClick={handle} className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-white/90">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10">
        <i className="fas fa-sign-out-alt text-sm" />
      </div>
      <span className="block mt-1">Logout</span>
    </button>
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
