import React from 'react';
import { View } from 'react-native';

type CenterProps = React.ComponentProps<typeof View> & {
  className?: string;
};

const Center = React.forwardRef<View, CenterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`items-center justify-center ${className || ''}`}
        {...props}
      >
        {children}
      </View>
    );
  },
);

Center.displayName = 'Center';

export { Center };
