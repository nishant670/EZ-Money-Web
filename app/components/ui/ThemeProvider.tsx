"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
const ThemeContext = createContext<{ theme: ThemePreference; setTheme: (theme: ThemePreference) => void }>({ theme: "system", setTheme: () => undefined });

function applyTheme(theme: ThemePreference) {
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemePreference>("system");
    useEffect(() => {
        const stored = localStorage.getItem("finnri_theme");
        const initial = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        applyTheme(initial);
        queueMicrotask(() => setThemeState(initial));
    }, []);
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => { if (theme === "system") applyTheme(theme); };
        media.addEventListener("change", listener); return () => media.removeEventListener("change", listener);
    }, [theme]);
    const setTheme = (next: ThemePreference) => { localStorage.setItem("finnri_theme", next); setThemeState(next); applyTheme(next); };
    return <ThemeContext.Provider value={useMemo(() => ({ theme, setTheme }), [theme])}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
