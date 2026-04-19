import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { Icon } from '../../../src/components/ui/Icon';
import { AccountCard } from '../../../src/components/features/AccountCard';
import { BottomSheet } from '../../../src/components/ui/BottomSheet';
import { Chip } from '../../../src/components/ui/Chip';
import { Header } from '../../../src/components/layout/Header';
import { CurrencyPicker } from '../../../src/components/ui/CurrencyPicker';
import { useTheme } from '../../../src/theme';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../src/utils/formatters';
import type { AccountType } from '../../../src/types';
import { AccountType as AccountTypeEnum } from '../../../src/types';
import type { ExchangeRate } from '../../../src/services/currency';

export default function AccountsScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const accounts = useDataStore((s) => s.accounts);
  const createAccount = useDataStore((s) => s.createAccount);
  const userCurrency = useDataStore((s) => s.userCurrency);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountTypeEnum.BANK);
  const [currency, setCurrency] = useState(userCurrency);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const accountTypes: { value: AccountType; label: string }[] = [
    { value: AccountTypeEnum.CASH, label: 'Наличные' },
    { value: AccountTypeEnum.BANK, label: 'Банковский' },
    { value: AccountTypeEnum.CREDIT, label: 'Кредитный' },
    { value: AccountTypeEnum.INVESTMENT, label: 'Инвестиции' },
    { value: AccountTypeEnum.DEBT, label: 'Долг' },
  ];

  const handleAdd = useCallback(async () => {
    if (!name) return;
    try {
      await createAccount({ name, type, currency });
      setName('');
      setType(AccountTypeEnum.BANK);
      setCurrency(userCurrency);
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  }, [name, type, currency, userCurrency, createAccount]);

  return (
    <Screen scroll header={<Header title="Счета" showBack />}>
      <View style={{ gap: spacing.xl }}>
        <Card variant="glass" padding="xxl">
          <Text size="sm" style={{ color: '#71717A', marginBottom: 8 }}>
            Общий баланс
          </Text>
          <Text preset="h1">{formatCurrency(totalBalance)}</Text>
        </Card>

        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AccountCard account={item} style={{ marginBottom: spacing.md }} />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Icon name="wallet-outline" size={48} color="#52525B" />
              <Text size="md" style={{ color: '#71717A', marginTop: 12 }}>
                Нет счетов
              </Text>
            </View>
          }
        />
      </View>

      <Pressable
        onPress={() => setShowAdd(true)}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#6366F1',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)} title="Новый счёт">
        <View style={{ gap: 16 }}>
          <Input label="Название" value={name} onChangeText={setName} placeholder="Мой счёт" />
          <View style={{ gap: 8 }}>
            <Text size="sm" weight="medium" style={{ color: '#A1A1AA' }}>
              Тип
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {accountTypes.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  selected={type === t.value}
                  onPress={() => setType(t.value)}
                  size="sm"
                />
              ))}
            </View>
          </View>
          <Pressable
            onPress={() => setShowCurrencyPicker(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              paddingHorizontal: 16,
              height: 48,
            }}
          >
            <Text size="sm" weight="medium" style={{ color: '#A1A1AA' }}>
              {t('accounts.currency', 'Валюта')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text size="md" weight="semibold">
                {currency}
              </Text>
              <Icon name="chevron-forward" size={16} color="#71717A" />
            </View>
          </Pressable>
          <Button onPress={handleAdd} fullWidth size="lg" disabled={!name}>
            Создать
          </Button>
        </View>
      </BottomSheet>

      <CurrencyPicker
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(c: ExchangeRate) => setCurrency(c.code)}
        selectedCode={currency}
        title="Валюта счёта"
        filterType="FIAT"
      />
    </Screen>
  );
}
