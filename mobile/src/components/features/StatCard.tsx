import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface StatCardProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({ icon, label, value, color = '#6366F1', style }) => {
  const { spacing, borderRadius: br } = useTheme();

  return (
    <Card variant="glass" padding="md" style={style}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: br.sm,
          backgroundColor: `${color}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text size="lg" weight="bold" numberOfLines={1}>
        {value}
      </Text>
      <Text size="xs" style={{ color: '#71717A', marginTop: 2 }}>
        {label}
      </Text>
    </Card>
  );
});
