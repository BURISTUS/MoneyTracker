import React from 'react';
import { Pressable as RNPressable } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContextAndStates } from '@gluestack-ui/nativewind-utils/withStyleContextAndStates';

const pressableStyle = tva({
  base: 'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
});

type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string;
};

const Pressable = React.forwardRef(function Pressable(
  { className, ...props }: PressableProps,
  ref: React.Ref<React.ComponentRef<typeof RNPressable>>,
) {
  return (
    <RNPressable
      ref={ref}
      className={pressableStyle({ class: className })}
      {...props}
    />
  );
});

Pressable.displayName = 'Pressable';

export { Pressable, pressableStyle, withStyleContextAndStates };
