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
  const [mode, setMode] = useState<ThemeMode>('dark'); // Dark mode by default for modern look
  const [colors, setColors] = useState<ThemeColors>(darkTheme);

  // Apply theme when mode changes
  useEffect(() => {
    const newColors = mode === 'dark' ? darkTheme : lightTheme;
    setColors(newColors);
  }, [mode]);

  // Sync with system theme on mount
  useEffect(() => {
    if (systemColorScheme === 'dark') {
      setMode('dark');
    } else if (systemColorScheme === 'light') {
      setMode('light');
    }
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

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
    // Return dark theme as fallback (modern default)
    return {
      mode: 'dark',
      colors: darkTheme,
      isDark: true,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
