import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { ProgressBar } from '../ui/ProgressBar';
import { getXpForLevel, getLevelProgress } from '../../utils/formatters';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const XPBar: React.FC<XPBarProps> = React.memo(({ xp, level, compact = false, style }) => {
  const { spacing } = useTheme();
  const progress = getLevelProgress(xp);

  if (compact) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, style]}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255, 215, 0, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text size="xs" weight="bold" style={{ color: '#FFD700' }}>
            {level}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={progress} color="#FFD700" height={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Text size="sm" style={{ color: '#FFD700' }}>XP</Text>
          <Text size="md" weight="bold" style={{ color: '#FFD700' }}>{xp}</Text>
        </View>
        <Text size="xs" style={{ color: '#71717A' }}>Уровень {level}</Text>
      </View>
      <ProgressBar progress={progress} color="#FFD700" height={6} showPercent />
      <Text size="xs" style={{ color: '#71717A' }}>
        До уровня {level + 1}: {getXpForLevel(level)} XP
      </Text>
    </View>
  );
});
