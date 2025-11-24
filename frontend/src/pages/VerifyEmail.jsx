import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing token in URL.");
      return;
    }

    const verify = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
        const res = await fetch(`${base}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
          // Redirect to login after short delay
          setTimeout(() => navigate("/login?verified=1"), 2500);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Network error while verifying email.");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <main className="max-w-2xl mx-auto py-20 px-4">
      <div className="card p-8 text-center">
        {status === "loading" && <p>Verifying your email…</p>}
        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Email verified</h2>
            <p className="mt-4">{message}</p>
            <p className="mt-4">Redirecting to <Link to="/login">login</Link>…</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Verification failed</h2>
            <p className="mt-4">{message}</p>
            <p className="mt-4">Try <Link to="/register">registering</Link> again or contact support.</p>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmail;
