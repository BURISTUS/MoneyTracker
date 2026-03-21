import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, lightTheme, darkTheme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [colors, setColors] = useState<ThemeColors>(lightTheme);

  // Apply theme when mode changes
  useEffect(() => {
    const newColors = mode === 'dark' ? darkTheme : lightTheme;
    setColors(newColors);
  }, [mode]);

  // Also sync with system theme on mount
  useEffect(() => {
    if (systemColorScheme === 'dark') {
      setMode('dark');
    }
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  // Always provide a valid value
  const value: ThemeContextType = {
    mode,
    colors,
    isDark: mode === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return light theme as fallback if context is not available
    return {
      mode: 'light',
      colors: lightTheme,
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
