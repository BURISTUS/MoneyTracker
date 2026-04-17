import React from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  View,
  type StyleProp,
  type ViewStyle,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Loading } from './Loading';

interface ScreenProps extends Omit<ScrollViewProps, 'style'> {
  children: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const Screen: React.FC<ScreenProps> = React.memo(
  ({
    children,
    scroll = true,
    loading = false,
    refreshing = false,
    onRefresh,
    header,
    style,
    contentStyle,
    ...rest
  }) => {
    const { spacing, colors } = useTheme();
    const insets = useSafeAreaInsets();

    const content = (
      <View
        style={[
          {
            flex: 1,
            paddingTop: insets.top,
            backgroundColor: colors.bg.primary,
          },
          style,
        ]}
      >
        {header}
        {loading ? (
          <Loading />
        ) : scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              {
                paddingHorizontal: spacing.xl,
                paddingBottom: insets.bottom + spacing.xxl + 60,
              },
              contentStyle,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
              ) : undefined
            }
            {...rest}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              {
                flex: 1,
                paddingHorizontal: spacing.xl,
                paddingBottom: insets.bottom + spacing.xxl + 60,
              },
              contentStyle,
            ]}
          >
            {children}
          </View>
        )}
      </View>
    );

    return content;
  },
);
