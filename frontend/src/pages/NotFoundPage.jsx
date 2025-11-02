import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div>404 - Page Not found</div>
      <Link to="/">Go Back to Home</Link>
    </div>
  );
}

export default NotFoundPage;
