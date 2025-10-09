import React from "react";
import "./LoginForm.css";

const LoginForm = () => {
  return (
    <div className="max-w-md w-full">
      <h2 className="text-3xl font-bold text-center text-text-light dark:text-text-dark">
        Welcome Back
      </h2>
      <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mt-2 mb-8">
        Login to your account to continue.
      </p>

      <form>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="email_login"
              className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
            >
              Email Address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email_login"
                name="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary bg-background-light dark:bg-background-dark sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password_login"
              className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="password_login"
                name="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary focus:border-primary bg-background-light dark:bg-background-dark sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-slate-600 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-text-secondary-light dark:text-text-secondary-dark"
            >
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-primary hover:text-primary/90"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Login
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background-light dark:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark">
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
              className="h-5 w-5"
              alt="Google icon"
              src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png"
            />
            <span className="ml-3">Sign in with Google</span>
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Don't have an account?{" "}
        <a href="/signup" className="font-medium text-primary hover:text-primary/90">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
