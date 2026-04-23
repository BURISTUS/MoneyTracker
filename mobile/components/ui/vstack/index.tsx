import React from 'react';
import { View } from 'react-native';
import { createStack } from '@gluestack-ui/stack';

const StyledVStack = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={`flex-col ${className || ''}`} {...props} />
));

const HSpacer = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>((props, ref) => <View ref={ref} {...props} />);

const VSpacer = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={`grow ${className || ''}`} {...props} />
));

export const VStack = createStack({
  Root: StyledVStack,
  HSpacer: HSpacer,
  VSpacer: VSpacer,
});
