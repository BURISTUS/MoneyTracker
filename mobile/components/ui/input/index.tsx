import React from 'react';
import { TextInput, View } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const inputStyle = tva({
  base: 'rounded-lg border border-outline-300 bg-background-0 px-3 py-2 font-body text-typography-900 data-[disabled=true]:opacity-40 data-[focus=true]:border-primary-500 data-[hover=true]:border-outline-400 data-[invalid=true]:border-error-500',
  variants: {
    size: {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
    variant: {
      underlined: 'border-b border-t-0 border-l-0 border-r-0 rounded-none',
      outline: '',
      rounded: 'rounded-full border-outline-300',
    },
  },
});

type InputProps = React.ComponentProps<typeof TextInput> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'underlined' | 'outline' | 'rounded';
  isInvalid?: boolean;
  isDisabled?: boolean;
};

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      className,
      size = 'md',
      variant = 'outline',
      isInvalid = false,
      isDisabled = false,
      editable,
      ...props
    },
    ref,
  ) => {
    return (
      <TextInput
        ref={ref}
        className={inputStyle({
          size,
          variant,
          class: className,
        })}
        editable={isDisabled ? false : editable}
        placeholderTextColor="rgb(var(--color-typography-500)/1)"
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input, inputStyle };
