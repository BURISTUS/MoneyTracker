import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = React.memo(({ message, fullScreen = false }) => {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flex: fullScreen ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.huge,
        gap: spacing.md,
      }}
    >
      <ActivityIndicator size="large" color="#6366F1" />
      {message && (
        <Text size="sm" style={{ color: '#A1A1AA' }}>
          {message}
        </Text>
      )}
    </View>
  );
});

export const Skeleton: React.FC<{ width?: number | string; height?: number }> = React.memo(
  ({ width = '100%', height = 16 }) => {
    return (
      <View
        style={{
          width: width as any,
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 4,
        }}
      />
    );
  },
);
