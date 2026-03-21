import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withTiming(0.3, { duration: 800 }),
        -1,
        true
      ),
    };
  });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.backgroundTertiary },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard({ height = 80, style }: { height?: number; style?: object }) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      <View style={styles.cardContent}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={styles.textContainer}>
          <Skeleton width={SCREEN_WIDTH * 0.35} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width={SCREEN_WIDTH * 0.25} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3, itemHeight = 80 }: { count?: number; itemHeight?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} height={itemHeight} style={{ marginBottom: 12 }} />
      ))}
    </>
  );
}

export function SkeletonStatsRow({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.statsRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statItem}>
          <Skeleton width={SCREEN_WIDTH - 48} height={60} borderRadius={16} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonTransactionList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.transactionItem}>
          <Skeleton width={44} height={44} borderRadius={12} />
          <View style={styles.transactionContent}>
            <Skeleton width={SCREEN_WIDTH * 0.45} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
            <Skeleton width={SCREEN_WIDTH * 0.25} height={12} borderRadius={4} />
          </View>
          <Skeleton width={80} height={20} borderRadius={4} />
        </View>
      ))}
    </>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <View style={[styles.chart, { height }]}>
      <View style={styles.chartHeader}>
        <Skeleton width={120} height={20} borderRadius={4} />
        <Skeleton width={60} height={16} borderRadius={4} />
      </View>
      <View style={styles.chartBars}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={styles.chartBarContainer}>
            <Skeleton
              width={24}
              height={Math.random() * 100 + 50}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  transactionContent: {
    flex: 1,
    marginLeft: 12,
  },
  chart: {
    borderRadius: 16,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
});
