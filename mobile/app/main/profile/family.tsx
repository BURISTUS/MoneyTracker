import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Pressable, ScrollView, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../src/stores/themeStore';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { formatCurrency } from '../../../src/utils/formatters';
import { Text } from '../../../components/ui/text';
import { useRouter } from 'expo-router';
import { useToast } from '../../../src/components/ui/Toast';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';

export default function FamilyScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = useSubscriptionStore((s) => s.status);
  const plan = useSubscriptionStore((s) => s.plan());
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const family = useSubscriptionStore((s) => s.family);
  const familyBudget = useSubscriptionStore((s) => s.familyBudget);
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);
  const fetchFamily = useSubscriptionStore((s) => s.fetchFamily);
  const fetchFamilyBudget = useSubscriptionStore((s) => s.fetchFamilyBudget);
  const createFamily = useSubscriptionStore((s) => s.createFamily);
  const joinFamily = useSubscriptionStore((s) => s.joinFamily);
  const leaveFamily = useSubscriptionStore((s) => s.leaveFamily);

  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const toast = useToast();

  const isInFamily = !!status?.familyId;

  useEffect(() => {
    fetchStatus();
    fetchFamily();
  }, []);

  useEffect(() => {
    if (isInFamily || family) {
      fetchFamilyBudget();
    }
  }, [isInFamily, family]);

  const handleCreate = useCallback(async () => {
    if (!familyName.trim()) return;
    setLoading(true);
    try {
      await createFamily(familyName.trim());
      await fetchStatus();
    } catch (e: any) {
      toast.showError(e.message || t('family.createFailed'));
    } finally {
      setLoading(false);
    }
  }, [familyName]);

  const handleJoin = useCallback(async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    try {
      await joinFamily(inviteCode.trim());
      await fetchStatus();
    } catch (e: any) {
      toast.showError(e.message || t('family.joinFailed'));
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  const copyCode = useCallback(async () => {
    const code = status?.familyCode || family?.inviteCode;
    if (code) {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [status, family]);

  const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain, letterSpacing: -0.3 },
    section: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.3 },
    input: { backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 12, paddingHorizontal: 16, fontSize: 15, color: C.textMain },
    btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    btnPrimary: { backgroundColor: C.primary },
    btnGold: { backgroundColor: '#F59E0B' },
    btnDanger: { backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444444' },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F59E0B15' },
    inviteBox: { backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 2, borderColor: '#F59E0B', borderStyle: 'dashed', padding: 16, alignItems: 'center', gap: 8 },
    budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  });

  // In family — show details
  if (isInFamily || family) {
    const familyName = status?.familyName || family?.name || t('family.defaultName');
    const inviteCode = status?.familyCode || family?.inviteCode || '';
    const members = family?.members || [];

    return (
      <View style={[S.screen, { paddingTop: insets.top }]}>
        <View style={S.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={S.backBtn}>
            <Ionicons name="chevron-back" size={28} color={C.textSec} />
          </Pressable>
          <Text style={S.headerTitle}>{t('family.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
          {/* Family name & invite code */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>{familyName}</Text>
            <View style={S.inviteBox}>
              <Ionicons name="link-outline" size={20} color="#F59E0B" />
              <Text style={{ fontSize: 11, color: C.textSec }}>{t('family.inviteCode')}</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain, letterSpacing: 2 }}>{inviteCode}</Text>
              <Pressable onPress={copyCode} style={[S.btn, { backgroundColor: copied ? '#10B981' : '#F59E0B', paddingHorizontal: 20, paddingVertical: 8 }]}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#FFF" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFF' }}>{copied ? t('family.copied') : t('family.copy')}</Text>
              </Pressable>
            </View>
                <Text style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 8 }}>
              {t('family.sendCodeDesc')}
            </Text>
          </View>

          {/* Members */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>{t('family.membersCount', { count: members.length })}</Text>
            {members.map((m: any) => (
              <View key={m.id} style={S.memberRow}>
                <View style={S.avatar}>
                  <Ionicons name="person" size={18} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{m.user?.name || m.user?.email || t('family.member')}</Text>
                  {m.role === 'OWNER' && <Text style={{ fontSize: 11, color: C.textMuted }}>{t('family.owner')}</Text>}
                </View>
                <View style={S.roleBadge}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: m.role === 'OWNER' ? '#F59E0B' : C.textSec }}>
                    {m.role === 'OWNER' ? '👑' : '👤'}
                  </Text>
                </View>
              </View>
            ))}
            {members.length < 2 && (
              <View style={[S.memberRow, { opacity: 0.4 }]}>
                <View style={S.avatar}>
                  <Ionicons name="person-outline" size={18} color={C.textMuted} />
                </View>
                <Text style={{ fontSize: 14, color: C.textMuted }}>{t('family.waiting')}</Text>
              </View>
            )}
          </View>

          {/* Budget */}
          {familyBudget && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>{t('family.sharedBudget')}</Text>
              <View style={[S.budgetRow, { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border }]}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{t('family.totalExpenses')}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444' }}>{formatCurrency(familyBudget.totalSpent * 100)}</Text>
              </View>
              {familyBudget.memberSpending?.map((ms: any) => (
                <View key={ms.userId} style={S.budgetRow}>
                  <Text style={{ fontSize: 13, color: C.textSec }}>{ms.userName || ms.userId.slice(0, 8) + '…'}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{formatCurrency(ms.totalSpent * 100)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Leave family — only for MEMBER */}
          {status?.familyRole === 'MEMBER' && (
            <Pressable
              style={[S.btn, S.btnDanger, { marginTop: 8 }]}
              onPress={() => setShowLeaveModal(true)}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>{t('family.leaveBtn')}</Text>
            </Pressable>
          )}
        </ScrollView>

        <ConfirmModal
          visible={showLeaveModal}
          title={t('family.leaveTitle')}
          message={t('family.leaveDesc')}
          confirmText={t('family.leaveBtn')}
          variant="destructive"
          onConfirm={async () => {
            setShowLeaveModal(false);
            try {
              await leaveFamily();
              toast.showSuccess(t('family.leftSuccess'));
            } catch (e: any) {
              toast.showError(e?.message || t('family.leaveFailed'));
            }
          }}
          onCancel={() => setShowLeaveModal(false)}
        />
      </View>
    );
  }

  // Not in a family yet — can always JOIN, can CREATE only on family plan
  const canCreate = plan === 'premium_family';

  return (
    <View style={[S.screen, { paddingTop: insets.top }]}>
      <View style={S.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={S.backBtn}>
          <Ionicons name="chevron-back" size={28} color={C.textSec} />
        </Pressable>
        <Text style={S.headerTitle}>{t('family.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('family.joinFamily')}</Text>
          <Text style={{ fontSize: 13, color: C.textSec, marginBottom: 12 }}>
            {t('family.enterCodeDesc')}
          </Text>
          <TextInput
            style={S.input}
            placeholder={t('family.codePlaceholder')}
            placeholderTextColor={C.textMuted}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={12}
          />
          <Pressable
            style={[S.btn, S.btnGold, { marginTop: 12, opacity: loading || !inviteCode.trim() ? 0.5 : 1 }]}
            onPress={handleJoin}
            disabled={loading || !inviteCode.trim()}
          >
            <Ionicons name="enter-outline" size={18} color="#FFF" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>{t('family.joinBtn')}</Text>
          </Pressable>
        </View>

        {canCreate && (
          <>
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <View style={{ width: 40, height: 1, backgroundColor: C.border }} />
              <Text style={{ fontSize: 12, color: C.textMuted, marginVertical: 4 }}>{t('common.or', 'or')}</Text>              <View style={{ width: 40, height: 1, backgroundColor: C.border }} />
            </View>

            <View style={S.section}>
              <Text style={S.sectionTitle}>{t('family.createFamily')}</Text>
              <Text style={{ fontSize: 13, color: C.textSec, marginBottom: 12 }}>
                {t('family.createDesc')}
              </Text>
              <TextInput
                style={S.input}
                placeholder={t('family.namePlaceholder')}
                placeholderTextColor={C.textMuted}
                value={familyName}
                onChangeText={setFamilyName}
                maxLength={30}
              />
              <Pressable
                style={[S.btn, S.btnPrimary, { marginTop: 12, opacity: loading || !familyName.trim() ? 0.5 : 1 }]}
                onPress={handleCreate}
                disabled={loading || !familyName.trim()}
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>{t('family.createBtn')}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}