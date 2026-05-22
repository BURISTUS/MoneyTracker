import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../../components/ui/text';
import type { TransactionType } from '../../../types';
import { TransactionType as TransactionTypeEnum } from '../../../types';

interface TransactionTypeToggleProps {
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  colors: { primary: string; background: string };
}

export function TransactionTypeToggle({ type, onTypeChange, colors }: TransactionTypeToggleProps) {
  const { t } = useTranslation();
  const S = StyleSheet.create({
    section: { paddingHorizontal: 20, marginBottom: 16 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: '#8E8E93',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#2C2C2E',
      backgroundColor: '#1C1C1E',
    },
    typeLabel: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  });

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>{t('transactions.type')}</Text>
      <View style={S.typeRow}>
        {[
          { k: TransactionTypeEnum.EXPENSE, label: `− ${t('components.expenseLabel')}` },
          { k: TransactionTypeEnum.INCOME, label: `+ ${t('components.incomeLabel')}` },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.k}
            onPress={() => onTypeChange(tab.k as TransactionType)}
            style={[
              S.typeBtn,
              type === tab.k && {
                backgroundColor: colors.background,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[S.typeLabel, type === tab.k && { color: colors.primary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
