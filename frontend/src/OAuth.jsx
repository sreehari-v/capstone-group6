import React from "react";

const OAuth = () => {
  const handleGoogleClick = () => {
  const backendURL = import.meta.env.VITE_API_BASE || "https://careon-backend-rzbf.onrender.com";
    window.location.href = `${backendURL}/api/auth/google`;
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleGoogleClick}
        className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium hover:bg-gray-50"
      >
        <img
          className="h-5 w-5"
          alt="Google icon"
          src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png"
        />
        <span className="ml-3">Sign in with Google</span>
      </button>
    </div>
  );
};

export default OAuth;
