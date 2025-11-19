import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OAuth from "../../OAuth";
import axios from "axios";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const sent = searchParams.get("sent");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
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
        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary text-white rounded-md"
        >
          Login
        </button>
      </form>

      <div className="mt-6">
        <div className="text-center mb-2">Or continue with</div>
        <OAuth />
      </div>
    </div>
  );
}
