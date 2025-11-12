import React from "react";
import "./MainFooter.css";

const MainFooter = () => {
    return (
        <footer class="bg-[var(--background-dark)] py-10 px-4 md:px-10 text-center text-[var(--text-secondary)]/80">
            <div class="max-w-6xl mx-auto">
                <div class="flex flex-wrap items-center justify-center gap-6 mb-6">
                    <a class="hover:text-white transition-colors" href="#">Privacy Policy</a>
                    <a class="hover:text-white transition-colors" href="#">Terms of Service</a>
                    <a class="hover:text-white transition-colors" href="#">Contact Sales</a>
                    <a class="hover:text-white transition-colors" href="#">Support</a>
                </div>
                <p class="text-sm">© 2023 Care on. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default MainFooter;



