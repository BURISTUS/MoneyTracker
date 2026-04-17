import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface AvatarProps {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const gradients = [
  ['#6366F1', '#8B5CF6'],
  ['#2DD4BF', '#6366F1'],
  ['#F472B6', '#6366F1'],
  ['#FBBF24', '#F97316'],
  ['#34D399', '#2DD4BF'],
];

export const Avatar: React.FC<AvatarProps> = React.memo(({ name, size = 40, style }) => {
  const { borderRadius: br } = useTheme();
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colorIndex = name.charCodeAt(0) % gradients.length;
  const [c1, c2] = gradients[colorIndex];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        weight="bold"
        style={{ color: '#FFFFFF', fontSize: size * 0.38 }}
      >
        {initials}
      </Text>
    </View>
  );
});
