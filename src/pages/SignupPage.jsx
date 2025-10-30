import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark antialiased relative">
      <Link
        to="/"
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-2xl"
        aria-label="Go to homepage"
      >
        <i className="fa-solid fa-xmark"></i>
      </Link>

      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gray-50 dark:bg-slate-800 p-12">
        <div className="max-w-md w-full">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
          >
            <span className="material-icons text-primary text-3xl">air</span>
            <span>CareOn</span>
          </Link>
          <h1 className="text-4xl font-bold mt-8 text-gray-900 dark:text-white">
            Step Into a Smarter, Healthier Life!
          </h1>
          <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
            Experience effortless wellness tracking — monitor steps, breaths, and
            medicines all in one seamless app.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-card-light dark:bg-card-dark">
        <div className="max-w-md w-full">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
