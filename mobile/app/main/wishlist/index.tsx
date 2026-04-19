import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, FlatList, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Icon } from '../../../src/components/ui/Icon';
import { useTheme } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/formatters';
import type { WishlistStatus } from '../../../src/types';
import { WishlistStatus as WishlistStatusEnum } from '../../../src/types';

type TabType = 'all' | 'pending' | 'history';

export default function WishlistScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const wishlist = useDataStore((s) => s.wishlist);
  const updateWishlistItem = useDataStore((s) => s.updateWishlistItem);
  const addTransaction = useDataStore((s) => s.addTransaction);
  const accounts = useDataStore((s) => s.accounts);
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [tab, setTab] = useState<TabType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ? user.hourlyRate / 100 : 0);
  }, [getHourlyRate, user?.hourlyRate]);

  const filteredItems = useMemo(() => {
    if (tab === 'all') return wishlist;
    if (tab === 'pending') {
      return wishlist.filter((item) => item.status === 'PENDING' || item.status === 'READY');
    }
    return wishlist.filter(
      (item) => item.status === 'REJECTED' || item.status === 'PURCHASED',
    );
  }, [wishlist, tab]);

  const handleBuy = useCallback(
    async (id: string, name: string, price: number) => {
      Alert.alert(
        `Купить ${name}?`,
        `На сумму: ${formatCurrency(price)}${hourlyRate > 0 ? `\n⏱ ${(price / 100 / hourlyRate).toFixed(1)} часов работы` : ''}`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Купить',
            style: 'destructive',
            onPress: async () => {
              try {
                await updateWishlistItem(id, {
                  status: WishlistStatusEnum.PURCHASED,
                  purchasedAt: new Date().toISOString(),
                });
                Alert.alert('Успешно!', 'Покупка добавлена в историю');
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
                await updateWishlistItem(id, {
                  status: WishlistStatusEnum.REJECTED,
                  decidedAt: new Date().toISOString(),
                });
                Alert.alert('Умный выбор! 💪', 'Вы сэкономили деньги');
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

  const handleAddItem = useCallback(() => {
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

    useDataStore.getState().addWishlistItem({
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
  }, [newName, newPrice, user?.id]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const priceRub = item.price / 100;
      const hoursCost = hourlyRate > 0 ? (priceRub / hourlyRate).toFixed(1) : null;
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(item.cooldownEnds).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      const isPending = item.status === 'PENDING' || item.status === 'READY';

      return (
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 16,
            padding: 16,
            marginHorizontal: spacing.md,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xxxl">🎁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text size="lg" weight="semibold" style={{ color: '#FFFFFF' }}>
                {item.name}
              </Text>
              {item.description ? (
                <Text size="sm" style={{ color: '#8E8E93', marginTop: 2 }} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text size="xl" weight="bold" style={{ color: '#6366F1', marginTop: 4 }}>
                {formatCurrency(item.price)}
              </Text>
              {hoursCost && (
                <Text size="xs" style={{ color: '#FBBF24', marginTop: 2 }}>
                  ⏱ {hoursCost} ч работы
                </Text>
              )}
            </View>
          </View>

          {isPending && (
            <>
              {item.status === 'READY' ? (
                <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <Text size="md" style={{ color: '#34D399' }}>
                    ✅ Готово к покупке!
                  </Text>
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                  <Text size="md" style={{ color: '#FBBF24' }}>
                    ⏳ {daysLeft === 0 ? 'Сегодня можно купить!' : `${daysLeft} дн. до покупки`}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => handleReject(item.id, item.name)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text size="md" weight="semibold" style={{ color: '#F4F4F5' }}>
                    Отказаться
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleBuy(item.id, item.name, item.price)}
                  disabled={item.status !== 'READY'}
                  style={{
                    flex: 1,
                    backgroundColor: item.status === 'READY' ? '#34D399' : 'rgba(52, 211, 153, 0.3)',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: item.status !== 'READY' ? 0.5 : 1,
                  }}
                >
                  <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>
                    Купить
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!isPending && (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 12, padding: 12 }}>
              <Text size="md" style={{ color: item.status === 'PURCHASED' ? '#34D399' : '#71717A' }}>
                {item.status === 'PURCHASED' ? '✅ Куплено' : '🚫 Отказались'} — экономия {formatCurrency(item.price)}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [spacing.md, handleBuy, handleReject, hourlyRate],
  );

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <Text size="xl" weight="bold" style={{ color: '#FFFFFF' }}>
            Инкубатор желаний
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text size="xxl" style={{ color: '#6366F1' }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Hourly rate info */}
        {hourlyRate > 0 && (
          <View style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <Text size="md">⏱</Text>
            <Text size="sm" style={{ color: '#FBBF24' }}>
              Ваша ставка: {hourlyRate.toFixed(0)} ₽/ч
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 }}>
          {(['all', 'pending', 'history'] as TabType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: tab === t ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                borderWidth: tab === t ? 2 : 0,
                borderColor: tab === t ? '#6366F1' : 'transparent',
              }}
            >
              <Text size="sm" weight={tab === t ? 'semibold' : 'regular'} style={{ color: tab === t ? '#FFFFFF' : '#8E8E93' }}>
                {t === 'all' ? 'Все' : t === 'pending' ? 'Ожидание' : 'История'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* List */}
        {filteredItems.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Text size="xxxl" style={{ marginBottom: 16 }}>🎁</Text>
            <Text size="lg" style={{ color: '#FFFFFF', marginBottom: 8 }}>
              {tab === 'history' ? 'Пока нет истории' : 'Нет желаний'}
            </Text>
            <Text size="md" style={{ color: '#8E8E93', marginBottom: 24 }}>
              {tab === 'history' ? 'Здесь будет история' : 'Добавьте желание и подождите 7 дней'}
            </Text>
            {tab === 'all' && (
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: '#6366F1',
                  borderRadius: 12,
                }}
              >
                <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>Добавить желание</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Add Modal */}
      {showAddModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#0A0A0F',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text size="lg" style={{ color: '#8E8E93' }}>← Назад</Text>
            </TouchableOpacity>
            <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>Новое желание</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={{ padding: 16, gap: 20 }}>
            <View>
              <Text size="sm" style={{ color: '#8E8E93', marginBottom: 8 }}>Что хотите?</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
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
                value={newPrice}
                onChangeText={setNewPrice}
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
              {newPrice && hourlyRate > 0 && (
                <Text size="sm" style={{ color: '#FBBF24', marginTop: 8 }}>
                  ⏱ Это {(parseFloat(newPrice) / hourlyRate).toFixed(1)} часов вашей работы
                </Text>
              )}
            </View>

            <View>
              <Text size="sm" style={{ color: '#8E8E93', marginBottom: 8 }}>Зачем вам это? *</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
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
              onPress={handleAddItem}
              disabled={!newName || !newPrice || !newDescription.trim()}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: !newName || !newPrice || !newDescription.trim() ? 'rgba(255,255,255,0.1)' : '#6366F1',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
                Добавить в инкубатор
              </Text>
            </TouchableOpacity>

            <Text size="xs" style={{ color: '#8E8E93', textAlign: 'center', marginTop: 8 }}>
              Перед покупкой нужно подождать 7 дней — чтобы точно решить, нужно ли это вам
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
