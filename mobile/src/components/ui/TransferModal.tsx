import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../utils/formatters';
import transactionsService from '../../services/transactions';
import type { Account } from '../../types';

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  indigo: '#6366F1',
  green: '#34D399',
  red: '#FF3B30',
};

interface Props {
  visible: boolean;
  accounts: Account[];
  hourlyRate?: number;
  onClose: () => void;
  onComplete: () => void;
}

const accountIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  CASH: 'wallet-outline',
  BANK: 'card-outline',
  CREDIT: 'card-outline',
  INVESTMENT: 'trending-up-outline',
  DEBT: 'alert-circle-outline',
};

export function TransferModal({ visible, accounts, hourlyRate, onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromAccount = fromId ? accounts.find((a) => a.id === fromId) : null;
  const toAccount = toId ? accounts.find((a) => a.id === toId) : null;

  const availableTargets = useMemo(
    () => accounts.filter((a) => a.id !== fromId),
    [accounts, fromId],
  );

  const isValid = fromId && toId && amount && parseFloat(amount) > 0 && fromId !== toId;
  const amountNum = parseFloat(amount) || 0;

  const lifeHours = useMemo(() => {
    if (!hourlyRate || hourlyRate <= 0 || amountNum <= 0) return null;
    const hours = amountNum / hourlyRate;
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 100) return `${hours.toFixed(1)} ч`;
    return `${Math.round(hours)} ч`;
  }, [amountNum, hourlyRate]);

  const handleTransfer = async () => {
    if (!fromId || !toId || amountNum <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await transactionsService.transfer({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: Math.round(amountNum * 100),
        description: note || undefined,
      });
      setFromId(null);
      setToId(null);
      setAmount('');
      setNote('');
      onComplete();
    } catch (e: any) {
      setError(e?.message || 'Ошибка перевода');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFromId(null);
    setToId(null);
    setAmount('');
    setNote('');
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={S.overlay} onPress={reset}>
        <Pressable style={S.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={S.handle} />
          <View style={S.header}>
            <Text style={S.headerTitle}>{t("transfer.title")}</Text>
            <Pressable style={S.closeBtn} onPress={reset}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={S.section}>
              <Text style={S.label}>{t("transfer.from")}</Text>
              <View style={S.chipRow}>
                {accounts.map((a) => {
                  const active = fromId === a.id;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => {
                        setFromId(a.id);
                        if (toId === a.id) setToId(null);
                      }}
                      style={[S.accountChip, active && S.accountChipActive]}
                    >
                      <Ionicons
                        name={accountIcons[a.type] || 'wallet-outline'}
                        size={16}
                        color={active ? C.indigo : C.textSec}
                      />
                      <Text style={[S.accountChipText, active && S.accountChipTextActive]}>
                        {a.name}
                      </Text>
                      <Text style={[S.accountChipBalance, active && { color: C.indigo }]}>
                        {formatCurrency(a.balance, a.currency)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={S.arrowWrap}>
              <View style={S.arrowCircle}>
                <Ionicons name="arrow-down" size={20} color={C.indigo} />
              </View>
            </View>

            <View style={S.section}>
              <Text style={S.label}>{t("transfer.to")}</Text>
              <View style={S.chipRow}>
                {availableTargets.map((a) => {
                  const active = toId === a.id;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => setToId(a.id)}
                      style={[S.accountChip, active && S.accountChipActive]}
                    >
                      <Ionicons
                        name={accountIcons[a.type] || 'wallet-outline'}
                        size={16}
                        color={active ? C.indigo : C.textSec}
                      />
                      <Text style={[S.accountChipText, active && S.accountChipTextActive]}>
                        {a.name}
                      </Text>
                      <Text style={[S.accountChipBalance, active && { color: C.indigo }]}>
                        {formatCurrency(a.balance, a.currency)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={S.section}>
              <Text style={S.label}>{t("transfer.amount")}</Text>
              <TextInput
                style={S.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="decimal-pad"
              />
              {lifeHours && (
                <Text style={S.hoursHint}>⏱ {lifeHours} работы</Text>
              )}
            </View>

            <View style={S.section}>
              <Text style={S.label}>{t("transfer.note")}</Text>
              <TextInput
                style={[S.input, { minHeight: 48 }]}
                value={note}
                onChangeText={setNote}
                placeholder="Например: перевод на карту"
                placeholderTextColor="#52525B"
              />
            </View>

            {error && (
              <View style={S.errorBox}>
                <Text style={S.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleTransfer}
              disabled={!isValid || loading}
              style={[S.submitBtn, (!isValid || loading) && S.submitBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={S.submitText}>
                  Перевести {amount ? formatCurrency(Math.round(amountNum * 100)) : ''}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13131A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '90%',
  },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 8, textTransform: 'uppercase' },
  chipRow: { gap: 8 },
  accountChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card, marginBottom: 6,
  },
  accountChipActive: {
    borderColor: 'rgba(99,102,241,0.4)',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  accountChipText: { fontSize: 14, fontWeight: '500', color: C.textMain, flex: 1 },
  accountChipTextActive: { color: C.indigo },
  accountChipBalance: { fontSize: 12, color: C.textSec },
  arrowWrap: { alignItems: 'center', marginBottom: 4 },
  arrowCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 18, fontWeight: '600', color: C.textMain,
    borderWidth: 1, borderColor: C.border,
  },
  hoursHint: { fontSize: 13, color: C.indigo, marginTop: 8, fontWeight: '500' },
  errorBox: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: 10, padding: 12,
  },
  errorText: { fontSize: 13, color: C.red },
  submitBtn: {
    marginHorizontal: 20, paddingVertical: 14,
    backgroundColor: C.indigo, borderRadius: 14,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
