import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  const apiBase =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.REACT_APP_API_BASE ||
    "http://localhost:5000";

  // --- Clear everything safely ---
  const hardResetAuth = () => {
    setUser(null);
    setCsrfToken(null);
    delete axios.defaults.headers.common["X-CSRF-Token"];
    localStorage.clear();
  };

  // track whether we've already attempted a refresh during this provider lifecycle
  const triedRefreshRef = useRef(false);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    // Check for a suppression flag set by flows like "delete account" which
    // intentionally clear server cookies before the client should re-check.
    try {
      const sup = localStorage.getItem("suppressAuthFetch");
      if (sup) {
        // remove flag and skip a fetch roundtrip
        localStorage.removeItem("suppressAuthFetch");
        setLoading(false);
        return;
      }
    } catch {
      // ignore storage errors
    }

    try {
      const res = await axios.get(`${apiBase}/api/auth/me`, {
        withCredentials: true
      });

      setUser(res.data);
      if (res.data?.csrfToken) {
        setCsrfToken(res.data.csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = res.data.csrfToken;
      }
      // successful fetch → we can allow future refresh attempts if needed later
      triedRefreshRef.current = false;
    } catch (err) {
      // If we get 401 → attempt refresh ONCE per provider lifecycle
      const status = err?.response?.status;
      console.debug("AuthContext.fetchMe: /me failed", { status, message: err?.message });

      if (status === 401 && !triedRefreshRef.current) {
        triedRefreshRef.current = true;
        try {
          const r = await axios.post(
            `${apiBase}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (r?.data?.csrfToken) {
            setCsrfToken(r.data.csrfToken);
            axios.defaults.headers.common["X-CSRF-Token"] = r.data.csrfToken;
          }

          // retry me once
          try {
            const retry = await axios.get(`${apiBase}/api/auth/me`, {
              withCredentials: true
            });
            setUser(retry.data);
          } catch (retryErr) {
            console.debug("AuthContext.fetchMe: retry /me failed", retryErr?.response?.status || retryErr?.message);
            hardResetAuth();
          }
        } catch (refreshErr) {
          console.debug("AuthContext.fetchMe: refresh failed", refreshErr?.response?.status || refreshErr?.message);
          // refresh also failed → user is logged out OR deleted
          hardResetAuth();
        }
      } else {
        // non-401 or already tried refresh → treat as logged out
        if (status !== 401) console.debug("AuthContext.fetchMe: non-401 error", err);
        hardResetAuth();
      }
    }

    setLoading(false);
  }, [apiBase]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = async () => {
    // Prevent concurrent auth fetches from re-authenticating while logout is in-flight
    try {
      localStorage.setItem("suppressAuthFetch", "1");
    } catch {
      /* ignore storage errors */
    }

    // Read the current CSRF token from cookie (double-submit cookie is non-httpOnly)
    const readCookie = (name) => {
      try {
        const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return m ? decodeURIComponent(m[2]) : null;
      } catch {
        return null;
      }
    };

    const csrfFromCookie = readCookie('csrfToken') || csrfToken || null;

    try {
      await axios.post(
        `${apiBase}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: csrfFromCookie ? { 'X-CSRF-Token': csrfFromCookie } : {}
        }
      );
    } catch (err) {
      console.debug("AuthContext.logout: logout request failed", err?.response?.status || err?.message);
    }

    // Immediately clear client state. Then trigger a quick re-check from the server
    // so UI can reflect the true server-side auth state if cookies failed to clear.
    hardResetAuth();
    try {
      // best-effort re-check — fetchMe will reset state again if server still
      // considers the session valid
      await fetchMe();
    } catch {
      // ignore errors here
    }

  try { localStorage.removeItem('suppressAuthFetch'); } catch { /* ignore */ }
  };

  // Log user changes in development for debugging logout issues
  useEffect(() => {
    try {
      if (import.meta.env.DEV) console.debug("AuthContext: user changed ->", user);
    } catch {
      /* ignore */
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, fetchMe, logout, csrfToken, hardResetAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
