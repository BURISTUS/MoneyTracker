import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/ui/text';
import { getXpForLevel, getLevelProgress } from '../../utils/formatters';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const XPBar: React.FC<XPBarProps> = React.memo(({ xp, level, compact = false, style }) => {
  const { t } = useTranslation();
  const progress = getLevelProgress(xp);

  if (compact) {
    return (
      <View className={`flex-row items-center gap-2 ${style ? '' : ''}`} style={style}>
        <View className="w-7 h-7 rounded-full items-center justify-center bg-[rgba(255,215,0,0.15)]">
          <Text className="text-xs font-bold text-[#FFD700]">{level}</Text>
        </View>
        <View className="flex-1">
          <View className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <View className="h-full rounded-full bg-[#FFD700]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`gap-2 ${style ? '' : ''}`} style={style}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-[#FFD700]">XP</Text>
          <Text className="text-base font-bold text-[#FFD700]">{xp}</Text>
        </View>
        <Text className="text-xs text-typography-400">{t('components.levelLabel')} {level}</Text>
      </View>
      <View className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <View className="h-full rounded-full bg-[#FFD700]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </View>
      <Text className="text-xs text-typography-400">
        {t('components.toLevelLabel')} {level + 1}: {getXpForLevel(level)} XP
      </Text>
    </View>
  );
});
