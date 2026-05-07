import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  Switch,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text } from '../../../components/ui/text';
import { ICON_BANK, serializeIcon, deserializeIcon } from '../../utils/iconBank';
import { useTheme } from '../../stores/themeStore';
import type { IconDef } from '../../utils/iconBank';
import type { Category } from '../../types';

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA', '#FBBF24',
  '#34D399', '#6366F1', '#EC4899', '#14B8A6', '#F97316',
];

interface Props {
  visible: boolean;
  category: Category;
  onClose: () => void;
  onSave: (data: { name: string; icon?: string; color?: string; excludeFromTotal: boolean; monthlyLimit: number | null }) => void;
  onDelete: (categoryId: string) => void;
}

// Filter icon bank by income type
function filterIconBank(type: string) {
  if (type === 'INCOME') {
    return ICON_BANK.filter((g) => g.label === 'Доходы');
  }
  return ICON_BANK.filter((g) => g.label !== 'Доходы');
}

export function CategoryEditModal({ visible, category, onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation();
  const C = useTheme();

  const [name, setName] = useState(category.name);
  const [iconRaw, setIconRaw] = useState(category.icon || '');
  const [color, setColor] = useState(category.color || C.primary);
  const [excludeFromTotal, setExcludeFromTotal] = useState(category.excludeFromTotal);
  const [monthlyLimitText, setMonthlyLimitText] = useState(
    category.monthlyLimit !== null && category.monthlyLimit !== undefined
      ? String(Math.round(category.monthlyLimit / 100))
      : '',
  );
  const [expandedGroup, setExpandedGroup] = useState<number>(-1);

  // Parse current icon
  const selectedIconDef: IconDef | undefined = useMemo(
    () => deserializeIcon(iconRaw),
    [iconRaw],
  );

  // Filtered icon bank
  const filteredIconBank = useMemo(
    () => filterIconBank(category.type),
    [category.type],
  );

  useEffect(() => {
    if (visible) {
      setName(category.name);
      setIconRaw(category.icon || '');
      setColor(category.color || C.primary);
      setExcludeFromTotal(category.excludeFromTotal);
      setMonthlyLimitText(
        category.monthlyLimit !== null && category.monthlyLimit !== undefined
          ? String(Math.round(category.monthlyLimit / 100))
          : '',
      );
      setExpandedGroup(-1);
    }
  }, [visible, category]);

  const handleSelectIcon = (def: IconDef) => {
    setIconRaw(serializeIcon(def));
  };

  const handleSave = () => {
    const limitRubles = monthlyLimitText ? parseFloat(monthlyLimitText) : NaN;
    const monthlyLimit = !isNaN(limitRubles)
      ? Math.round(limitRubles * 100)
      : monthlyLimitText === '' ? 0 : null;
    onSave({
      name: name.trim() || category.name,
      icon: iconRaw,
      color,
      excludeFromTotal,
      monthlyLimit: monthlyLimit === 0 ? null : monthlyLimit,
    });
  };

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: 34,
      maxHeight: '90%',
    },
    handle: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.handle,
      alignSelf: 'center',
      marginBottom: 16,
    },
    // Preview
    preview: { alignItems: 'center', paddingBottom: 8 },
    previewCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 10,
    },
    previewName: { fontSize: 16, fontWeight: '700', color: C.textMain, marginBottom: 2 },
    previewType: { fontSize: 13, color: C.textSec },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 8, textTransform: 'uppercase' },
    input: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: C.textMain,
      borderWidth: 1,
      borderColor: C.border,
    },
    limitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: C.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: 14,
    },
    limitInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: C.textMain },
    clearLimit: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    colorDot: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconItem: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    iconItemActive: { borderColor: 'transparent' },
    groupWrap: { marginBottom: 8 },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    groupTitle: { fontSize: 11, fontWeight: '600', color: C.textSec, textTransform: 'uppercase' as const },
    groupExpand: { fontSize: 12, color: C.primary },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: C.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    toggleLabel: { fontSize: 14, fontWeight: '500', color: C.textMain },
    toggleDesc: { fontSize: 11, color: C.textSec, marginTop: 2 },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: C.redBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.redBorder,
      marginTop: 4,
    },
    deleteText: { fontSize: 15, fontWeight: '600', color: C.red },
    saveBtn: {
      marginHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: C.primary,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={S.overlay}
      >
        <Pressable style={S.overlay} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={S.sheet}>
          <View style={S.handle} />

          {/* Preview */}
          <View style={S.preview}>
            <View style={[S.previewCircle, color ? { backgroundColor: `${color}18`, borderColor: color } : undefined]}>
              {selectedIconDef ? (
                <MaterialCommunityIcons
                  name={selectedIconDef.name as any}
                  size={30}
                  color={color || C.textSec}
                />
              ) : (
                <Ionicons name="grid-outline" size={30} color={C.textSec} />
              )}
            </View>
            <Text style={S.previewName}>{name || category.name}</Text>
            <Text style={S.previewType}>
              {category.type === 'INCOME' ? 'Доход' : 'Расход'}
            </Text>
          </View>

          <View style={S.header}>
            <Text style={S.headerTitle}>{t("categories.edit")}</Text>
            <Pressable style={S.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={S.section}>
              <Text style={S.sectionTitle}>Название</Text>
              <TextInput
                style={S.input}
                value={name}
                onChangeText={setName}
                placeholder="Название категории"
                placeholderTextColor={C.textMuted}
              />
            </View>

            <View style={S.section}>
              <Text style={S.sectionTitle}>Цвет</Text>
              <View style={S.colorRow}>
                {COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[S.colorDot, { backgroundColor: `${c}18` }]}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 8,
                        backgroundColor: c,
                        borderWidth: color === c ? 2 : 0,
                        borderColor: '#FFF',
                      }}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ──── Иконка (с группами из ICON_BANK) ──── */}
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
                        <Pressable onPress={() => setExpandedGroup(isExpanded ? -1 : groupIndex)}>
                          <Text style={S.groupExpand}>
                            {isExpanded ? 'Свернуть ▲' : `+ ещё ${group.icons.length - 8}`}
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    <View style={S.iconRow}>
                      {visibleIcons.map((def) => {
                        const isSelected =
                          selectedIconDef?.name === def.name &&
                          selectedIconDef?.family === def.family;
                        return (
                          <Pressable
                            key={`${def.family}:${def.name}`}
                            onPress={() => handleSelectIcon(def)}
                            style={[
                              S.iconItem,
                              isSelected && {
                                borderColor: color,
                                backgroundColor: `${color}15`,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={def.name as any}
                              size={18}
                              color={isSelected ? color : C.textSec}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={S.section}>
              <Text style={S.sectionTitle}>{t("categories.monthlyLimit")}</Text>
              <View style={S.limitRow}>
                <TextInput
                  style={S.limitInput}
                  value={monthlyLimitText}
                  onChangeText={setMonthlyLimitText}
                  placeholder="Без лимита"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numeric"
                />
                {monthlyLimitText !== '' && (
                  <Pressable style={S.clearLimit} onPress={() => setMonthlyLimitText('')}>
                    <Ionicons name="close-circle" size={18} color={C.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={S.section}>
              <View style={S.toggleRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={S.toggleLabel}>{t("categories.excludeFromTotal")}</Text>
                  <Text style={S.toggleDesc}>{t("categories.excludeDesc")}</Text>
                </View>
                <Switch
                  value={excludeFromTotal}
                  onValueChange={setExcludeFromTotal}
                  trackColor={{ false: C.divider, true: `${C.primary}40` }}
                  thumbColor={excludeFromTotal ? C.primary : C.textMuted}
                />
              </View>
            </View>

            <Pressable style={S.saveBtn} onPress={handleSave}>
              <Text style={S.saveText}>Сохранить</Text>
            </Pressable>

            <Pressable
              style={S.deleteBtn}
              onPress={() => {
                onDelete(category.id);
                onClose();
              }}
            >
              <Ionicons name="trash-outline" size={18} color={C.red} />
              <Text style={S.deleteText}>{t("categories.delete")}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
