import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark antialiased">
      <Link
        to="/"
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-3xl px-6 py-4 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Go to homepage"
      >
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </Link>
      <div
        className="hidden lg:flex relative flex-col items-center justify-center w-1/2 bg-gray-50 dark:bg-slate-800 p-12"
        style={{
          backgroundImage: "url('/images/login-bg-1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="max-w-md w-full relative z-10 bg-white/40 dark:bg-slate-900/60 backdrop-blur-sm border border-gray/10 dark:border-slate-700/40 p-8 rounded-xl text-gray-900 dark:text-white">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <i
              className="fa-solid fa-wind text-primary"
              style={{ fontSize: 32 }}
              aria-hidden="true"
            />
            <span>CareOn</span>
          </Link>

          <h1 className="text-4xl font-bold mt-6">
            Welcome Back to Your Health Journey!
          </h1>

          <p className="mt-4 text-sm text-opacity-90">
            Log in to stay on track with your steps, breathing, and medication —
            your well-being starts here.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-white dark:bg-slate-900">
        <div className="max-w-md w-full">
          <LoginForm />

          <p className="mt-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              sign up
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
