import React from 'react';
import { View, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Header: React.FC<HeaderProps> = React.memo(({ title, showBack = false, right, style }) => {
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Icon name="chevron-back" size={24} color="#F4F4F5" />
          </Pressable>
        )}
        <Text preset="h3" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
});
