import React from 'react';
import { Pressable } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const fabStyle = tva({
  base: 'absolute bottom-6 right-6 items-center justify-center rounded-full shadow-hard-2 data-[disabled=true]:opacity-40 data-[hover=true]:opacity-90 data-[active=true]:opacity-80',
  variants: {
    size: {
      sm: 'h-10 w-10',
      md: 'h-12 w-12',
      lg: 'h-14 w-14',
    },
    placement: {
      'bottom right': 'bottom-6 right-6',
      'bottom left': 'bottom-6 left-6',
      'top right': 'top-6 right-6',
      'top left': 'top-6 left-6',
    },
    action: {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      positive: 'bg-success-500',
      negative: 'bg-error-500',
      warning: 'bg-warning-500',
    },
  },
});

type FabProps = React.ComponentPropsWithoutRef<typeof Pressable> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'bottom right' | 'bottom left' | 'top right' | 'top left';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'warning';
};

const Fab = React.forwardRef(function Fab(
  { className, size = 'md', placement = 'bottom right', action = 'primary', ...props }: FabProps,
  ref: React.Ref<React.ComponentRef<typeof Pressable>>,
) {
  return (
    <Pressable
      ref={ref as React.Ref<any>}
      className={fabStyle({ size, placement, action, class: className })}
      {...props}
    />
  );
});

Fab.displayName = 'Fab';

export { Fab, fabStyle };
