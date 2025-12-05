import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./MainNavBar.css";

const MainNavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user } = useAuth();
  // Debug: show current user in console to help diagnose stale UI after logout
  try {
    if (import.meta.env.DEV) console.debug('MainNavBar render user ->', user);
  } catch {
    /* ignore */
  }

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between whitespace-nowrap px-6 py-6 text-white shadow-sm transition-all duration-300 bg-white/80 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="size-7 sm:hidden">
            <NavLink to="/" aria-label="Home">
              <img src="/images/careon-logo.png" alt="CareOn logo" className="h-10 w-10 object-contain" />
            </NavLink>
          </div>
          <div className="hidden sm:block">
            <NavLink to="/" aria-label="Home">
              <img src="/images/careon-txt-logo.png" alt="CareOn" className="h-8 object-contain" />
            </NavLink>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/science"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            The Science
          </NavLink>

          <NavLink
            to="/features"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Features
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            About Us
          </NavLink>

          <NavLink
            to="/Donate"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Donate
          </NavLink>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <NavLink to="/dashboard">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[var(--primary-color)] text-white text-sm font-bold shadow-lg hover:bg-[#2563eb] transition-colors">
                <span className="truncate">Dashboard</span>
              </button>
            </NavLink>
          ) : (
            <NavLink to="/register">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[var(--primary-color)] text-white text-sm font-bold shadow-lg hover:bg-[#2563eb] transition-colors">
                <span className="truncate">Get Started</span>
              </button>
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 bg-white text-[var(--text-primary)] nav-hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} aria-hidden>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      {/* Mobile full-screen app-like nav (glassmorphism) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden nav-overlay">
          {/* darker translucent backdrop - click to close */}
          <button
            aria-label="Close navigation"
            className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />

          <div className="relative z-50 h-full w-full flex flex-col bg-[rgba(2,6,23,0.64)] backdrop-blur-lg border-t border-white/10 text-white nav-panel">
            <div className="flex items-center justify-between px-6 pt-6">
              <NavLink to="/" onClick={closeMenu} className="flex items-center gap-3">
                <div className="ml-2 hidden">
                  <img src="/images/careon-logo.png" alt="CareOn logo" className="h-8 w-8 object-contain" />
                </div>
                {/* hide the text wordmark in the mobile overlay so only the icon shows */}
                <div>
                  <img src="/images/careon-txt-logo.png" alt="CareOn" className="h-6 object-contain" />
                </div>
              </NavLink>

              <button
                  onClick={closeMenu}
                  className="p-2 rounded-md bg-white/10 hover:bg-white/20 nav-close-btn"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="mt-8 px-6 flex-1 overflow-auto">
              <ul className="flex flex-col gap-4">
                <li>
                  <NavLink
                    to="/"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 text-lg font-medium p-3 rounded-lg ${isActive ? 'bg-white/20 text-[var(--primary-color)]' : 'text-white hover:bg-white/10'} transition-colors`
                    }
                  >
                    <span className="material-symbols-outlined">home</span>
                    Home
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/science"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 text-lg font-medium p-3 rounded-lg ${isActive ? 'bg-white/20 text-[var(--primary-color)]' : 'text-white hover:bg-white/10'} transition-colors`
                    }
                  >
                    <span className="material-symbols-outlined">science</span>
                    The Science
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/features"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 text-lg font-medium p-3 rounded-lg ${isActive ? 'bg-white/20 text-[var(--primary-color)]' : 'text-white hover:bg-white/10'} transition-colors`
                    }
                  >
                    <span className="material-symbols-outlined">devices</span>
                    Features
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/about"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 text-lg font-medium p-3 rounded-lg ${isActive ? 'bg-white/20 text-[var(--primary-color)]' : 'text-white hover:bg-white/10'} transition-colors`
                    }
                  >
                    <span className="material-symbols-outlined">info</span>
                    About
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/Donate"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 text-lg font-medium p-3 rounded-lg ${isActive ? 'bg-white/20 text-[var(--primary-color)]' : 'text-white hover:bg-white/10'} transition-colors`
                    }
                  >
                    <span className="material-symbols-outlined">favorite</span>
                    Donate
                  </NavLink>
                </li>
              </ul>
            </nav>

            <div className="px-6 pb-8">
              {user ? (
                <NavLink to="/dashboard" onClick={closeMenu}>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-[var(--primary-color)] text-white font-bold shadow-lg">
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                  </button>
                </NavLink>
              ) : (
                <NavLink to="/register" onClick={closeMenu}>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-[var(--primary-color)] text-white font-bold shadow-lg">
                    <span className="material-symbols-outlined">login</span>
                    Get Started
                  </button>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainNavBar;
