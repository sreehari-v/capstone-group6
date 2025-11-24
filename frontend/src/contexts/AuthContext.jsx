import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  // Use Vite env var (VITE_API_BASE). Fall back to legacy REACT_APP_API_BASE for safety.
  const apiBase = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/auth/me`, { withCredentials: true });
      setUser(res.data);
      const ct = res.data?.csrfToken || null;
      setCsrfToken(ct);
      if (ct) axios.defaults.headers.common["X-CSRF-Token"] = ct;
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/api/auth/logout`, {}, { withCredentials: true });
    } catch {
      // ignore
    }
    setUser(null);
    setCsrfToken(null);
    delete axios.defaults.headers.common["X-CSRF-Token"];
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchMe, logout, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
