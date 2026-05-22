import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { createButton } from '@gluestack-ui/button';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContextAndStates } from '@gluestack-ui/nativewind-utils/withStyleContextAndStates';

const buttonStyle = tva({
  base: 'rounded-lg flex-row items-center justify-center data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed',
  variants: {
    action: {
      primary:
        'bg-primary-500 data-[hover=true]:bg-primary-600 data-[active=true]:bg-primary-700 data-[focus=true]:bg-primary-500',
      secondary:
        'bg-secondary-500 data-[hover=true]:bg-secondary-600 data-[active=true]:bg-secondary-700 data-[focus=true]:bg-secondary-500',
      positive:
        'bg-success-500 data-[hover=true]:bg-success-600 data-[active=true]:bg-success-700 data-[focus=true]:bg-success-500',
      negative:
        'bg-error-500 data-[hover=true]:bg-error-600 data-[active=true]:bg-error-700 data-[focus=true]:bg-error-500',
      warning:
        'bg-warning-500 data-[hover=true]:bg-warning-600 data-[active=true]:bg-warning-700 data-[focus=true]:bg-warning-500',
    },
    variant: {
      solid: '',
      outline:
        'bg-transparent border border-primary-500 data-[hover=true]:bg-background-50 data-[active=true]:bg-background-100',
      link: 'bg-transparent data-[hover=true]:underline',
      ghost:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-background-100',
    },
    size: {
      xs: 'px-2.5 py-1',
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-5 py-2.5',
      xl: 'px-6 py-3',
    },
  },
});

const buttonTextStyle = tva({
  base: 'font-body font-medium text-typography-0 data-[disabled=true]:opacity-40',
  variants: {
    action: {
      primary: 'text-typography-950',
      secondary: 'text-typography-950',
      positive: 'text-typography-950',
      negative: 'text-typography-950',
      warning: 'text-typography-950',
    },
    variant: {
      solid: '',
      outline: 'text-primary-500 data-[hover=true]:text-primary-600',
      link: 'text-primary-500 data-[hover=true]:text-primary-600 underline',
      ghost: 'text-primary-500 data-[hover=true]:text-primary-600',
    },
    size: {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
});

const buttonIconStyle = tva({
  base: 'data-[disabled=true]:opacity-40',
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-[18px] w-[18px]',
      xl: 'h-5 w-5',
    },
  },
});

const buttonGroupStyle = tva({
  base: 'flex-row',
  variants: {
    isAttached: {
      true: 'gap-0',
      false: 'gap-2',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});

const StyledRoot = withStyleContextAndStates(Pressable);

const StyledText = Text;

const StyledGroup = View;

const StyledSpinner = ActivityIndicator;

const StyledIcon = View;

export const Button = createButton({
  Root: StyledRoot,
  Text: StyledText,
  Group: StyledGroup,
  Spinner: StyledSpinner,
  Icon: StyledIcon,
});

export {
  buttonStyle,
  buttonTextStyle,
  buttonIconStyle,
  buttonGroupStyle,
};
