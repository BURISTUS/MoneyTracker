import React from 'react';
import { View } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const cardStyle = tva({
  base: 'rounded-xl border border-outline-100 bg-background-0 p-5 shadow-hard-1',
  variants: {
    size: {
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    },
  },
});

type CardProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const Card = React.forwardRef<View, CardProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cardStyle({ size, class: className })}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

export { Card, cardStyle };
