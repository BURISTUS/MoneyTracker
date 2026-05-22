import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = React.memo(({ message, fullScreen = false }) => {
  const C = useTheme();
  return (
    <View
      className={`items-center justify-center gap-3 ${fullScreen ? 'flex-1' : 'py-12'}`}
    >
      <ActivityIndicator size="large" color={C.primary} />
      {message && (
        <Text className="text-sm text-typography-400">{message}</Text>
      )}
    </View>
  );
});

export const Skeleton: React.FC<{ width?: number | string; height?: number }> = React.memo(
  ({ width = '100%', height = 16 }) => {
    const C = useTheme();
    return (
      <View
        className="rounded"
        style={{ width: width as '100%', height, backgroundColor: C.divider }}
      />
    );
  },
);
