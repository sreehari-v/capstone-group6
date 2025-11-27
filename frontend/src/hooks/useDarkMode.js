import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [dark]);

  const toggleDarkMode = () => setDark((prev) => !prev);

  return { dark, toggleDarkMode };
};