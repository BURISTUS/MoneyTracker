import React from 'react';
import { Text as RNText } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const headingStyle = tva({
  base: 'text-typography-900 font-heading',
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

type HeadingProps = React.ComponentProps<typeof RNText> & {
  className?: string;
  isTruncated?: boolean;
  bold?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
};

const Heading = React.forwardRef<RNText, HeadingProps>(
  (
    {
      className,
      isTruncated = false,
      bold = false,
      underline = false,
      strikeThrough = false,
      size = 'lg',
      ...props
    },
    ref,
  ) => {
    return (
      <RNText
        ref={ref}
        className={headingStyle({
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

Heading.displayName = 'Heading';

export { Heading, headingStyle };
