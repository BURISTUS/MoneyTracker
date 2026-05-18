import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../../src/stores/dataStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { useTranslation } from 'react-i18next';
import { ICON_BANK, serializeIcon } from '../../../src/utils/iconBank';
import type { IconDef } from '../../../src/utils/iconBank';
import type { CategoryType } from '../../../src/types';
import { CategoryType as CategoryTypeEnum } from '../../../src/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA', '#FBBF24',
  '#34D399', '#6366F1', '#EC4899', '#14B8A6', '#F97316',
];

// ============================================================
// Filter icons by category type
// ============================================================

function filterIconBank(type: CategoryType, t: (key: string) => string) {
  if (type === 'INCOME') {
    return ICON_BANK.filter((g) => g.label === t('categories.income') || g.label === 'Доходы');
  }
  return ICON_BANK.filter((g) => g.label !== t('categories.income') && g.label !== 'Доходы');
}

// ============================================================
// Component
// ============================================================

export default function CreateCategoryScreen() {
  const C = useTheme();
  const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: C.border },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    preview: { alignItems: 'center', paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: C.border },
    previewCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
    previewName: { fontSize: 18, fontWeight: '700', color: C.textMain, marginBottom: 4 },
    previewType: { fontSize: 14, color: C.textSec },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 8, textTransform: 'uppercase' },
    input: { backgroundColor: C.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: C.textMain, borderWidth: 1, borderColor: C.border },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
    typeBtnActive: { borderColor: 'transparent' },
    typeLabel: { fontSize: 15, fontWeight: '600', color: C.textSec },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorDot: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
    colorDotActive: { borderColor: '#FFF' },
    groupWrap: { marginBottom: 12 },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    groupTitle: { fontSize: 11, fontWeight: '600', color: C.textSec, textTransform: 'uppercase' as const },
    groupExpand: { fontSize: 12, color: C.primary },
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconItem: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
    iconItemActive: { borderColor: 'transparent' },
    bottomBar: { position: 'absolute' as const, bottom: 0, left: 0, right: 0, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 20, paddingVertical: 16 },
    saveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    limitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
    limitInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.textMain },
    clearLimit: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
    toggleLabel: { fontSize: 14, fontWeight: '500', color: C.textMain },
    toggleDesc: { fontSize: 11, color: C.textSec, marginTop: 2 },
  });
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addCategory = useDataStore((s) => s.addCategory);
  const categories = useDataStore((s) => s.categories);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);

  const categoryLimit = checkAccess('PERSONAL_CATEGORIES');
  const maxCategories = categoryLimit?.limit ?? Infinity;
  const canCreate = categories.length < maxCategories;

  React.useEffect(() => {
    if (!canCreate) {
      showPaywall('PERSONAL_CATEGORIES');
      router.back();
    }
  }, []);

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryTypeEnum.EXPENSE);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIconDef, setSelectedIconDef] = useState<IconDef | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<number>(0);
  const [excludeFromTotal, setExcludeFromTotal] = useState(false);
  const [monthlyLimitText, setMonthlyLimitText] = useState('');

  const theme =
    type === 'EXPENSE'
      ? { primary: C.red, background: 'rgba(255,59,48,0.1)' }
      : { primary: C.green, background: 'rgba(52,199,89,0.1)' };

  const filteredIconBank = useMemo(() => filterIconBank(type, t), [type]);

  const handleSubmit = useCallback(async () => {
    if (!name || !selectedColor || !selectedIconDef) return;
    setIsSubmitting(true);
    try {
      const limitRubles = monthlyLimitText ? parseFloat(monthlyLimitText) : NaN;
      const monthlyLimit = !isNaN(limitRubles) && limitRubles > 0
        ? Math.round(limitRubles * 100)
        : null;

      await addCategory({
        name,
        type,
        icon: serializeIcon(selectedIconDef),
        color: selectedColor,
        isBaseNeed: false,
        excludeFromTotal,
        monthlyLimit,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, type, selectedColor, selectedIconDef, excludeFromTotal, monthlyLimitText, addCategory, router]);

  return (
    <View style={S.screen}>
      {/* Header */}
      <View style={[S.header, { paddingTop: insets.top + 8 }]}>
        <Text style={S.headerTitle}>Новая категория</Text>
        <TouchableOpacity style={S.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={18} color={C.textSec} />
        </TouchableOpacity>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ──── Preview ──── */}
        <View style={S.preview}>
          <View style={[S.previewCircle, selectedColor ? { backgroundColor: `${selectedColor}22`, borderColor: selectedColor } : undefined]}>
            {selectedIconDef ? (
              <MaterialCommunityIcons
                name={selectedIconDef.name as any}
                size={40}
                color={selectedColor || '#8E8E93'}
              />
            ) : (
              <Ionicons name="grid-outline" size={40} color="#8E8E93" />
            )}
          </View>
          <Text style={S.previewName}>{name || 'Название категории'}</Text>
          <Text style={S.previewType}>
            {type === 'EXPENSE' ? 'Расход' : 'Доход'}
          </Text>
        </View>

        {/* ──── Название ──── */}
        <View style={[S.section, { marginTop: 20 }]}>
          <Text style={S.sectionTitle}>Название</Text>
          <TextInput
            style={S.input}
            value={name}
            onChangeText={setName}
            placeholder="Название категории"
            placeholderTextColor="#52525B"
          />
        </View>

        {/* ──── Тип ──── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Тип</Text>
          <View style={S.typeRow}>
            {[
              { k: CategoryTypeEnum.EXPENSE, label: 'Расход' },
              { k: CategoryTypeEnum.INCOME, label: 'Доход' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.k}
                onPress={() => {
                  setType(tab.k as CategoryType);
                  setSelectedColor('');
                }}
                style={[
                  S.typeBtn,
                  type === tab.k && { backgroundColor: theme.background, borderColor: theme.primary },
                ]}
              >
                <Text style={[S.typeLabel, type === tab.k && { color: theme.primary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ──── Цвет ──── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Цвет</Text>
          <View style={S.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  S.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && S.colorDotActive,
                ]}
              >
                {selectedColor === c && (
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ──── Иконка ──── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>
            Иконка ({filteredIconBank.reduce((sum, g) => sum + g.icons.length, 0)})
          </Text>

          {filteredIconBank.map((group, groupIndex) => {
            const isExpanded = expandedGroup === groupIndex;
            const visibleIcons = isExpanded ? group.icons : group.icons.slice(0, 8);

            return (
              <View key={group.label} style={S.groupWrap}>
                <View style={S.groupHeader}>
                  <Text style={S.groupTitle}>{group.label}</Text>
                  {group.icons.length > 8 && (
                    <TouchableOpacity onPress={() => setExpandedGroup(isExpanded ? -1 : groupIndex)}>
                      <Text style={S.groupExpand}>
                        {isExpanded ? 'Свернуть ▲' : `+ ещё ${group.icons.length - 8}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={S.iconRow}>
                  {visibleIcons.map((iconDef) => {
                    const isSelected =
                      selectedIconDef?.name === iconDef.name &&
                      selectedIconDef?.family === iconDef.family;
                    return (
                      <TouchableOpacity
                        key={`${iconDef.family}:${iconDef.name}`}
                        onPress={() => setSelectedIconDef(iconDef)}
                        style={[
                          S.iconItem,
                          isSelected && {
                            backgroundColor: theme.background,
                            borderColor: theme.primary,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={iconDef.name as any}
                          size={22}
                          color={isSelected ? theme.primary : C.textSec}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* ──── Лимит ──── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Лимит в месяц</Text>
          <View style={S.limitRow}>
            <TextInput
              style={S.limitInput}
              value={monthlyLimitText}
              onChangeText={setMonthlyLimitText}
              placeholder="Без лимита"
              placeholderTextColor="#52525B"
              keyboardType="numeric"
            />
            {monthlyLimitText !== '' && (
              <TouchableOpacity style={S.clearLimit} onPress={() => setMonthlyLimitText('')}>
                <Ionicons name="close-circle" size={18} color="#52525B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ──── Исключить из расчётов ──── */}
        <View style={S.section}>
          <View style={S.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={S.toggleLabel}>Исключить из расчётов</Text>
              <Text style={S.toggleDesc}>Транзакции не будут влиять на общий баланс</Text>
            </View>
            <Switch
              value={excludeFromTotal}
              onValueChange={setExcludeFromTotal}
              trackColor={{ false: 'rgba(255,255,255,0.08)', true: `${C.primary}40` }}
              thumbColor={excludeFromTotal ? C.primary : '#52525B'}
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ──── Bottom bar ──── */}
      <View style={[S.bottomBar, { bottom: insets.bottom + 62, paddingBottom: Math.max(16, insets.bottom + 16) }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!name || !selectedColor || !selectedIconDef || isSubmitting}
          style={[
            S.saveBtn,
            {
              backgroundColor:
                !name || !selectedColor || !selectedIconDef
                  ? 'rgba(255,255,255,0.08)'
                  : theme.primary,
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}
        >
          <Text style={S.saveText}>
            {isSubmitting ? 'Создание...' : 'Создать категорию'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}