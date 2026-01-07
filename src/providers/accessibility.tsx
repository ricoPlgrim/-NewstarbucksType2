import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FontScale = "small" | "normal" | "large" | "xlarge";

interface AccessibilityContextValue {
  isDarkMode: boolean;
  fontScale: FontScale;
  setIsDarkMode: (next: boolean) => void;
  setFontScale: (value: FontScale) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEYS = {
  THEME: "accessibility-theme",
  FONT_SCALE: "accessibility-font-scale"
};

const FONT_SCALES: FontScale[] = ["small", "normal", "large", "xlarge"];

function getInitialTheme() {
  if (typeof window === "undefined") {
    return false;
  }
  const savedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme === "dark") {
    return true;
  }
  if (savedTheme === "light") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialFontScale() {
  if (typeof window === "undefined") {
    return "normal";
  }
  const stored = window.localStorage.getItem(STORAGE_KEYS.FONT_SCALE);
  return stored && FONT_SCALES.includes(stored as FontScale) ? (stored as FontScale) : "normal";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [fontScale, setFontScale] = useState<FontScale>(getInitialFontScale);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-font-scale", fontScale);
    window.localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? "dark" : "light");
    window.localStorage.setItem(STORAGE_KEYS.FONT_SCALE, fontScale);
  }, [isDarkMode, fontScale]);

  const value = useMemo(
    () => ({
      isDarkMode,
      fontScale,
      setIsDarkMode,
      setFontScale
    }),
    [isDarkMode, fontScale]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

