// app/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // عند التحميل، نقرؤ الثيم من localStorage أو نفترض "light"
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle swap swap-rotate"
      aria-label="تبديل الثيم"
    >
      {/* DaisyUI’s swap: عند كون checkbox checked → نعرض القمر، وإلا نعرض الشمس */}
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggleTheme}
        className="hidden"
      />

      {/* أيقونة القمر (تظهر في الوضع الفاتح للدلالة على إمكانية التنقل إلى الداكن) */}
      <SunIcon className="swap-on h-6 w-6 fill-current text-yellow-400" />

      {/* أيقونة الشمس (تظهر في الوضع الداكن للدلالة على إمكانية التنقل إلى الفاتح) */}
      <MoonIcon className="swap-off h-6 w-6 fill-current text-blue-500" />
    </button>
  );
}
