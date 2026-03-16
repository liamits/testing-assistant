"use client";
import { useEffect } from "react";
import { useAuthStore } from "../../lib/store";

export default function ThemeWrapper({ children }) {
  const { theme } = useAuthStore();

  useEffect(() => {
    // Apply theme class to html element
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  return <>{children}</>;
}
