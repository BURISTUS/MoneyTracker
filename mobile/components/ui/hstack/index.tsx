import React from 'react';
import { View } from 'react-native';
import { createStack } from '@gluestack-ui/stack';

const StyledHStack = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={`flex-row ${className || ''}`} {...props} />
));

const HSpacer = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={`grow ${className || ''}`} {...props} />
));

const VSpacer = React.forwardRef<
  View,
  React.ComponentProps<typeof View> & { className?: string }
>((props, ref) => <View ref={ref} {...props} />);

export const HStack = createStack({
  Root: StyledHStack,
  HSpacer: HSpacer,
  VSpacer: VSpacer,
});
