import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
  label?: string;
  showPercent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({
    progress,
    height = 6,
    color = '#6366F1',
    gradient,
    label,
    showPercent = false,
    style,
  }) => {
    const { borderRadius: br } = useTheme();
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
      <View style={[{ gap: 4 }, style]}>
        {(label || showPercent) && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {label && (
              <Text size="xs" style={{ color: '#A1A1AA' }}>
                {label}
              </Text>
            )}
            {showPercent && (
              <Text size="xs" weight="medium" style={{ color: '#A1A1AA' }}>
                {Math.round(clampedProgress)}%
              </Text>
            )}
          </View>
        )}
        <View
          style={{
            height,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: height / 2,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${clampedProgress}%`,
              height: '100%',
              borderRadius: height / 2,
              overflow: 'hidden',
            }}
          >
            {gradient ? (
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: color }} />
            )}
          </View>
        </View>
      </View>
    );
  },
);
