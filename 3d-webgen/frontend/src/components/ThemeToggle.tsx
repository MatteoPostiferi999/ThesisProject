import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow hover:scale-105 transition-transform"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
};

export default ThemeToggle;
