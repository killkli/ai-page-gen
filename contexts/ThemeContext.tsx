import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, defaultThemeId, themes } from '../themes/themeConfig';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      return savedTheme;
    }

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'midnight';
    }

    return defaultThemeId;
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(
    themes.find(t => t.id === themeId) || themes[0]
  );

  const setTheme = (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (theme) {
      setThemeId(id);
      setCurrentTheme(theme);
      localStorage.setItem('app-theme', id);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    const setVar = (name: string, value: string) => {
      root.style.setProperty(name, value);
    };

    setVar('--color-primary', colors.primary);
    setVar('--color-secondary', colors.secondary);
    setVar('--color-accent', colors.accent);
    setVar('--color-background', colors.background);
    setVar('--color-surface', colors.surface);
    setVar('--color-text-primary', colors.text.primary);
    setVar('--color-text-secondary', colors.text.secondary);
    setVar('--color-text-muted', colors.text.muted);
    setVar('--color-text-inverse', colors.text.inverse);
    setVar('--color-border', colors.border);

    root.setAttribute('data-theme', currentTheme.id);

    if (currentTheme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  useEffect(() => {
    document.documentElement.classList.remove('theme-loading');
  }, []);

  const value = {
    currentTheme,
    setTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
