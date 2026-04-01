import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-stripe-blue/50"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 w-6 h-6 text-stripe-dark transition-all duration-300 ${
            theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
          }`}
        />
        <Moon
          className={`absolute inset-0 w-6 h-6 text-stripe-cyan transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
          }`}
        />
      </div>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-stripe-blue/20 to-stripe-cyan/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
