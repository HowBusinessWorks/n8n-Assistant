import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'header' | 'chat';
}

export default function ThemeToggle({ variant = 'header' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'chat') {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center space-x-3 text-gray-400 hover:text-[#D4AA7D] hover:bg-[#2a2a2a]/80 dark:hover:bg-[#2a2a2a]/80 hover:bg-gray-100 p-3 rounded-2xl transition-all duration-200"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-300 hover:text-[#EFD09E] dark:text-gray-300 dark:hover:text-[#EFD09E] text-gray-600 hover:text-[#D4AA7D] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}