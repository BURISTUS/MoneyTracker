import React from 'react';
import { View, useColorScheme } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { config } from './config';

export function GluestackUIProvider({
  mode = 'dark',
  children,
}: {
  mode?: 'light' | 'dark' | 'system';
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const resolved = mode === 'system' ? (systemScheme ?? 'dark') : mode;
  const themeVars = config[resolved];

  return (
    <OverlayProvider>
      <ToastProvider>
        <View style={themeVars} className="flex-1">
          {children}
        </View>
      </ToastProvider>
    </OverlayProvider>
  );
}

export { config };
