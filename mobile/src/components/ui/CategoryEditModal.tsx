import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
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
import { Text } from '../../../components/ui/text';
import type { Category } from '../../types';

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  indigo: '#6366F1',
  red: '#FF3B30',
  inputBg: 'rgba(255,255,255,0.05)',
};

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA', '#FBBF24',
  '#34D399', '#6366F1', '#EC4899', '#14B8A6', '#F97316',
];

const ICONS = [
  'wallet', 'cash', 'card', 'cart', 'food', 'home', 'car',
  'bus', 'medical', 'fitness', 'game', 'book', 'shirt',
  'gift', 'cafe', 'flash', 'phone', 'globe', 'laptop',
  'paw', 'leaf', 'water', 'musical-notes', 'film',
];

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
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
  },
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
  limitInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textMain,
  },
  clearLimit: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.15)',
    marginTop: 4,
  },
  deleteText: { fontSize: 15, fontWeight: '600', color: C.red },
  saveBtn: {
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.indigo,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});

interface Props {
  visible: boolean;
  category: Category;
  onClose: () => void;
  onSave: (data: { name: string; icon?: string; color?: string; excludeFromTotal: boolean; monthlyLimit: number | null }) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryEditModal({ visible, category, onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon || 'wallet');
  const [color, setColor] = useState(category.color || '#6366F1');
  const [excludeFromTotal, setExcludeFromTotal] = useState(category.excludeFromTotal);
  const [monthlyLimitText, setMonthlyLimitText] = useState(
    category.monthlyLimit !== null && category.monthlyLimit !== undefined
      ? String(Math.round(category.monthlyLimit / 100))
      : '',
  );

  useEffect(() => {
    if (visible) {
      setName(category.name);
      setIcon(category.icon || 'wallet');
      setColor(category.color || '#6366F1');
      setExcludeFromTotal(category.excludeFromTotal);
      setMonthlyLimitText(
        category.monthlyLimit !== null && category.monthlyLimit !== undefined
          ? String(Math.round(category.monthlyLimit / 100))
          : '',
      );
    }
  }, [visible, category]);

  const handleSave = () => {
    const limitRubles = monthlyLimitText ? parseFloat(monthlyLimitText) : NaN;
    const monthlyLimit = !isNaN(limitRubles)
      ? Math.round(limitRubles * 100)
      : monthlyLimitText === '' ? 0 : null;
    onSave({
      name: name.trim() || category.name,
      icon,
      color,
      excludeFromTotal,
      monthlyLimit: monthlyLimit === 0 ? null : monthlyLimit,
    });
  };

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
                placeholderTextColor="#52525B"
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

            <View style={S.section}>
              <Text style={S.sectionTitle}>Иконка</Text>
              <View style={S.iconRow}>
                {ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    onPress={() => setIcon(ic)}
                    style={[
                      S.iconItem,
                      icon === ic && { borderColor: color, backgroundColor: `${color}15` },
                    ]}
                  >
                    <Ionicons name={ic as any} size={18} color={icon === ic ? color : C.textSec} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={S.section}>
              <Text style={S.sectionTitle}>{t("categories.monthlyLimit")}</Text>
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
                  <Pressable
                    style={S.clearLimit}
                    onPress={() => setMonthlyLimitText('')}
                  >
                    <Ionicons name="close-circle" size={18} color="#52525B" />
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
                  trackColor={{ false: 'rgba(255,255,255,0.08)', true: `${C.indigo}40` }}
                  thumbColor={excludeFromTotal ? C.indigo : '#52525B'}
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
