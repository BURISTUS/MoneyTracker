import React from 'react';
import { createIcon, PrimitiveIcon } from '@gluestack-ui/icon';

type IconProps = React.ComponentPropsWithoutRef<typeof PrimitiveIcon> & {
  as?: React.ElementType;
  className?: string;
};

const Icon = React.forwardRef(function Icon(
  { as: Component, ...props }: IconProps,
  ref: React.Ref<React.ComponentRef<typeof PrimitiveIcon>>,
) {
  if (Component) {
    return <Component ref={ref} {...props} />;
  }
  return <PrimitiveIcon ref={ref} {...props} />;
});

Icon.displayName = 'Icon';

export { Icon, createIcon, PrimitiveIcon };
