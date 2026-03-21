import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../../utils/theme';

interface StreakDisplayProps {
  days: number;
  showDetails?: boolean;
}

export function StreakDisplay({ days, showDetails = true }: StreakDisplayProps) {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  
  const isActive = days > 0;
  const streakLevel = days >= 30 ? 'legendary' : days >= 7 ? 'epic' : days >= 3 ? 'active' : 'beginner';
  
  const streakColors = {
    legendary: ['#FFD700', '#FFA500'],
    epic: ['#9D7BBD', '#667eea'],
    active: ['#FF6B35', '#FF8C42'],
    beginner: ['#8B9DF7', '#A8B8F8'],
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <LinearGradient
          colors={streakColors[streakLevel] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fireIcon}
        >
          <Ionicons name="flame" size={24} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakTitle, { color: colors.text }]}>
            {isActive ? 'Серия активна!' : 'Начните серию'}
          </Text>
          {showDetails && (
            <Text style={[styles.streakDescription, { color: colors.textSecondary }]}>
              {isActive 
                ? `Вы добавляете транзакции ${days} дней подряд`
                : 'Добавляйте транзакции каждый день'
              }
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.streakFire }]}>{days}</Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>дней</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            +{days * 5}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>бонус XP</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.xpGold }]}>
            {isActive ? '🔥' : '💤'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
            {streakLevel === 'legendary' ? 'Легенда' : 
             streakLevel === 'epic' ? 'Эпик' : 
             streakLevel === 'active' ? 'Активен' : 'Начните'}
          </Text>
        </View>
      </View>
      
      {isActive && days < 7 && (
        <View style={[styles.progressMiniBar, { backgroundColor: colors.backgroundTertiary }]}>
          <LinearGradient
            colors={streakColors[streakLevel] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressMiniFill, { width: `${Math.min((days / 7) * 100, 100)}%` }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fireIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakDescription: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  progressMiniBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressMiniFill: {
    height: '100%',
    borderRadius: 3,
  },
});
