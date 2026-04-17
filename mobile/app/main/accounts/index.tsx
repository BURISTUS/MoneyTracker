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
import { useTheme } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/formatters';
import type { AccountType } from '../../../src/types';
import { AccountType as AccountTypeEnum } from '../../../src/types';

export default function AccountsScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const accounts = useDataStore((s) => s.accounts);
  const createAccount = useDataStore((s) => s.createAccount);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountTypeEnum.BANK);

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
      await createAccount({ name, type });
      setName('');
      setType(AccountTypeEnum.BANK);
      setShowAdd(false);
    } catch {}
  }, [name, type, createAccount]);

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
          <Button onPress={handleAdd} fullWidth size="lg" disabled={!name}>
            Создать
          </Button>
        </View>
      </BottomSheet>
    </Screen>
  );
}
