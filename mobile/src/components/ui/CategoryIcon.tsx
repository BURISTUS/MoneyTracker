import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { deserializeIcon, type IconDef } from '../../utils/iconBank';
import { useTheme } from '../../stores/themeStore';

interface CategoryIconProps {
  icon: string | null;
  color?: string;
  size?: number;
  backgroundColor?: string;
  showBackground?: boolean;
}

function renderIcon(def: IconDef, size: number, color: string) {
  switch (def.family) {
    case 'material':
      return <MaterialCommunityIcons name={def.name as any} size={size} color={color} />;
    case 'fontawesome':
      return <FontAwesome5 name={def.name as any} size={size} color={color} />;
    case 'ionicons':
    default:
      return <Ionicons name={def.name as any} size={size} color={color} />;
  }
}

export const CategoryIcon = React.memo(function CategoryIcon({
  icon,
  color,
  size = 24,
  backgroundColor,
  showBackground = true,
}: CategoryIconProps) {
  const C = useTheme();
  const iconColor = color ?? C.primary;
  const def = deserializeIcon(icon || '');

  if (!def) {
    if (showBackground) {
      return (
        <View style={{
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          backgroundColor: backgroundColor || iconColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialCommunityIcons name="shape" size={size} color="#FFFFFF" />
        </View>
      );
    }
    return <MaterialCommunityIcons name="shape" size={size} color={iconColor} />;
  }

  if (!showBackground) {
    return renderIcon(def, size, iconColor);
  }

  return (
    <View style={{
      width: size + 20,
      height: size + 20,
      borderRadius: (size + 20) / 2,
      backgroundColor: backgroundColor || iconColor,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {renderIcon(def, size, '#FFFFFF')}
    </View>
  );
});
