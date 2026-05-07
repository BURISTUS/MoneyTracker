import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({ icon, label, value, color, style }) => {
  const C = useTheme();
  const cardColor = color ?? C.primary;
  return (
    <View className="bg-background-50 rounded-2xl border border-outline-200 p-4" style={style}>
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mb-2"
        style={{ backgroundColor: `${cardColor}15` }}
      >
        <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={16} color={cardColor} />
      </View>
      <Text className="text-lg font-bold" numberOfLines={1}>{value}</Text>
      <Text className="text-xs text-typography-400 mt-0.5">{label}</Text>
    </View>
  );
});
