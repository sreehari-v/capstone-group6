import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark antialiased">
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gray-50 dark:bg-slate-800 p-12">
        <div className="max-w-md w-full">
          <a
            href="#"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
          >
            <span className="material-icons text-primary" style={{ fontSize: 32 }}>
              air
            </span>
            <span>CareOn</span>
          </a>
          <h1 className="text-4xl font-bold mt-8 text-gray-900 dark:text-white">
            Welcome Back to Your Health Journey!
          </h1>
          <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
            Log in to stay on track with your steps, breathing, and medication - your well-being starts here.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-white dark:bg-slate-900">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
