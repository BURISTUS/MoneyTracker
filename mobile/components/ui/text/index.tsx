import React from 'react';
import { Text as RNText } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const textStyle = tva({
  base: 'text-typography-900 font-body',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
  },
});

type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
  isTruncated?: boolean;
  bold?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
};

const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      className,
      isTruncated = false,
      bold = false,
      underline = false,
      strikeThrough = false,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    return (
      <RNText
        ref={ref}
        className={textStyle({
          isTruncated,
          bold,
          underline,
          strikeThrough,
          size,
          class: className,
        })}
        numberOfLines={isTruncated ? 1 : undefined}
        {...props}
      />
    );
  },
);

Text.displayName = 'Text';

export { Text, textStyle };
