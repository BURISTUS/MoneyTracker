import React from 'react';
import { View, Text as RNText } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const badgeStyle = tva({
  base: 'flex-row items-center rounded-md px-2 py-1',
  variants: {
    action: {
      muted: 'bg-background-muted',
      success: 'bg-background-success',
      warning: 'bg-background-warning',
      error: 'bg-background-error',
      info: 'bg-background-info',
    },
    size: {
      sm: 'px-1.5 py-0.5',
      md: 'px-2 py-1',
      lg: 'px-3 py-1.5',
    },
  },
});

const badgeTextStyle = tva({
  base: 'font-body text-xs font-medium',
  variants: {
    action: {
      muted: 'text-typography-900',
      success: 'text-success-700',
      warning: 'text-warning-700',
      error: 'text-error-700',
      info: 'text-info-700',
    },
    size: {
      sm: 'text-2xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
});

type BadgeProps = React.ComponentProps<typeof View> & {
  className?: string;
  action?: 'muted' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
};

const Badge = React.forwardRef<View, BadgeProps>(
  ({ className, action = 'muted', size = 'md', children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={badgeStyle({ action, size, class: className })}
        {...props}
      >
        {typeof children === 'string' ? (
          <RNText className={badgeTextStyle({ action, size })}>
            {children}
          </RNText>
        ) : (
          children
        )}
      </View>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge, badgeStyle, badgeTextStyle };
