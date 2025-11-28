import React, { useEffect, useState } from "react";
import Loader from "../components/Loader/Loader";
import { useSearchParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
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
  }, [token]);

  return (
    <main className="max-w-4xl mx-auto px-4">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center">
            {status === "loading" && (
              <div className="flex items-center justify-center mb-4">
                <Loader fullScreen={false} showText={false} size={56} />
              </div>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Email verified</h2>
                <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">{message || "Your email has been verified successfully."}</p>
                <div className="mt-6 flex gap-3">
                  <Link to="/login" className="inline-block px-5 py-2 rounded-lg bg-primary text-white font-medium shadow">Sign in</Link>
                  <Link to="/" className="inline-block px-5 py-2 rounded-lg border border-gray-200 text-gray-700 dark:text-gray-200">Go to home</Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Verification failed</h2>
                <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">{message || "We couldn't verify your email."}</p>
                <div className="mt-6 flex gap-3">
                  <Link to="/register" className="inline-block px-5 py-2 rounded-lg bg-primary text-white font-medium shadow">Try again</Link>
                  <Link to="/support" className="inline-block px-5 py-2 rounded-lg border border-gray-200 text-gray-700 dark:text-gray-200">Contact support</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;
