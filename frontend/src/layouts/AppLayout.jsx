import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router"; // or "react-router-dom"
import MainNavBar from "../components/MainNavBar/MainNavBar";
import MainFooter from "../components/MainFooter/MainFooter";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If the server redirected to `/?redirect=/some/path`, handle it on client
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        // replace so the redirect param is not kept in history
        navigate(redirect, { replace: true });
      }
    } catch {
      // ignore malformed redirects
    }
    // Only run on initial mount / when search changes
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Top navbar */}
      <MainNavBar />

      {/* Page content under fixed navbar */}
      <main className="pt-20 px-4 md:px-8 pb-8">
        <Outlet />
      </main>
      {/* Footer */}
      <MainFooter />
    </div>
  );
};

export default AppLayout;
