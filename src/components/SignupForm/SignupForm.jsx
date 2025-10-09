import React from "react";

export default function SignupForm() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-text-light dark:text-text-dark">
        Create an Account
      </h2>
      <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mt-2 mb-8">
        Start your journey to a more mindful you.
      </p>
      <form>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="email_signup"
              className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
            >
              Email Address
            </label>
            <input
              id="email_signup"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary bg-background-light dark:bg-background-dark sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password_signup"
              className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
            >
              Password
            </label>
            <input
              id="password_signup"
              type="password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary bg-background-light dark:bg-background-dark sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password_signup"
              className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
            >
              Confirm Password
            </label>
            <input
              id="confirm_password_signup"
              type="password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary bg-background-light dark:bg-background-dark sm:text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="#"
            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <img
              alt="Google icon"
              className="h-5 w-5"
              src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png"
            />
            <span className="ml-3">Sign in with Google</span>
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Already have an account?{" "}
        <a href="#" className="font-medium text-primary hover:text-primary/90">
          Sign in
        </a>
      </p>
    </div>
  );
}
