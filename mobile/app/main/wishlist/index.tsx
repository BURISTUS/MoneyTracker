import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/utils/ThemeContext';
import { WishlistStatus } from '../../../src/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount);
}

export default function WishlistScreen() {
  const { colors } = useTheme();
  const { wishlist, earnedAchievements, challenges, activeChallenges } = useDataStore();
  const [activeTab, setActiveTab] = useState<'wishlist' | 'achievements' | 'challenges'>('wishlist');

  const tabs = [
    { id: 'wishlist', label: 'Инкубатор', icon: 'bulb' },
    { id: 'achievements', label: 'Достижения', icon: 'trophy' },
    { id: 'challenges', label: 'Челленджи', icon: 'flame' },
  ];

  const tierColors = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2',
  };

  const challengeTypes = {
    PERSONAL: { icon: 'person', color: '#007AFF' },
    FAMILY: { icon: 'people', color: '#34C759' },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFFFFF' : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'wishlist' ? (
          <>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist Инкубатор</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Подожди 7 дней перед покупкой
              </Text>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{wishlist.filter(w => w.status === WishlistStatus.PENDING).length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>В ожидании</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{wishlist.filter(w => w.status === WishlistStatus.READY).length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Готовы к покупке</Text>
              </View>
            </Animated.View>

            {/* Wishlist Items */}
            {wishlist.map((item, index) => {
              const canPurchase = item.status === WishlistStatus.READY;
              return (
                <Animated.View key={item.id} entering={FadeInDown.duration(300).delay((index + 2) * 50)} style={[styles.wishlistCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.wishlistHeader}>
                    <View style={styles.wishlistInfo}>
                      <Text style={[styles.wishlistName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.wishlistCategory, { color: colors.textSecondary }]}>{item.category}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: canPurchase ? '#34C75915' : '#FF950015' }]}>
                      <Text style={[styles.statusText, { color: canPurchase ? '#34C759' : '#FF9500' }]}>
                        {canPurchase ? 'Готово!' : 'В ожидании'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.wishlistPrice, { color: colors.text }]}>{formatCurrency(item.price)}</Text>
                  
                  <View style={styles.wishlistFooter}>
                    <View style={styles.cooldown}>
                      <Ionicons name="time" size={14} color={colors.textSecondary} />
                      <Text style={[styles.cooldownText, { color: colors.textSecondary }]}>
                        {canPurchase ? 'Можно покупать!' : `Осталось дней: ${item.cooldownDays}`}
                      </Text>
                    </View>
                    <View style={styles.wishlistActions}>
                      {canPurchase && (
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                          <Text style={styles.actionButtonText}>Купить</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.rejectButton, { backgroundColor: colors.danger + '15' }]}>
                        <Ionicons name="close" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </>
        ) : activeTab === 'achievements' ? (
          <>
            {/* Achievements Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.achievementHeader, { backgroundColor: colors.primary }]}>
              <LinearGradient colors={['#FFD700', '#FFA500']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.achievementGradient}>
                <Ionicons name="trophy" size={40} color="#FFFFFF" />
                <Text style={styles.achievementTitle}>Достижения</Text>
                <Text style={styles.achievementSubtitle}>{earnedAchievements.length} из 6 получено</Text>
              </LinearGradient>
            </Animated.View>

            {/* Achievements List */}
            {['1', '2', '3', '4', '5', '6'].map((id) => {
              const achievement = [
                { id: '1', name: 'Первый шаг', description: 'Добавьте первую транзакцию', xpReward: 50, tier: 'BRONZE' },
                { id: '2', name: 'Накопитель', description: 'Накопите 10 000 ₽', xpReward: 100, tier: 'BRONZE' },
                { id: '3', name: 'Недельная серия', description: '7 дней подряд', xpReward: 150, tier: 'SILVER' },
                { id: '4', name: 'Месячная серия', description: '30 дней подряд', xpReward: 500, tier: 'GOLD' },
                { id: '5', name: 'Мастер бюджета', description: 'Создайте 5 бюджетов', xpReward: 200, tier: 'SILVER' },
                { id: '6', name: 'Убийца желаний', description: 'Отклоните 10 желаний', xpReward: 300, tier: 'GOLD' },
              ].find(a => a.id === id);
              
              if (!achievement) return null;
              const isEarned = earnedAchievements.includes(id);
              const tierColor = tierColors[achievement.tier as keyof typeof tierColors] || '#CD7F32';

              return (
                <Animated.View key={id} entering={FadeInDown.duration(300).delay(parseInt(id) * 50)} style={[styles.achievementCard, { backgroundColor: colors.surface }]}>
                  <View style={[styles.achievementIcon, { backgroundColor: isEarned ? tierColor + '20' : colors.backgroundTertiary }]}>
                    {isEarned ? (
                      <LinearGradient colors={[tierColor, tierColor]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.earnedBadge}>
                        <Ionicons name="trophy" size={24} color="#FFFFFF" />
                      </LinearGradient>
                    ) : (
                      <Ionicons name="lock-closed" size={24} color={colors.textTertiary} />
                    )}
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, { color: colors.text }]}>{achievement.name}</Text>
                    <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>{achievement.description}</Text>
                    <View style={styles.achievementMeta}>
                      <View style={[styles.tierBadge, { backgroundColor: tierColor + '15' }]}>
                        <Text style={[styles.tierText, { color: tierColor }]}>{achievement.tier}</Text>
                      </View>
                      <Text style={[styles.xpReward, { color: colors.xpGold }]}>+{achievement.xpReward} XP</Text>
                    </View>
                  </View>
                  {isEarned && <Ionicons name="checkmark-circle" size={24} color={colors.success} />}
                </Animated.View>
              );
            })}
          </>
        ) : (
          <>
            {/* Challenges Tab */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Челленджи</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Испытай себя и получай награды</Text>
            </Animated.View>

            {activeChallenges.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Активные ({activeChallenges.length})</Text>
                {activeChallenges.map((challenge, index) => {
                  const typeConfig = challengeTypes[challenge.type as keyof typeof challengeTypes] || challengeTypes.PERSONAL;
                  const progress = Math.random() * 100;
                  return (
                    <Animated.View key={challenge.id} entering={FadeInDown.duration(300).delay(index * 50)} style={[styles.challengeCard, { backgroundColor: colors.primary }]}>
                      <View style={styles.challengeHeader}>
                        <View style={[styles.challengeIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Ionicons name={typeConfig.icon as any} size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.challengeInfo}>
                          <Text style={styles.challengeTitle}>{challenge.name}</Text>
                          <Text style={styles.challengeSubtitle}>{challenge.description}</Text>
                        </View>
                      </View>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Прогресс</Text>
                        <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#FFFFFF' }]} />
                      </View>
                    </Animated.View>
                  );
                })}
              </Animated.View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Доступные</Text>
            {challenges.map((challenge, index) => {
              const isActive = activeChallenges.some(ac => ac.id === challenge.id);
              const typeConfig = challengeTypes[challenge.type as keyof typeof challengeTypes] || challengeTypes.PERSONAL;
              
              if (isActive) return null;

              return (
                <Animated.View key={challenge.id} entering={FadeInDown.duration(300).delay((index + 3) * 50)} style={[styles.availableChallenge, { backgroundColor: colors.surface }]}>
                  <View style={[styles.challengeIcon, { backgroundColor: typeConfig.color + '15' }]}>
                    <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
                  </View>
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeName, { color: colors.text }]}>{challenge.name}</Text>
                    <Text style={[styles.challengeDesc, { color: colors.textSecondary }]}>{challenge.description}</Text>
                  </View>
                  <TouchableOpacity style={[styles.joinButton, { backgroundColor: colors.primary }]}>
                    <Text style={styles.joinButtonText}>Присоединиться</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  tabsContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 14, gap: 6 },
  tabText: { fontSize: 12, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  wishlistCard: { borderRadius: 20, padding: 16, marginBottom: 12 },
  wishlistHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  wishlistInfo: { flex: 1 },
  wishlistName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  wishlistCategory: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  wishlistPrice: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  wishlistFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cooldown: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cooldownText: { fontSize: 12 },
  wishlistActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  rejectButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  achievementHeader: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  achievementGradient: { padding: 24, alignItems: 'center' },
  achievementTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  achievementSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  achievementCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12 },
  achievementIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  earnedBadge: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  achievementDesc: { fontSize: 13, marginBottom: 8 },
  achievementMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tierText: { fontSize: 11, fontWeight: '600' },
  xpReward: { fontSize: 12, fontWeight: '600' },
  challengeCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  challengeIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  challengeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  progressValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressFill: { height: '100%', borderRadius: 3 },
  availableChallenge: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12 },
  challengeName: { fontSize: 15, fontWeight: '600' },
  challengeDesc: { fontSize: 12, marginTop: 2 },
  joinButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  joinButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
