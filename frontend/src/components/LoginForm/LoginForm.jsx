import React, { useState, useEffect, useRef } from "react";
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
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownTimerRef = useRef(null);

  // Helper key for localStorage per email
  const cooldownKey = (em) => `resendCooldown:${em}`;

  useEffect(() => {
    // When email changes, restore any persisted cooldown for that email
    if (!email) return;
    try {
      const raw = localStorage.getItem(cooldownKey(email));
      if (raw) {
        const end = Number(raw);
        const now = Date.now();
        if (!Number.isNaN(end) && end > now) {
          setCooldown(Math.ceil((end - now) / 1000));
        } else {
          localStorage.removeItem(cooldownKey(email));
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, [email]);

  useEffect(() => {
    // Manage interval when cooldown > 0
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (cooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldown((c) => {
            if (c <= 1) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
            try { localStorage.removeItem(cooldownKey(email)); } catch { /* ignore */ }
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [cooldown, email]);

  const startCooldown = (seconds) => {
    if (!email) return;
    const end = Date.now() + seconds * 1000;
  try { localStorage.setItem(cooldownKey(email), String(end)); } catch { /* ignore */ }
    setCooldown(Math.ceil(seconds));
  };

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
      // Server may return nextWait (seconds) to indicate when next resend will be allowed
      const nextWait = Number(resp.data?.nextWait) || 0;
      if (nextWait > 0) startCooldown(nextWait);
      setTimeout(() => setInfoMessage(""), 8000);
    } catch (err) {
      console.error("Resend error:", err);
      const em = err.response?.data?.message || "Failed to resend verification email";
      setInfoMessage(em);
      // If server returned remaining seconds on 429, use it for cooldown
      const rem = Number(err.response?.data?.remaining) || 0;
      if (rem > 0) startCooldown(rem);
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
              disabled={isResending || !email || cooldown > 0}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary-color)] px-3 py-2 rounded-md border border-[var(--primary-color)] bg-white/10"
            >
              {isResending ? (
                <>
                  <span className="inline-block w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Resending...
                </>
              ) : cooldown > 0 ? (
                `Resend available in ${cooldown}s`
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
