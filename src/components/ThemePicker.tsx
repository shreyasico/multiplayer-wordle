"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemePicker() {
  const { theme, themeKey, setThemeKey, allThemes } = useTheme();
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 350);
    }
    setOpen(!open);
  };

  const currentTheme = allThemes.find((t) => t.key === themeKey);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all active:scale-95"
        style={{ background: theme.inputBg, color: theme.textMuted }}
      >
        <span className="text-base leading-none">{currentTheme?.emoji || ""}</span>
        Theme
      </button>
      {open && (
        <div
          className={`absolute right-0 rounded-xl shadow-lg border p-1.5 z-50 min-w-[170px] max-h-[320px] overflow-y-auto ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
          style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
        >
          {allThemes.map((t) => (
            <button
              key={t.key}
              onClick={() => { setThemeKey(t.key); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5"
              style={{
                color: themeKey === t.key ? "#22c55e" : theme.text,
                background: themeKey === t.key ? "rgba(34,197,94,0.12)" : "transparent",
              }}
            >
              <span className="text-base leading-none flex-shrink-0 w-5 text-center">{t.emoji}</span>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
