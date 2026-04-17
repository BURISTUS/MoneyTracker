import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconComponentProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconComponentProps> = React.memo(
  ({ name, size = 22, color = '#A1A1AA', style }) => {
    return <Ionicons name={name} size={size} color={color} style={style} />;
  },
);
