import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../../utils/theme';
import { Achievement } from '../../utils/theme';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked?: boolean;
  onPress?: () => void;
}

export function AchievementCard({ achievement, isUnlocked = false, onPress }: AchievementCardProps) {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  
  const typeIcons = {
    milestone: 'flag',
    streak: 'flame',
    challenge: 'trophy',
    special: 'star',
  };

  const typeColors = {
    milestone: '#667eea',
    streak: '#FF6B35',
    challenge: '#FFD700',
    special: '#9D7BBD',
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {isUnlocked ? (
          <LinearGradient
            colors={typeColors[achievement.type] === '#FFD700' ? ['#FFD700', '#FFA500'] : [typeColors[achievement.type], typeColors[achievement.type]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={typeIcons[achievement.type] as any} size={24} color="#FFFFFF" />
          </LinearGradient>
        ) : (
          <View style={[styles.iconLocked, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name={typeIcons[achievement.type] as any} size={24} color={colors.textTertiary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{achievement.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{achievement.description}</Text>
        <View style={styles.rewardRow}>
          <Ionicons name="star" size={14} color={colors.xpGold} />
          <Text style={[styles.rewardText, { color: isUnlocked ? colors.xpGold : colors.textTertiary }]}>
            +{achievement.xpReward} XP
          </Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        {isUnlocked ? (
          <View style={[styles.unlockedBadge, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
        ) : (
          <Text style={[styles.requirement, { color: colors.textTertiary }]}>
            {achievement.requirement}x
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function AchievementCardCompact({ achievement, progress }: { achievement: Achievement; progress: number }) {
  const systemColorScheme = useColorScheme();
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  
  const typeColors = {
    milestone: '#667eea',
    streak: '#FF6B35',
    challenge: '#FFD700',
    special: '#9D7BBD',
  };

  return (
    <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
      <View style={[styles.compactIcon, { backgroundColor: typeColors[achievement.type] + '15' }]}>
        <Ionicons name="trophy" size={16} color={typeColors[achievement.type]} />
      </View>
      <View style={styles.compactContent}>
        <Text style={[styles.compactTitle, { color: colors.text }]}>{achievement.title}</Text>
        <View style={[styles.compactProgress, { backgroundColor: colors.backgroundTertiary }]}>
          <LinearGradient
            colors={[typeColors[achievement.type], typeColors[achievement.type]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.compactProgressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
          />
        </View>
      </View>
      <Text style={[styles.compactPercent, { color: colors.textSecondary }]}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusContainer: {
    marginLeft: 12,
  },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirement: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  compactProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactPercent: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});
