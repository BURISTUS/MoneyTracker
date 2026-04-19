import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/dataStore';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Loading } from '../../src/components/ui/Loading';
import { formatCurrency } from '../../src/utils/formatters';
import { WishlistStatus } from '../../src/types';

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}

export default function HomeScreen() {
  const router = useRouter();
  const initializeData = useDataStore((s) => s.initializeData);
  const transactions = useDataStore((s) => s.transactions);
  const wishlist = useDataStore((s) => s.wishlist);
  const updateWishlistItem = useDataStore((s) => s.updateWishlistItem);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);

  const [refreshing, setRefreshing] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [wishName, setWishName] = useState('');
  const [wishPrice, setWishPrice] = useState('');
  const [wishDesc, setWishDesc] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, []);

  const hourlyRate = useMemo(() => getHourlyRate(), [getHourlyRate]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyExpenses = useMemo(
    () => transactions
      .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const spentHours = useMemo(() => {
    if (hourlyRate <= 0) return 0;
    return (monthlyExpenses / 100) / hourlyRate;
  }, [monthlyExpenses, hourlyRate]);

  const savedHours = useMemo(() => {
    if (hourlyRate <= 0) return 0;
    const rejectedItems = wishlist.filter((w) => w.status === 'REJECTED');
    const totalSavedKopecks = rejectedItems.reduce((sum, w) => sum + w.price, 0);
    return (totalSavedKopecks / 100) / hourlyRate;
  }, [wishlist, hourlyRate]);

  const readyItems = useMemo(
    () => wishlist.filter((w) => w.status === 'READY'),
    [wishlist],
  );

  const pendingItems = useMemo(
    () => wishlist.filter((w) => w.status === 'PENDING').slice(0, 5),
    [wishlist],
  );

  const handleBuy = useCallback(
    (item: typeof wishlist[number]) => {
      Alert.alert(
        `Купить ${item.name}?`,
        hourlyRate > 0
          ? `Это ${formatHours((item.price / 100) / hourlyRate)} вашей жизни`
          : `На сумму ${formatCurrency(item.price)}`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Купить',
            style: 'destructive',
            onPress: () => {
              updateWishlistItem(item.id, {
                status: WishlistStatus.PURCHASED,
                purchasedAt: new Date().toISOString(),
              });
            },
          },
        ],
      );
    },
    [updateWishlistItem, hourlyRate],
  );

  const handleReject = useCallback(
    (item: typeof wishlist[number]) => {
      const hoursSaved = hourlyRate > 0 ? formatHours((item.price / 100) / hourlyRate) : '';
      Alert.alert(
        `Отказаться от ${item.name}?`,
        `Вы сохраните ${hoursSaved || formatCurrency(item.price)} своей жизни!`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Мне это не нужно',
            onPress: () => {
              updateWishlistItem(item.id, {
                status: WishlistStatus.REJECTED,
                decidedAt: new Date().toISOString(),
              });
            },
          },
        ],
      );
    },
    [updateWishlistItem, hourlyRate],
  );

  const handleAddWish = useCallback(() => {
    if (!wishName || !wishPrice || !wishDesc.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const price = Math.round(parseFloat(wishPrice) * 100);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Ошибка', 'Введите корректную цену');
      return;
    }
    const cooldownEnds = new Date();
    cooldownEnds.setDate(cooldownEnds.getDate() + 7);

    useDataStore.getState().addWishlistItem({
      id: `wish_${Date.now()}`,
      userId: '',
      name: wishName,
      price,
      description: wishDesc.trim(),
      imageUrl: null,
      category: null,
      status: WishlistStatus.PENDING,
      cooldownDays: 7,
      createdAt: new Date().toISOString(),
      cooldownEnds: cooldownEnds.toISOString(),
      decidedAt: null,
      purchasedAt: null,
    });

    setWishName('');
    setWishPrice('');
    setWishDesc('');
    setShowAddWish(false);
  }, [wishName, wishPrice, wishDesc]);

  if (isLoading && transactions.length === 0) {
    return (
      <Screen scroll={false}>
        <View style={{ paddingTop: 60 }}>
          <Loading message="Загрузка..." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={{ gap: 20 }}>

        {/* === 1. БАЛАНС ВРЕМЕНИ === */}
        <View style={{ paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 59, 48, 0.08)',
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: 'rgba(255, 59, 48, 0.15)',
            }}>
              <Text size="xs" style={{ color: '#FF3B30', marginBottom: 6 }}>
                Потрачено жизни
              </Text>
              <Text size="xxl" weight="bold" style={{ color: '#FFFFFF' }}>
                {spentHours > 0 ? formatHours(spentHours) : '—'}
              </Text>
              {hourlyRate > 0 && (
                <Text size="xs" style={{ color: '#8E8E93', marginTop: 4 }}>
                  {hourlyRate.toFixed(0)} ₽/ч
                </Text>
              )}
            </View>

            <View style={{
              flex: 1,
              backgroundColor: 'rgba(52, 199, 89, 0.08)',
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: 'rgba(52, 199, 89, 0.15)',
            }}>
              <Text size="xs" style={{ color: '#34C759', marginBottom: 6 }}>
                Сохранено
              </Text>
              <Text size="xxl" weight="bold" style={{ color: '#FFFFFF' }}>
                {savedHours > 0 ? formatHours(savedHours) : '—'}
              </Text>
              <Text size="xs" style={{ color: '#8E8E93', marginTop: 4 }}>
                {wishlist.filter((w) => w.status === 'REJECTED').length} отказов
              </Text>
            </View>
          </View>
        </View>

        {/* === 2. ЗОНА ПРИНЯТИЯ РЕШЕНИЙ === */}
        {readyItems.length > 0 && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text size="md" weight="semibold" style={{ color: '#FBBF24' }}>
                Решите сейчас
              </Text>
              <Pressable onPress={() => router.push('/main/wishlist/' as any)}>
                <Text size="xs" style={{ color: '#6366F1' }}>Все желания</Text>
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {readyItems.map((item) => {
                const hours = hourlyRate > 0 ? (item.price / 100) / hourlyRate : 0;
                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.06)',
                      borderRadius: 16,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: 'rgba(251, 191, 36, 0.15)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#FFFFFF' }}>
                          {item.name}
                        </Text>
                        {item.description ? (
                          <Text size="xs" style={{ color: '#8E8E93', marginTop: 2 }} numberOfLines={1}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text size="lg" weight="bold" style={{ color: '#FBBF24' }}>
                          {hours > 0 ? formatHours(hours) : formatCurrency(item.price)}
                        </Text>
                        <Text size="xs" style={{ color: '#8E8E93' }}>
                          {formatCurrency(item.price)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleReject(item)}
                        style={{
                          flex: 1.2,
                          backgroundColor: '#34C759',
                          borderRadius: 14,
                          paddingVertical: 14,
                          alignItems: 'center',
                        }}
                      >
                        <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>
                          Не нужно
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleBuy(item)}
                        style={{
                          flex: 0.8,
                          backgroundColor: 'rgba(255, 59, 48, 0.15)',
                          borderRadius: 14,
                          paddingVertical: 14,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 59, 48, 0.3)',
                        }}
                      >
                        <Text size="md" weight="semibold" style={{ color: '#FF3B30' }}>
                          Купить
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* === 3. МОРОЗИЛЬНАЯ КАМЕРА === */}
        {pendingItems.length > 0 && (
          <View>
            <Text size="md" weight="semibold" style={{ color: '#8E8E93', marginBottom: 10 }}>
              Остывает
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {pendingItems.map((item) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(item.cooldownEnds).getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                );
                const hours = hourlyRate > 0 ? (item.price / 100) / hourlyRate : 0;

                return (
                  <View
                    key={item.id}
                    style={{
                      width: 150,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                      opacity: 0.75,
                    }}
                  >
                    <Text size="sm" weight="medium" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text size="xs" style={{ color: '#8E8E93', marginTop: 4 }}>
                      {hours > 0 ? `${formatHours(hours)}` : formatCurrency(item.price)}
                    </Text>
                    <View style={{
                      marginTop: 12,
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: 'flex-start',
                    }}>
                      <Text size="xs" weight="medium" style={{ color: '#60A5FA' }}>
                        {daysLeft === 0 ? 'Сегодня' : `${daysLeft} дн.`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* === 4. БЫСТРЫЕ ДЕЙСТВИЯ === */}
        <View style={{ gap: 10, paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/main/transactions/create?income')}
              style={{
                flex: 1,
                backgroundColor: 'rgba(52, 199, 89, 0.1)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(52, 199, 89, 0.2)',
              }}
            >
              <Text size="lg" weight="bold" style={{ color: '#34C759' }}>+</Text>
              <Text size="xs" style={{ color: '#34C759', marginTop: 2 }}>Доход</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAddWish(true)}
              style={{
                flex: 1.5,
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(96, 165, 250, 0.2)',
              }}
            >
              <Text size="lg" style={{ color: '#60A5FA' }}>❄️</Text>
              <Text size="xs" weight="medium" style={{ color: '#60A5FA', marginTop: 2 }}>
                Заморозить желание
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/main/transactions/create?expense')}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 59, 48, 0.2)',
              }}
            >
              <Text size="lg" weight="bold" style={{ color: '#FF3B30' }}>−</Text>
              <Text size="xs" style={{ color: '#FF3B30', marginTop: 2 }}>Трата</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* === МОДАЛКА: Заморозить желание === */}
      {showAddWish && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0A0A0F',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity onPress={() => setShowAddWish(false)}>
              <Text size="lg" style={{ color: '#8E8E93' }}>Отмена</Text>
            </TouchableOpacity>
            <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
              Заморозить желание
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={{ padding: 16, gap: 20 }}>
            <View>
              <Text size="sm" style={{ color: '#8E8E93', marginBottom: 8 }}>Что хотите?</Text>
              <TextInput
                value={wishName}
                onChangeText={setWishName}
                placeholder="Например: AirPods Pro"
                placeholderTextColor="#8E8E93"
                autoFocus
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: '#FFFFFF',
                  fontSize: 18,
                }}
              />
            </View>

            <View>
              <Text size="sm" style={{ color: '#8E8E93', marginBottom: 8 }}>Сколько стоит? (₽)</Text>
              <TextInput
                value={wishPrice}
                onChangeText={setWishPrice}
                placeholder="25000"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: '#FFFFFF',
                  fontSize: 18,
                }}
              />
              {wishPrice && hourlyRate > 0 && (
                <Text size="sm" style={{ color: '#FBBF24', marginTop: 8 }}>
                  = {((parseFloat(wishPrice) || 0) / hourlyRate).toFixed(1)} ч вашей жизни
                </Text>
              )}
            </View>

            <View>
              <Text size="sm" style={{ color: '#8E8E93', marginBottom: 8 }}>Зачем вам это? *</Text>
              <TextInput
                value={wishDesc}
                onChangeText={setWishDesc}
                placeholder="Объясните, почему эта покупка важна..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: '#FFFFFF',
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddWish}
              disabled={!wishName || !wishPrice || !wishDesc.trim()}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: !wishName || !wishPrice || !wishDesc.trim()
                  ? 'rgba(255,255,255,0.1)'
                  : '#60A5FA',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
                Заморозить на 7 дней
              </Text>
            </TouchableOpacity>

            <Text size="xs" style={{ color: '#8E8E93', textAlign: 'center' }}>
              Через 7 дней вы решите — нужно ли это вам
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
