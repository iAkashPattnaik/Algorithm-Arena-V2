import React, { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = () => {
  // 1. Initialize state from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // 2. Apply theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-glass-surface shadow-lg backdrop-blur-md
                 text-secondary hover:text-accent hover:border-accent transition-all duration-300
                 flex items-center justify-center group"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <FiMoon className="text-xl group-hover:rotate-12 transition-transform" />
      ) : (
        <FiSun className="text-xl group-hover:rotate-90 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;
