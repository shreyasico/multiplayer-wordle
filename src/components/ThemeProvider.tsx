"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Theme, getTheme, getSavedTheme, saveTheme, themes } from "@/lib/themes";

interface ThemeContextValue {
  theme: Theme;
  themeKey: string;
  setThemeKey: (key: string) => void;
  allThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState("light");

  useEffect(() => {
    setThemeKeyState(getSavedTheme());
  }, []);

  const setThemeKey = (key: string) => {
    setThemeKeyState(key);
    saveTheme(key);
  };

  const theme = getTheme(themeKey);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tile-empty-border", theme.tileEmpty);
    root.style.setProperty("--tile-empty-text", theme.text);
    root.style.setProperty("--tile-filled-border", theme.tileFilled);
    root.style.setProperty("--tile-absent-bg", theme.tileAbsent);
    root.style.setProperty("--key-bg", theme.keyBg);
    root.style.setProperty("--key-text", theme.keyText);
    root.style.setProperty("--key-absent-bg", theme.keyAbsent);
    root.style.setProperty("--key-absent-text", theme.keyAbsentText);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, allThemes: themes }}>
      <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
