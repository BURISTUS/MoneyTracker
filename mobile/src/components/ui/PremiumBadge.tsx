import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
  style?: object;
}

export function PremiumBadge({ size = 'sm', style }: PremiumBadgeProps) {
  const C = useTheme();
  const isSm = size === 'sm';

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: isSm ? 6 : 8,
      paddingVertical: isSm ? 2 : 3,
      borderRadius: isSm ? 6 : 8,
      backgroundColor: '#F59E0B20',
      borderWidth: 1,
      borderColor: '#F59E0B40',
    }, style]}>
      <Ionicons name="diamond" size={isSm ? 10 : 13} color="#F59E0B" />
      <Text style={{ fontSize: isSm ? 9 : 11, fontWeight: '700', color: '#F59E0B' }}>PRO</Text>
    </View>
  );
}

export function LockIcon({ style }: { style?: object }) {
  const C = useTheme();
  return (
    <View style={[{
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: C.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}>
      <Ionicons name="lock-closed" size={11} color={C.primary} />
    </View>
  );
}