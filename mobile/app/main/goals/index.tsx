import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { Icon } from '../../../src/components/ui/Icon';
import { GoalCard } from '../../../src/components/features/GoalCard';
import { BottomSheet } from '../../../src/components/ui/BottomSheet';
import { Header } from '../../../src/components/layout/Header';
import { useTheme } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/formatters';

export default function GoalsScreen() {
  const { spacing } = useTheme();
  const goals = useDataStore((s) => s.goals);
  const addGoal = useDataStore((s) => s.addGoal);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleAdd = useCallback(() => {
    if (!name || !target) return;
    addGoal({
      id: `temp_${Date.now()}`,
      userId: '',
      name,
      targetAmount: Math.round(parseFloat(target) * 100),
      currentAmount: 0,
      deadline: deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    });
    setName('');
    setTarget('');
    setDeadline('');
    setShowAdd(false);
  }, [name, target, deadline, addGoal]);

  return (
    <Screen scroll header={<Header title="Цели" showBack />}>
      <View style={{ gap: spacing.xl }}>
        <Card variant="glass" padding="xxl">
          <Text size="sm" style={{ color: '#71717A', marginBottom: 8 }}>
            Общий прогресс
          </Text>
          <Text preset="h1">{formatCurrency(totalSaved)}</Text>
          <Text size="sm" style={{ color: '#71717A', marginTop: 4 }}>
            из {formatCurrency(totalTarget)}
          </Text>
          <View style={{ marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text size="xs" style={{ color: '#71717A' }}>Прогресс</Text>
              <Text size="xs" weight="medium" style={{ color: '#818CF8' }}>
                {Math.round(overallProgress)}%
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, overallProgress)}%`,
                  height: '100%',
                  backgroundColor: '#6366F1',
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </Card>

        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GoalCard goal={item} style={{ marginBottom: spacing.md }} />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Icon name="flag-outline" size={48} color="#52525B" />
              <Text size="md" style={{ color: '#71717A', marginTop: 12 }}>
                Нет целей
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

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)} title="Новая цель">
        <View style={{ gap: 16 }}>
          <Input label="Название" value={name} onChangeText={setName} placeholder="На что копим?" />
          <Input label="Сумма (руб)" value={target} onChangeText={setTarget} placeholder="0" keyboardType="decimal-pad" />
          <Button onPress={handleAdd} fullWidth size="lg" disabled={!name || !target}>
            Создать цель
          </Button>
        </View>
      </BottomSheet>
    </Screen>
  );
}
