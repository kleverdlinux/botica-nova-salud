import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'neutral' | 'pink' | 'green' | 'yellow' | 'contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('raum-theme') as Theme) || 'neutral';
    }
    return 'neutral';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-neutral', 'theme-pink', 'theme-green', 'theme-yellow', 'theme-contrast');
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Persist to localStorage
    localStorage.setItem('raum-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
