import { useEffect, useState } from "react";

export function useCampusTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("janus.theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("janus.theme", theme);
    } catch {
      /* Optional preference. */
    }
  }, [theme]);
  return {
    theme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
