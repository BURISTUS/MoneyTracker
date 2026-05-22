import React from 'react';
import { View, Image, Text as RNText } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const avatarStyle = tva({
  base: 'rounded-full items-center justify-center overflow-hidden bg-background-200',
  variants: {
    size: {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
      xl: 'h-20 w-20',
    },
  },
});

const avatarFallbackTextStyle = tva({
  base: 'font-body font-bold text-typography-700',
  variants: {
    size: {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
});

const avatarBadgeStyle = tva({
  base: 'absolute bottom-0 right-0 rounded-full border-2 border-background-0',
  variants: {
    size: {
      xs: 'h-2 w-2',
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
    },
  },
});

type AvatarProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

type AvatarImageProps = React.ComponentProps<typeof Image> & {
  className?: string;
};

type AvatarFallbackTextProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: string;
};

type AvatarBadgeProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const AvatarImage = React.forwardRef<Image, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <Image
      ref={ref}
      className={`h-full w-full rounded-full ${className || ''}`}
      {...props}
    />
  ),
);

AvatarImage.displayName = 'AvatarImage';

const AvatarFallbackText = React.forwardRef<View, AvatarFallbackTextProps>(
  ({ className, size = 'md', children }, ref) => {
    const initials = children
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View ref={ref} className="flex-1 items-center justify-center">
        <RNText className={avatarFallbackTextStyle({ size, class: className })}>
          {initials}
        </RNText>
      </View>
    );
  },
);

AvatarFallbackText.displayName = 'AvatarFallbackText';

const AvatarBadge = React.forwardRef<View, AvatarBadgeProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <View
      ref={ref}
      className={avatarBadgeStyle({
        size,
        class: `bg-success-500 ${className || ''}`,
      })}
      {...props}
    />
  ),
);

AvatarBadge.displayName = 'AvatarBadge';

type AvatarComponentType = React.FC<AvatarProps> & {
  Image: typeof AvatarImage;
  FallbackText: typeof AvatarFallbackText;
  Badge: typeof AvatarBadge;
};

const Avatar = React.forwardRef<View, AvatarProps>(
  ({ className, size = 'md', children, ...props }, ref) => (
    <View
      ref={ref}
      className={avatarStyle({ size, class: className })}
      {...props}
    >
      {children}
    </View>
  ),
) as unknown as AvatarComponentType;

Avatar.displayName = 'Avatar';

(Avatar as AvatarComponentType).Image = AvatarImage;
(Avatar as AvatarComponentType).FallbackText = AvatarFallbackText;
(Avatar as AvatarComponentType).Badge = AvatarBadge;

export {
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  AvatarBadge,
  avatarStyle,
  avatarFallbackTextStyle,
  avatarBadgeStyle,
};
