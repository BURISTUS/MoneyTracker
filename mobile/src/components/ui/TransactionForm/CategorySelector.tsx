import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../stores/themeStore';
import { Text } from '../../../../components/ui/text';
import { CategoryIcon } from '../CategoryIcon';
import type { Category } from '../../../types';

interface CategorySelectorProps {
  visible: boolean;
  selectedCategory: string | null;
  categories: Category[];
  colors: { primary: string; background: string };
  onSelect: (id: string) => void;
  onClose: () => void;
  onNavigateToCreate: () => void;
}

export function CategorySelector({
  visible,
  selectedCategory,
  categories,
  colors,
  onSelect,
  onClose,
  onNavigateToCreate,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  const C = useTheme();

  const S = useMemo(
    () =>
      StyleSheet.create({
        overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
        sheet: {
          backgroundColor: C.sheet,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 34,
          maxHeight: '80%',
        },
        handle: {
          width: 36,
          height: 5,
          borderRadius: 3,
          backgroundColor: C.handle,
          alignSelf: 'center',
          marginBottom: 12,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          marginBottom: 12,
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
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
        catItem: {
          width: '30%',
          paddingVertical: 14,
          alignItems: 'center',
          borderRadius: 14,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
        },
        catName: {
          fontSize: 12,
          fontWeight: '600',
          color: C.textMain,
          textAlign: 'center',
          marginTop: 6,
        },
        emptyWrap: { alignItems: 'center', paddingVertical: 40 },
        emptyText: { fontSize: 15, color: C.textSec, marginBottom: 16 },
        emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
        emptyBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
        newCatBtn: {
          marginHorizontal: 20,
          marginTop: 16,
          paddingVertical: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: 'dashed' as const,
          borderColor: C.border,
          alignItems: 'center',
        },
        newCatText: { fontSize: 15, color: C.textSec },
      }),
    [C],
  );

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={S.overlay}>
        <Pressable style={S.overlay} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={S.sheet}>
          <View style={S.handle} />

          <View style={S.header}>
            <Text style={S.headerTitle}>{t('transactions.category')}</Text>
            <Pressable style={S.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {categories.length === 0 ? (
              <View style={S.emptyWrap}>
                <Text style={S.emptyText}>{t('transactions.noCategories')}</Text>
                <TouchableOpacity
                  onPress={onNavigateToCreate}
                  style={[S.emptyBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={S.emptyBtnText}>{t('categories.create')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={S.grid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => onSelect(cat.id)}
                      style={[
                        S.catItem,
                        selectedCategory === cat.id && {
                          backgroundColor: colors.background,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <CategoryIcon icon={cat.icon} color={cat.color || colors.primary} size={26} />
                      <Text style={S.catName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={onNavigateToCreate} style={S.newCatBtn}>
                  <Text style={S.newCatText}>{t('transactions.createCategory')}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
