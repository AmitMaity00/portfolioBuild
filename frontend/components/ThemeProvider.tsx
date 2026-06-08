"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize theme on first mount - always dark
    const initializeTheme = () => {
      const shouldBeDark = true; // Force dark mode
      setIsDark(shouldBeDark);
      applyTheme(shouldBeDark);
      localStorage.setItem('theme-mode', 'dark');
      setMounted(true);
    };

    initializeTheme();
  }, []);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    
    if (dark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
    
    console.log(`🎨 Theme switched to ${dark ? 'dark' : 'light'} mode`);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme-mode', newIsDark ? 'dark' : 'light');
    applyTheme(newIsDark);
  };

  // When mounted, ensure theme is applied
  useEffect(() => {
    if (mounted) {
      applyTheme(isDark);
    }
  }, [mounted, isDark]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return safe defaults during SSR or if context not available
    return {
      isDark: true,
      toggleTheme: () => {}
    };
  }
  return context;
}
