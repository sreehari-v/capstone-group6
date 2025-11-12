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
          className="w-full py-3 px-4 bg-primary text-white rounded-md"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="mb-2">Or continue with</div>
        <OAuth />
      </div>
    </div>
  );
}
