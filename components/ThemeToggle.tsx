"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Icons } from "./Icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] transition-all cursor-pointer active:scale-95 shadow-subtle hover:bg-white dark:hover:bg-[#15294A]"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Icons.Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Icons.Moon className="w-4 h-4 text-[#667085]" />
      )}
    </button>
  );
}
