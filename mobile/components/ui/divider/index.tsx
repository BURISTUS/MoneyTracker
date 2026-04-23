import React from 'react';
import { View } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const dividerStyle = tva({
  base: 'bg-background-200',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
  },
});

type DividerProps = React.ComponentProps<typeof View> & {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

const Divider = React.forwardRef<View, DividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={dividerStyle({ orientation, class: className })}
        {...props}
      />
    );
  },
);

Divider.displayName = 'Divider';

export { Divider, dividerStyle };
