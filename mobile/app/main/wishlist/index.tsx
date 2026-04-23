import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';
import { WishlistStatus as WishlistStatusEnum } from '../../../src/types';
import wishlistService from '../../../src/services/wishlist';
import type { WishlistItem } from '../../../src/types';

function formatLifeHours(amountKopecks: number, hourlyRateRubles: number): string | null {
  if (hourlyRateRubles <= 0) return null;
  const rubles = amountKopecks / 100;
  const hours = rubles / hourlyRateRubles;
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}

function getDaysLeft(cooldownEnds: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(cooldownEnds).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
}

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const wishlist = useDataStore((s) => s.wishlist);
  const updateWishlistItem = useDataStore((s) => s.updateWishlistItem);
  const fetchWishlist = useDataStore((s) => s.fetchWishlist);
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ? user.hourlyRate / 100 : 0);
  }, [getHourlyRate, user?.hourlyRate]);

  const activeItems = useMemo(() => {
    return wishlist
      .filter((item) => item.status === 'PENDING' || item.status === 'READY')
      .sort((a, b) => new Date(a.cooldownEnds).getTime() - new Date(b.cooldownEnds).getTime());
  }, [wishlist]);

  const historyItems = useMemo(() => {
    return wishlist
      .filter((item) => item.status === 'REJECTED' || item.status === 'PURCHASED')
      .sort((a, b) => new Date(b.decidedAt || b.createdAt).getTime() - new Date(a.decidedAt || a.createdAt).getTime());
  }, [wishlist]);

  const handleBuy = useCallback(
    async (id: string, name: string, price: number) => {
      const hours = formatLifeHours(price, hourlyRate);
      Alert.alert(
        `Купить ${name}?`,
        `На сумму: ${formatCurrency(price)}${hours ? `\n⏱ ${hours} работы` : ''}`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Купить',
            style: 'destructive',
            onPress: async () => {
              try {
                const isDemoMode = useAuthStore.getState().isDemoMode;
                if (!isDemoMode) {
                  await wishlistService.purchase(id);
                }
                updateWishlistItem(id, {
                  status: WishlistStatusEnum.PURCHASED,
                  purchasedAt: new Date().toISOString(),
                  decidedAt: new Date().toISOString(),
                });
              } catch {
                Alert.alert('Ошибка', 'Не удалось отметить покупку');
              }
            },
          },
        ],
      );
    },
    [updateWishlistItem, hourlyRate],
  );

  const handleReject = useCallback(
    async (id: string, name: string) => {
      Alert.alert(
        `Отказаться от ${name}?`,
        'Вы экономите деньги! Это добавит XP.',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Отказаться',
            onPress: async () => {
              try {
                const isDemoMode = useAuthStore.getState().isDemoMode;
                if (!isDemoMode) {
                  await wishlistService.reject(id);
                }
                updateWishlistItem(id, {
                  status: WishlistStatusEnum.REJECTED,
                  decidedAt: new Date().toISOString(),
                });
              } catch {
                Alert.alert('Ошибка', 'Не удалось обновить');
              }
            },
          },
        ],
      );
    },
    [updateWishlistItem],
  );

  const handleAddItem = useCallback(async () => {
    if (!newName || !newPrice || !newDescription.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const price = Math.round(parseFloat(newPrice) * 100);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Ошибка', 'Введите корректную цену');
      return;
    }

    const cooldownDays = 7;
    const cooldownEnds = new Date();
    cooldownEnds.setDate(cooldownEnds.getDate() + cooldownDays);

    await useDataStore.getState().addWishlistItem({
      id: `wish_${Date.now()}`,
      userId: user?.id || '',
      name: newName,
      price,
      description: newDescription.trim(),
      imageUrl: null,
      category: null,
      status: WishlistStatusEnum.PENDING,
      cooldownDays,
      createdAt: new Date().toISOString(),
      cooldownEnds: cooldownEnds.toISOString(),
      decidedAt: null,
      purchasedAt: null,
    });

    setNewName('');
    setNewPrice('');
    setNewDescription('');
    setShowAddModal(false);
    Alert.alert('Добавлено!', `Подождите ${cooldownDays} дней перед покупкой`);
  }, [newName, newPrice, newDescription, user?.id]);

  const renderActiveItem = useCallback(
    ({ item }: { item: WishlistItem }) => {
      const hoursCost = formatLifeHours(item.price, hourlyRate);
      const daysLeft = getDaysLeft(item.cooldownEnds);
      const isReady = item.status === 'READY' || daysLeft === 0;

      return (
        <View
          className={`rounded-2xl p-4 mx-4 mb-3 ${
            isReady ? 'bg-success-500/10 border border-success-500/30' : 'bg-background-50/30'
          }`}
        >
          <View className="flex-row gap-3">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${isReady ? 'bg-success-500/20' : 'bg-primary-500/15'}`}>
              <Text className="text-2xl">{isReady ? '🔥' : '🧊'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-typography-white">
                {item.name}
              </Text>
              {item.description ? (
                <Text className="text-sm text-typography-400 mt-0.5" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text className="text-lg font-bold text-error-400 mt-1">
                {formatCurrency(item.price)}{hoursCost ? ` ⏱ / ${hoursCost} работы` : ''}
              </Text>
            </View>
          </View>

          <View className="mt-3">
            {isReady ? (
              <View className="bg-success-500/15 rounded-xl p-2.5 mb-3">
                <Text className="text-sm font-medium text-success-400">
                  ✅ Готово к решению!
                </Text>
              </View>
            ) : (
              <View className="bg-warning-500/10 rounded-xl p-2.5 mb-3">
                <Text className="text-sm text-warning-400">
                  ⏳ {daysLeft === 1 ? 'Завтра можно решить' : `${daysLeft} дн. до решения`}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleReject(item.id, item.name)}
                className="flex-1 bg-success-500/15 rounded-xl py-3 items-center"
              >
                <Text className="text-base font-semibold text-success-400">
                  Не нужно
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBuy(item.id, item.name, item.price)}
                disabled={!isReady}
                className="flex-1 rounded-xl py-3 items-center"
                style={{
                  backgroundColor: isReady ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                  opacity: isReady ? 1 : 0.4,
                }}
              >
                <Text className={`text-base font-semibold ${isReady ? 'text-error-400' : 'text-typography-400'}`}>
                  Купить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [handleBuy, handleReject, hourlyRate],
  );

  const renderHistoryItem = useCallback(
    ({ item }: { item: WishlistItem }) => {
      const isPurchased = item.status === 'PURCHASED';
      return (
        <View className="flex-row items-center gap-3 px-4 py-2.5 mx-4 mb-1 rounded-xl bg-background-50/20">
          <Text className="text-base">{isPurchased ? '🛒' : '💪'}</Text>
          <View className="flex-1">
            <Text className="text-sm text-typography-white">{item.name}</Text>
            <Text className="text-xs text-typography-400">{formatCurrency(item.price)}</Text>
          </View>
          <Text className={`text-xs font-medium ${isPurchased ? 'text-typography-400' : 'text-success-400'}`}>
            {isPurchased ? 'Куплено' : 'Экономия'}
          </Text>
        </View>
      );
    },
    [],
  );

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-4 pb-2 pt-2">
          <Text className="text-xl font-bold text-typography-white">
            Инкубатор
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="w-9 h-9 rounded-full bg-primary-500 items-center justify-center"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {activeItems.length === 0 && historyItems.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-3xl mb-4">🧊</Text>
            <Text className="text-lg text-typography-white mb-2">
              Инкубатор пуст
            </Text>
            <Text className="text-base text-typography-400 mb-6">
              Заморозьте желание и подождите 7 дней
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary-500 rounded-xl"
            >
              <Text className="text-base font-bold text-typography-white">Заморозить желание</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={activeItems}
              keyExtractor={(item) => item.id}
              renderItem={renderActiveItem}
              contentContainerStyle={{ paddingTop: 4, paddingBottom: 8 }}
              ListFooterComponent={
                historyItems.length > 0 ? (
                  <View className="mt-2">
                    <TouchableOpacity
                      onPress={() => setShowHistory((v) => !v)}
                      className="flex-row items-center justify-between px-4 py-3"
                      activeOpacity={0.6}
                    >
                      <Text className="text-sm font-medium text-typography-400">
                        История ({historyItems.length})
                      </Text>
                      <Ionicons
                        name={showHistory ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#8C8C8C"
                      />
                    </TouchableOpacity>
                    {showHistory && (
                      <View>
                        {historyItems.map((item) => (
                          <View key={item.id}>{renderHistoryItem({ item })}</View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null
              }
            />
          </>
        )}
      </View>

      {showAddModal && (
        <View className="absolute inset-0 bg-background-0" style={{ paddingTop: insets.top }}>
          <View className="flex-row justify-between items-center px-4 py-3">
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text className="text-base text-typography-400">← Назад</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-typography-white">Новое желание</Text>
            <View className="w-[60px]" />
          </View>

          <View className="p-4 gap-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <View>
              <Text className="text-sm text-typography-400 mb-2">Что хотите?</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Например: AirPods Pro"
                placeholderTextColor="#8E8E93"
                autoFocus
                className="bg-background-50/50 rounded-xl px-4 py-4 text-typography-white text-lg"
              />
            </View>

            <View>
              <Text className="text-sm text-typography-400 mb-2">Сколько стоит? (₽)</Text>
              <TextInput
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="25000"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
                className="bg-background-50/50 rounded-xl px-4 py-4 text-typography-white text-lg"
              />
              {newPrice && hourlyRate > 0 && (
                <Text className="text-sm text-warning-400 mt-2">
                  ⏱ Это {formatLifeHours(Math.round(parseFloat(newPrice) * 100), hourlyRate)} вашей работы
                </Text>
              )}
            </View>

            <View>
              <Text className="text-sm text-typography-400 mb-2">Зачем вам это? *</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Объясните, почему эта покупка важна..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                className="bg-background-50/50 rounded-xl px-4 py-4 text-typography-white text-base min-h-[80px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddItem}
              disabled={!newName || !newPrice || !newDescription.trim()}
              className={`py-4 rounded-2xl items-center mt-5 ${
                !newName || !newPrice || !newDescription.trim() ? 'bg-background-50/30' : 'bg-primary-500'
              }`}
            >
              <Text className="text-lg font-bold text-typography-white">
                Заморозить на 7 дней
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-typography-400 text-center mt-2">
              Через 7 дней вы решите: купить или отказаться
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
