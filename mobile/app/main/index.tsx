import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../src/stores/dataStore';
import { Text } from '../../components/ui/text';
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
  const insets = useSafeAreaInsets();
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
      <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
        <View className="pt-16">
          <Loading message="Загрузка..." />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        <View className="gap-5">
          <View className="pt-1">
            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-error-500/8 rounded-2xl p-4.5 border border-error-500/15">
                <Text className="text-xs text-error-400 mb-1.5">Потрачено жизни</Text>
                <Text className="text-2xl font-bold text-typography-white">
                  {spentHours > 0 ? formatHours(spentHours) : '—'}
                </Text>
                {hourlyRate > 0 && (
                  <Text className="text-xs text-typography-400 mt-1">
                    {hourlyRate.toFixed(0)} ₽/ч
                  </Text>
                )}
              </View>

              <View className="flex-1 bg-success-500/8 rounded-2xl p-4.5 border border-success-500/15">
                <Text className="text-xs text-success-400 mb-1.5">Сохранено</Text>
                <Text className="text-2xl font-bold text-typography-white">
                  {savedHours > 0 ? formatHours(savedHours) : '—'}
                </Text>
                <Text className="text-xs text-typography-400 mt-1">
                  {wishlist.filter((w) => w.status === 'REJECTED').length} отказов
                </Text>
              </View>
            </View>
          </View>

          {readyItems.length > 0 && (
            <View>
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="text-base font-semibold text-warning-400">Решите сейчас</Text>
                <Pressable onPress={() => router.push('/main/wishlist/' as never)}>
                  <Text className="text-xs text-primary-400">Все желания</Text>
                </Pressable>
              </View>

              <View className="gap-2.5">
                {readyItems.map((item) => {
                  const hours = hourlyRate > 0 ? (item.price / 100) / hourlyRate : 0;
                  return (
                    <View
                      key={item.id}
                      className="bg-warning-500/6 rounded-2xl p-4.5 border border-warning-500/15"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-typography-white">
                            {item.name}
                          </Text>
                          {item.description ? (
                            <Text className="text-xs text-typography-400 mt-0.5" numberOfLines={1}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                        <View className="items-end">
                          <Text className="text-lg font-bold text-warning-400">
                            {hours > 0 ? formatHours(hours) : formatCurrency(item.price)}
                          </Text>
                          <Text className="text-xs text-typography-400">
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row gap-2.5">
                        <TouchableOpacity
                          onPress={() => handleReject(item)}
                          className="flex-[1.2] bg-success-500 rounded-[14px] py-3.5 items-center"
                        >
                          <Text className="text-base font-bold text-typography-white">Не нужно</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleBuy(item)}
                          className="flex-[0.8] bg-error-500/15 rounded-[14px] py-3.5 items-center border border-error-500/30"
                        >
                          <Text className="text-base font-semibold text-error-400">Купить</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {pendingItems.length > 0 && (
            <View>
              <Text className="text-base font-semibold text-typography-400 mb-2.5">Остывает</Text>

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
                      className="w-[150px] bg-background-50/30 rounded-2xl p-4 border border-outline-200 opacity-75"
                    >
                      <Text className="text-sm font-medium text-typography-white" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-typography-400 mt-1">
                        {hours > 0 ? `${formatHours(hours)}` : formatCurrency(item.price)}
                      </Text>
                      <View className="mt-3 bg-info-500/10 rounded-lg px-2 py-1 self-start">
                        <Text className="text-xs font-medium text-info-400">
                          {daysLeft === 0 ? 'Сегодня' : `${daysLeft} дн.`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View className="gap-2.5 pt-1">
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => router.push('/main/transactions/create?income')}
                className="flex-1 bg-success-500/10 rounded-[14px] py-4 items-center border border-success-500/20"
              >
                <Text className="text-lg font-bold text-success-400">+</Text>
                <Text className="text-xs text-success-400 mt-0.5">Доход</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAddWish(true)}
                className="flex-[1.5] bg-info-500/10 rounded-[14px] py-4 items-center border border-info-500/20"
              >
                <Text className="text-base text-info-400">❄️</Text>
                <Text className="text-xs font-medium text-info-400 mt-0.5">
                  Заморозить желание
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/main/transactions/create?expense')}
                className="flex-1 bg-error-500/10 rounded-[14px] py-4 items-center border border-error-500/20"
              >
                <Text className="text-lg font-bold text-error-400">−</Text>
                <Text className="text-xs text-error-400 mt-0.5">Трата</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {showAddWish && (
        <KeyboardAvoidingView
          className="absolute inset-0 bg-background-0"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-row justify-between items-center px-4 pt-4" style={{ paddingTop: insets.top }}>
            <TouchableOpacity onPress={() => setShowAddWish(false)}>
              <Text className="text-lg text-typography-400">Отмена</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-typography-white">Заморозить желание</Text>
            <View className="w-[60px]" />
          </View>

          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          >
            <View className="p-4 gap-5">
            <View>
              <Text className="text-sm text-typography-400 mb-2">Что хотите?</Text>
              <TextInput
                value={wishName}
                onChangeText={setWishName}
                placeholder="Например: AirPods Pro"
                placeholderTextColor="#8E8E93"
                autoFocus
                className="bg-background-50 rounded-xl px-4 py-4 text-typography-white text-lg"
              />
            </View>

            <View>
              <Text className="text-sm text-typography-400 mb-2">Сколько стоит? (₽)</Text>
              <TextInput
                value={wishPrice}
                onChangeText={setWishPrice}
                placeholder="25000"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
                className="bg-background-50 rounded-xl px-4 py-4 text-typography-white text-lg"
              />
              {wishPrice && hourlyRate > 0 && (
                <Text className="text-sm text-warning-400 mt-2">
                  = {((parseFloat(wishPrice) || 0) / hourlyRate).toFixed(1)} ч вашей жизни
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm text-typography-400 mb-2">Зачем вам это? *</Text>
              <TextInput
                value={wishDesc}
                onChangeText={setWishDesc}
                placeholder="Объясните, почему эта покупка важна..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                className="bg-background-50 rounded-xl px-4 py-4 text-typography-white text-base min-h-[80px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddWish}
              disabled={!wishName || !wishPrice || !wishDesc.trim()}
              className={`py-4 rounded-2xl items-center mt-2 ${
                !wishName || !wishPrice || !wishDesc.trim()
                  ? 'bg-typography-500/10'
                  : 'bg-info-400'
              }`}
            >
              <Text className="text-lg font-bold text-typography-white">
                Заморозить на 7 дней
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-typography-400 text-center">
              Через 7 дней вы решите — нужно ли это вам
            </Text>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
