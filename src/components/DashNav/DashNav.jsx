import React from "react";
import { NavLink } from "react-router-dom";

const DashNav = () => {
  return (
    <div className="flex flex-col w-80 bg-slate-50 p-4 min-h-screen">
      {/* User Info */}
      <div className="flex gap-3 mb-6">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzlOfJCRVMC2J5ZsNahN-raxXGcC4BhsP8WkjzS-xz_uwkZfaW8oz6Tv0GGMXRXm3C-IapTNePusjzYcvOMVXKrEPzFBuUokSa3ADO7xQla6RS8TAPlIaprglZdw8hDNQ6mu9A3pxWOMz-EogUUSJzKKU7AHt75GGakdbU1OajueOkFvtgR1Fys2oFFX1J186rKbAYFAdlM6dbKtwIXgerkoteEeXPqIpUn-rUhYWvyQrDy9g-YvVEiyjsq-KqJgGGWGds4l9e4vA")',
          }}
        ></div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[#0d171b] text-base font-medium">Olivia Harper</h1>
          <p className="text-[#4c809a] text-sm font-normal">Female</p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex flex-col gap-2">
        <NavItem label="Overview" iconClass="fas fa-home" to="/dashboard" end />
        <NavItem label="Medication" iconClass="fas fa-pills" to="/dashboard/medication" />
        <NavItem label="Step Tracking" iconClass="fas fa-shoe-prints" to="/dashboard/steps" />
        <NavItem label="Breath Tracking" iconClass="fas fa-lungs" to="/dashboard/breath" />
        <NavItem label="Settings" iconClass="fas fa-cog" to="/dashboard/settings" />
      </div>

      {/* Bottom Menu */}
      <div className="mt-auto flex flex-col gap-2">
        <NavItem label="Help & FAQ" iconClass="fas fa-question-circle" to="/dashboard/help" />
        <NavItem label="Feedback" iconClass="fas fa-comment-dots" to="/dashboard/feedback" />
      </div>
    </div>
  );
};

const NavItem = ({ label, iconClass, to, end }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
          isActive ? "bg-[#e7eff3]" : ""
        }`
      }
    >
      <i className={`${iconClass} text-[#0d171b] w-4 h-4`}></i>
      <p className="text-[#0d171b] text-sm font-medium">{label}</p>
    </NavLink>
  );
};

export default DashNav;
