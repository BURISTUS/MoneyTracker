import React, { useCallback } from 'react';
import {
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = React.memo(
  ({ label, error, containerStyle, rightElement, ...rest }) => {
    const { spacing, borderRadius: br, colors } = useTheme();

    return (
      <View style={[{ gap: spacing.xs }, containerStyle]}>
        {label && (
          <Text size="sm" weight="medium" style={{ color: colors.text.secondary }}>
            {label}
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: br.md,
            borderWidth: 1,
            borderColor: error ? colors.semantic.danger : 'rgba(255, 255, 255, 0.08)',
            paddingHorizontal: spacing.lg,
            height: 48,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              color: colors.text.primary,
              fontSize: 15,
              fontFamily: 'System',
              padding: 0,
            }}
            placeholderTextColor={colors.text.tertiary}
            {...rest}
          />
          {rightElement}
        </View>
        {error && (
          <Text size="xs" style={{ color: colors.semantic.danger }}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);
