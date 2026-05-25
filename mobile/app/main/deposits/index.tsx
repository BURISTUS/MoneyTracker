import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/stores/themeStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { formatCurrency } from '../../../src/utils/formatters';
import { Text } from '../../../components/ui/text';
import { useToast } from '../../../src/components/ui/Toast';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { DepositType, CompoundingType } from '../../../src/types';
import type { Deposit } from '../../../src/types';

const DEPOSIT_TYPES: { value: DepositType; label: string }[] = [
  { value: DepositType.SAVINGS_ACCOUNT, label: 'Savings' },
  { value: DepositType.TERM_DEPOSIT, label: 'Term' },
  { value: DepositType.INVESTMENT, label: 'Investment' },
  { value: DepositType.BONDS, label: 'Bonds' },
];

const COMPOUNDING_TYPES: { value: CompoundingType; label: string }[] = [
  { value: CompoundingType.MONTHLY, label: 'Monthly' },
  { value: CompoundingType.DAILY, label: 'Daily' },
  { value: CompoundingType.QUARTERLY, label: 'Quarterly' },
  { value: CompoundingType.ANNUALLY, label: 'Annually' },
  { value: CompoundingType.NONE, label: 'No' },
];

export default function DepositsScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);

  const deposits = useDataStore((s) => s.deposits);
  const isLoadingDeposits = useDataStore((s) => s.isLoadingDeposits);
  const fetchDeposits = useDataStore((s) => s.fetchDeposits);
  const addDeposit = useDataStore((s) => s.addDeposit);
  const deleteDeposit = useDataStore((s) => s.deleteDeposit);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [depositType, setDepositType] = useState<DepositType>(DepositType.TERM_DEPOSIT);
  const [compounding, setCompounding] = useState<CompoundingType>(CompoundingType.MONTHLY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchDeposits(); }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !amount || !rate || !term) {
      toast.showError(t('deposits.fillRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      await addDeposit({
        name: name.trim(),
        type: depositType,
        principal: Math.round(parseFloat(amount) * 100),
        annualRate: parseFloat(rate),
        compounding,
        termMonths: parseInt(term, 10),
        startDate: new Date().toISOString().split('T')[0],
      });
      toast.showSuccess(t('deposits.created'));
      setShowForm(false);
      setName(''); setAmount(''); setRate(''); setTerm('');
    } catch { toast.showError(t('common.error')); }
    setIsSubmitting(false);
  }, [name, amount, rate, term, depositType, compounding]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteDeposit(deleteId);
    setDeleteId(null);
  }, [deleteId]);

  const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain },
    card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10 },
    section: { paddingHorizontal: 16, marginTop: 16 },
    label: { fontSize: 12, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', marginBottom: 8 },
    input: { backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, fontSize: 15, color: C.textMain, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
    chipActive: { borderColor: C.primary, backgroundColor: `${C.primary}18` },
    btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: C.primary, marginTop: 8 },
    empty: { alignItems: 'center', paddingVertical: 48 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  });

  return (
    <View style={[S.screen, { paddingTop: insets.top }]}>
      <View style={S.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={28} color={C.textSec} /></Pressable>
        <Text style={S.headerTitle}>{t('deposits.title')}</Text>
        <Pressable onPress={() => { setShowForm(!showForm); }}>
          <Ionicons name={showForm ? 'close' : 'add'} size={28} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={S.section}>
            <TextInput style={S.input} placeholder={t('deposits.namePlaceholder')} placeholderTextColor={C.textMuted} value={name} onChangeText={setName} />
            <TextInput style={S.input} placeholder={t('deposits.amountPlaceholder')} placeholderTextColor={C.textMuted} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TextInput style={S.input} placeholder={t('deposits.ratePlaceholder')} placeholderTextColor={C.textMuted} value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
            <TextInput style={S.input} placeholder={t('deposits.termPlaceholder')} placeholderTextColor={C.textMuted} value={term} onChangeText={setTerm} keyboardType="number-pad" />

            <Text style={S.label}>{t('deposits.type')}</Text>
            <View style={S.chipRow}>
              {DEPOSIT_TYPES.map((dt) => (
                <Pressable key={dt.value} style={[S.chip, depositType === dt.value && S.chipActive]} onPress={() => setDepositType(dt.value)}>
                  <Text style={{ fontSize: 13, color: depositType === dt.value ? C.primary : C.textSec }}>{dt.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={S.label}>{t('deposits.compounding')}</Text>
            <View style={S.chipRow}>
              {COMPOUNDING_TYPES.map((ct) => (
                <Pressable key={ct.value} style={[S.chip, compounding === ct.value && S.chipActive]} onPress={() => setCompounding(ct.value)}>
                  <Text style={{ fontSize: 13, color: compounding === ct.value ? C.primary : C.textSec }}>{ct.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={[S.btn, { opacity: isSubmitting ? 0.5 : 1 }]} onPress={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>{t('deposits.create')}</Text>}
            </Pressable>
          </View>
        )}

        <View style={S.section}>
          {isLoadingDeposits ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
          ) : deposits.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="wallet-outline" size={48} color={C.textMuted} />
              <Text style={{ fontSize: 15, color: C.textSec, marginTop: 8 }}>{t('deposits.empty')}</Text>
            </View>
          ) : (
            deposits.map((d: Deposit) => (
              <View key={d.id} style={S.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: C.textMain }}>{d.name}</Text>
                  <Pressable onPress={() => setDeleteId(d.id)}><Ionicons name="trash-outline" size={18} color={C.red} /></Pressable>
                </View>
                <View style={S.row}><Text style={{ fontSize: 13, color: C.textSec }}>{t('deposits.principal')}</Text><Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{formatCurrency(d.principal)}</Text></View>
                <View style={S.row}><Text style={{ fontSize: 13, color: C.textSec }}>{t('deposits.maturity')}</Text><Text style={{ fontSize: 14, fontWeight: '600', color: '#34C759' }}>{formatCurrency(d.currentAmount)}</Text></View>
                <View style={S.row}><Text style={{ fontSize: 13, color: C.textSec }}>{t('deposits.rate')}</Text><Text style={{ fontSize: 14, color: C.textMain }}>{d.annualRate}% · {d.termMonths} {t('deposits.months')}</Text></View>
                {d.endDate && <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{t('deposits.ends')} {new Date(d.endDate).toLocaleDateString()}</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ConfirmModal visible={!!deleteId} title={t('deposits.deleteTitle')} message={t('deposits.deleteDesc')} confirmText={t('common.delete')} variant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </View>
  );
}
