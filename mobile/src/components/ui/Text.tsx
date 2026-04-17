import React from 'react';
import { Text as RNText, type TextStyle, type TextProps } from 'react-native';
import { useTheme, fontSize as fontSizes, fontWeight as fontWeights } from '../../theme';

type TextPreset = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'micro';

interface TextComponentProps extends Omit<TextProps, 'style'> {
  size?: keyof typeof fontSizes;
  weight?: keyof typeof fontWeights;
  color?: string;
  preset?: TextPreset;
  style?: TextStyle;
  children: React.ReactNode;
}

const presetMap: Record<TextPreset, { size: keyof typeof fontSizes; weight: keyof typeof fontWeights }> = {
  display: { size: 'huge', weight: 'extrabold' },
  h1: { size: 'xxxl', weight: 'bold' },
  h2: { size: 'xxl', weight: 'bold' },
  h3: { size: 'xl', weight: 'semibold' },
  body: { size: 'md', weight: 'regular' },
  caption: { size: 'sm', weight: 'regular' },
  micro: { size: 'xs', weight: 'regular' },
};

export const Text: React.FC<TextComponentProps> = React.memo(
  ({ size, weight, color, preset, style, children, ...rest }) => {
    const { colors } = useTheme();

    const p = preset ? presetMap[preset] : null;
    const resolvedSize = p ? fontSizes[p.size] : (size ? fontSizes[size] : fontSizes.md);
    const resolvedWeight = p ? fontWeights[p.weight] : (weight ? fontWeights[weight] : fontWeights.regular);
    const resolvedColor = color ?? colors.text.primary;

    return (
      <RNText
        style={[
          {
            fontSize: resolvedSize,
            fontWeight: resolvedWeight as TextStyle['fontWeight'],
            color: resolvedColor,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </RNText>
    );
  },
);
