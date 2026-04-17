import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = React.memo(({ style }) => {
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          marginVertical: 4,
        },
        style,
      ]}
    />
  );
});
