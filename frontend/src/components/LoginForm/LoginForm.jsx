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
  const [isResending, setIsResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const sent = searchParams.get("sent");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setInfoMessage("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // refresh auth state
      try {
        await fetchMe();
      } catch {
        /* ignore */
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setInfoMessage("");
    setIsResending(true);
    try {
      const base = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || "http://localhost:5000";
      const resp = await axios.post(`${base}/api/auth/resend-verification`, { email }, { withCredentials: true });
  const msg = resp.data?.message || "Verification email will be sent shortly";
      setInfoMessage(msg);
      setTimeout(() => setInfoMessage(""), 8000);
    } catch (err) {
      console.error("Resend error:", err);
  const em = err.response?.data?.message || "Failed to resend verification email";
      setInfoMessage(em);
      setTimeout(() => setInfoMessage(""), 8000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
      {sent === "1" && (
        <div className="mx-auto max-w-xl mt-4">
            <div className="rounded-md bg-green-50 border border-green-100 p-3 text-center text-green-800" role="status" aria-live="polite">
              Verification email will be sent shortly. You must verify before logging in.
            </div>
          </div>
      )}

      {error && (
        <div className="mx-auto max-w-xl mt-4">
          <div className="rounded-md bg-red-50 border border-red-100 p-3 text-center text-red-700" role="alert" aria-live="assertive">
            {error}
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="mx-auto max-w-xl mt-4">
          <div className="rounded-md bg-green-50 border border-green-100 p-3 text-center text-green-800" role="status" aria-live="polite">
            {infoMessage}
          </div>
        </div>
      )}

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

        {/* Show resend option when login fails due to unverified email */}
        {error && error.toLowerCase().includes("verify") && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !email}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary-color)] px-3 py-2 rounded-md border border-[var(--primary-color)] bg-white/10"
            >
              {isResending ? (
                <>
                  <span className="inline-block w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Resending...
                </>
              ) : (
                "Resend verification email"
              )}
            </button>
            {/* single top banner shows resend confirmation; no duplicate below */}
          </div>
        )}
      </form>

      <div className="mt-6">
        <div className="text-center mb-2">Or continue with</div>
        <OAuth />
      </div>
    </div>
  );
}
