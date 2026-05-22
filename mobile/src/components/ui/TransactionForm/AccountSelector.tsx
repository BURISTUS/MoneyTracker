import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../stores/themeStore';
import { Text } from '../../../../components/ui/text';
import type { Account } from '../../../types';

interface AccountSelectorProps {
  visible: boolean;
  selectedAccount: string;
  accounts: Account[];
  colors: { primary: string; background: string };
  onSelect: (id: string) => void;
}

export function AccountSelector({
  visible,
  selectedAccount,
  accounts,
  colors,
  onSelect,
}: AccountSelectorProps) {
  const C = useTheme();

  const S = useMemo(
    () =>
      StyleSheet.create({
        section: { paddingHorizontal: 20, marginBottom: 16 },
        accountRow: { flexDirection: 'row', gap: 8 },
        accountBtn: {
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: C.inputBg,
          borderWidth: 1,
          borderColor: C.border,
        },
        accountLabel: { fontSize: 14, color: C.textMain },
      }),
    [C],
  );

  if (!visible) return null;

  return (
    <View style={S.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={S.accountRow}>
          {accounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              onPress={() => onSelect(acc.id)}
              style={[
                S.accountBtn,
                selectedAccount === acc.id && {
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={S.accountLabel}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
