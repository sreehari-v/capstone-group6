import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./MainFooter.css";

const MainFooter = () => {
  return (
    <footer className="bg-[#0f172a] py-10 px-4 md:px-10 text-center text-gray-300">
      <div className="max-w-6xl mx-auto">

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-white transition-colors" href="#">Contact Sales</a>
          <a className="hover:text-white transition-colors" href="#">Support</a>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6 text-2xl">
          <a
            href="#"
            className="hover:text-white hover:scale-125 transition-all"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="#"
            className="hover:text-white hover:scale-125 transition-all"
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href="#"
            className="hover:text-white hover:scale-125 transition-all"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className="hover:text-white hover:scale-125 transition-all"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>

        <p className="text-sm opacity-80">© 2025 Care On. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default MainFooter;
