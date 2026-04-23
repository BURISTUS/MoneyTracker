import React from 'react';
import { ActivityIndicator } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const spinnerStyle = tva({
  base: 'text-primary-500',
});

type SpinnerProps = React.ComponentProps<typeof ActivityIndicator> & {
  className?: string;
  size?: 'small' | 'large';
};

const Spinner = React.forwardRef<ActivityIndicator, SpinnerProps>(
  ({ className, size = 'small', ...props }, ref) => {
    return (
      <ActivityIndicator
        ref={ref}
        size={size}
        className={spinnerStyle({ class: className })}
        {...props}
      />
    );
  },
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerStyle };
