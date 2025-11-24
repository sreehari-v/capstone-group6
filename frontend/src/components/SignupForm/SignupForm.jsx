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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "https://careon-backend-rzbf.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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

      // Don't auto-login or navigate to the dashboard — require email verification first.
      // Redirect user to the login page with a flag so UI can show a "check your email" message.
      navigate("/login?sent=1");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 bg-primary text-white rounded-md ${
            isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span
                className="inline-block w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              ></span>
              Creating account...
            </span>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="mb-2">Or continue with</div>
        <OAuth />
      </div>
    </div>
  );
}
