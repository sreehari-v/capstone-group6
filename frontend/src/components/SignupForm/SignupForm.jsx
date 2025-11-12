import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OAuth from "../../OAuth";
import axios from "axios";

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center">Create an Account</h2>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
<<<<<<< HEAD
          className="w-full mt-8 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
=======
          className="w-full py-3 px-4 bg-primary text-white rounded-md"
>>>>>>> origin/feature/login-signup
        >
          Sign Up
        </button>
      </form>

<<<<<<< HEAD
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
          <Link
            to="/"
            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <img
              alt="Google icon"
              className="h-5 w-5"
              src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png"
            />
            <span className="ml-3">Sign in with Google</span>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary/90"
        >
          Sign in
        </Link>
      </p>
=======
      <div className="mt-6 text-center">
        <div className="mb-2">Or continue with</div>
        <OAuth />
      </div>
>>>>>>> origin/feature/login-signup
    </div>
  );
}
