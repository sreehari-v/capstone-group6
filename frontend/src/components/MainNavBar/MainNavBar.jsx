import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./MainNavBar.css";

const MainNavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user } = useAuth();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between whitespace-nowrap px-6 py-4 text-white shadow-sm transition-all duration-300 bg-white/80 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="size-7">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="var(--primary-color)"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Care On
          </h2>
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
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 bg-white text-[var(--text-primary)]"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {/* Simple hamburger / close icon */}
          <span className="material-symbols-outlined">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <nav className="fixed top-16 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 md:hidden px-6 py-3 flex flex-col gap-3">
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/science"
            onClick={closeMenu}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            The Science
          </NavLink>

          <NavLink
            to="/features"
            onClick={closeMenu}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Features
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            About Us
          </NavLink>

        <NavLink
          to="/Donate"
          onClick={closeMenu}
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
          }
        >
          Donate
        </NavLink>


          <NavLink
            to="/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--primary-color)] transition-colors`
            }
          >
            Dashboard (test)
          </NavLink>

          {user ? (
            <NavLink to="/dashboard" onClick={closeMenu} className="mt-2">
              <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[var(--primary-color)] text-white text-sm font-bold shadow-lg hover:bg-[#2563eb] transition-colors">
                <span className="truncate">Dashboard</span>
              </button>
            </NavLink>
          ) : (
            <NavLink to="/register" onClick={closeMenu} className="mt-2">
              <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[var(--primary-color)] text-white text-sm font-bold shadow-lg hover:bg-[#2563eb] transition-colors">
                <span className="truncate">Sign Up</span>
              </button>
            </NavLink>
          )}
        </nav>
      )}
    </>
  );
};

export default MainNavBar;
