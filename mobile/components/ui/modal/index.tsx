import React from 'react';
import { View, Pressable, Modal as RNModal } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const modalBackdropStyle = tva({
  base: 'absolute inset-0 bg-black/50',
});

const modalContentStyle = tva({
  base: 'rounded-lg bg-background-0 p-6 shadow-hard-2',
  variants: {
    size: {
      sm: 'w-3/4 max-w-sm p-4',
      md: 'w-4/5 max-w-md p-6',
      lg: 'w-11/12 max-w-lg p-8',
      full: 'w-full h-full',
    },
  },
});

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  animationType?: 'none' | 'slide' | 'fade';
};

type ModalBackdropProps = {
  onPress: () => void;
  className?: string;
};

type ModalContentProps = React.ComponentProps<typeof View> & {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
};

type ModalHeaderProps = React.ComponentProps<typeof View> & {
  className?: string;
};

type ModalBodyProps = React.ComponentProps<typeof View> & {
  className?: string;
};

type ModalFooterProps = React.ComponentProps<typeof View> & {
  className?: string;
};

const ModalBackdrop = React.forwardRef<View, ModalBackdropProps>(
  function ModalBackdrop({ onPress, className }, ref) {
    return (
      <Pressable
        ref={ref}
        className={modalBackdropStyle({ class: className })}
        onPress={onPress}
      />
    );
  },
);

ModalBackdrop.displayName = 'ModalBackdrop';

const ModalContent = React.forwardRef<View, ModalContentProps>(
  function ModalContent({ className, size = 'md', ...props }, ref) {
    return (
      <View
        ref={ref}
        className={modalContentStyle({ size, class: className })}
        {...props}
      />
    );
  },
);

ModalContent.displayName = 'ModalContent';

const ModalHeader = React.forwardRef<View, ModalHeaderProps>(
  function ModalHeader({ className, ...props }, ref) {
    return (
      <View ref={ref} className={`mb-4 ${className || ''}`} {...props} />
    );
  },
);

ModalHeader.displayName = 'ModalHeader';

const ModalBody = React.forwardRef<View, ModalBodyProps>(
  function ModalBody({ className, ...props }, ref) {
    return (
      <View ref={ref} className={`mb-4 ${className || ''}`} {...props} />
    );
  },
);

ModalBody.displayName = 'ModalBody';

const ModalFooter = React.forwardRef<View, ModalFooterProps>(
  function ModalFooter({ className, ...props }, ref) {
    return (
      <View
        ref={ref}
        className={`flex-row justify-end gap-2 ${className || ''}`}
        {...props}
      />
    );
  },
);

ModalFooter.displayName = 'ModalFooter';

const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  animationType = 'fade',
}) => (
  <RNModal
    visible={isOpen}
    transparent
    animationType={animationType}
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View className="flex-1 items-center justify-center">
      <ModalBackdrop onPress={onClose} />
      <ModalContent size={size}>{children}</ModalContent>
    </View>
  </RNModal>
);

ModalComponent.displayName = 'Modal';

const Modal = Object.assign(ModalComponent, {
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  modalBackdropStyle,
  modalContentStyle,
};
