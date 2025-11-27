import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OAuth from "../../OAuth";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchMe } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const sent = searchParams.get("sent");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // refresh auth state
  try { await fetchMe(); } catch { /* ignore */ }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
      {sent === "1" && (
        <p className="text-blue-600 text-center mt-2">
          Check your email — we sent a verification link. You must verify before
          logging in.
        </p>
      )}
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="text-center mb-2">Or continue with</div>
        <OAuth />
      </div>
    </div>
  );
}
