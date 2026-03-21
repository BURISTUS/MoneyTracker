import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../../utils/theme';
import { getLevelForXP, getXPForLevel } from '../../utils/theme';

interface XPBarProps {
  xp: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function XPBar({ xp, showLabel = true, compact = false }: XPBarProps) {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const level = getLevelForXP(xp);
  const { progress } = getXPForLevel(level, xp);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactBar, { backgroundColor: colors.backgroundTertiary }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.compactFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <Text style={[styles.compactText, { color: colors.textSecondary }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Ionicons name="star" size={16} color={colors.xpGold} />
          <Text style={styles.levelText}>Уровень {level}</Text>
        </View>
        {showLabel && (
          <Text style={[styles.xpText, { color: colors.textSecondary }]}>
            {Math.round(progress * 100)}% до следующего уровня
          </Text>
        )}
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          {xp.toLocaleString()} XP
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          +{Math.round((1 - progress) * getXPForLevel(level, xp).next)} до уровня {level + 1}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  xpText: {
    fontSize: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 11,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  compactFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactText: {
    fontSize: 10,
    fontWeight: '600',
    minWidth: 35,
  },
});
