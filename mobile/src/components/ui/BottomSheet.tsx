import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from './Text';
import { Icon } from './Icon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const BottomSheet: React.FC<BottomSheetProps> = React.memo(
  ({ visible, onClose, title, children, style }) => {
    const { spacing, borderRadius: br, colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={onClose}
        >
          <Pressable
            style={[
              {
                backgroundColor: '#111118',
                borderTopLeftRadius: br.xl,
                borderTopRightRadius: br.xl,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
                paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.lg),
                maxHeight: SCREEN_HEIGHT * 0.85,
              },
              style,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignSelf: 'center',
                marginBottom: spacing.lg,
              }}
            />
            {title && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.xl,
                }}
              >
                <Text size="xl" weight="bold">
                  {title}
                </Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Icon name="close" size={22} color="#A1A1AA" />
                </Pressable>
              </View>
            )}
            {children}
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);
