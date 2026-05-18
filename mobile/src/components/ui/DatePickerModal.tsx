import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';

interface DatePickerModalProps {
  visible: boolean;
  currentDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function getPresetDates(t: (key: string) => string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);
  return [
    { label: t('datePicker.today'), date: today },
    { label: t('datePicker.yesterday'), date: yesterday },
    { label: t('datePicker.dayBefore'), date: dayBefore },
  ];
}

const MONTHS_GEN_KEYS = ['monthsGen.jan','monthsGen.feb','monthsGen.mar','monthsGen.apr','monthsGen.may','monthsGen.jun','monthsGen.jul','monthsGen.aug','monthsGen.sep','monthsGen.oct','monthsGen.nov','monthsGen.dec'] as const;

function formatDayMonth(date: Date, t: (key: string) => string): string {
  return `${date.getDate()} ${t(MONTHS_GEN_KEYS[date.getMonth()])}`;
}

export function DatePickerModal({
  visible,
  currentDate,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  const { t } = useTranslation();
  const C = useTheme();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const [customDay, setCustomDay] = useState(pad(now.getDate()));
  const [customMonth, setCustomMonth] = useState(pad(now.getMonth() + 1));
  const [customYear, setCustomYear] = useState(String(now.getFullYear()));

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);

  const presets = useMemo(() => getPresetDates(t), [t]);

  const handlePreset = useCallback((date: Date) => {
    onSelect(date);
    const n = new Date();
    setCustomDay(pad(n.getDate()));
    setCustomMonth(pad(n.getMonth() + 1));
    setCustomYear(String(n.getFullYear()));
  }, [onSelect]);

  const handleCustomApply = useCallback(() => {
    const d = parseInt(customDay, 10);
    const m = parseInt(customMonth, 10);
    const y = parseInt(customYear, 10) || new Date().getFullYear();
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100) {
      const selected = new Date(y, m - 1, d);
      const today = new Date(); today.setHours(23, 59, 59, 999);
      onSelect(selected > today ? new Date() : selected);
      const n = new Date();
      setCustomDay(pad(n.getDate()));
      setCustomMonth(pad(n.getMonth() + 1));
      setCustomYear(String(n.getFullYear()));
    }
  }, [customDay, customMonth, customYear, onSelect]);

  const handleDayChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
    setCustomDay(clean);
    if (clean.length === 2) monthRef.current?.focus();
  }, []);

  const handleDayBlur = useCallback(() => {
    setCustomDay((v) => v.length === 1 ? pad(parseInt(v)) : v);
  }, []);

  const handleMonthChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
    setCustomMonth(clean);
  }, []);

  const handleMonthBlur = useCallback(() => {
    setCustomMonth((v) => v.length === 1 ? pad(parseInt(v)) : v);
  }, []);

  const handleMonthKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && customMonth.length === 0) {
        dayRef.current?.focus();
      }
    },
    [customMonth],
  );

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.handle,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 16,
    },
    section: { paddingHorizontal: 20 },
    title: { fontSize: 18, fontWeight: '700', color: C.textMain, marginBottom: 4 },
    subtitle: { fontSize: 14, color: C.textSec, marginBottom: 20 },
    presetGap: { gap: 8, marginBottom: 20 },
    presetBtn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    presetLabel: { fontSize: 16 },
    presetDate: { fontSize: 14, color: C.textSec },
    customLabel: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 8, textTransform: 'uppercase' },
    customFieldsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    customHintRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    customHint: { flex: 1, fontSize: 10, color: C.textMuted, textAlign: 'center', textTransform: 'uppercase' },
    customHintWide: { flex: 1.3, fontSize: 10, color: C.textMuted, textAlign: 'center', textTransform: 'uppercase' },
    customInput: {
      flex: 1,
      backgroundColor: C.divider,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: C.textMain,
      fontSize: 16,
      textAlign: 'center',
    },
    customInputWide: {
      flex: 1.3,
      backgroundColor: C.divider,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: C.textMain,
      fontSize: 16,
      textAlign: 'center',
    },
    okBtn: {
      backgroundColor: C.primary,
      borderRadius: 10,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    okText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    cancelBtn: {
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: C.inputBg,
    },
    cancelText: { fontSize: 16, color: C.textSec },
  });

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={S.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={S.sheet}>
          <View style={S.handle} />

          <View style={S.section}>
            <Text style={S.title}>{t("transactions.transactionDate")}</Text>
            <Text style={S.subtitle}>{formatDayMonth(currentDate, t)}</Text>

            <View style={S.presetGap}>
              {presets.map((preset) => {
                const isSelected = currentDate.toDateString() === preset.date.toDateString();
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => handlePreset(preset.date)}
                    style={[
                      S.presetBtn,
                      {
                        backgroundColor: isSelected ? C.primaryBg : C.inputBg,
                        borderColor: isSelected ? C.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[S.presetLabel, { color: isSelected ? C.textMain : C.textMain, fontWeight: isSelected ? '700' : '400' }]}>
                      {preset.label}
                    </Text>
                    <Text style={S.presetDate}>{formatDayMonth(preset.date, t)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={S.customLabel}>{t("common.selectDate")}</Text>
            <View style={S.customHintRow}>
              <Text style={S.customHint}>{t('common.day')}</Text>
              <Text style={S.customHint}>{t('common.month')}</Text>
              <Text style={S.customHintWide}>{t('common.year')}</Text>
            </View>
            <View style={S.customFieldsRow}>
              <TextInput
                ref={dayRef}
                value={customDay}
                onChangeText={handleDayChange}
                onBlur={handleDayBlur}
                placeholder={t('datePicker.dd')}
                placeholderTextColor={C.textSec}
                keyboardType="number-pad"
                maxLength={2}
                style={S.customInput}
              />
              <TextInput
                ref={monthRef}
                value={customMonth}
                onChangeText={handleMonthChange}
                onBlur={handleMonthBlur}
                onKeyPress={handleMonthKeyPress}
                placeholder={t('datePicker.mm')}
                placeholderTextColor={C.textSec}
                keyboardType="number-pad"
                maxLength={2}
                style={S.customInput}
              />
              <TextInput
                value={customYear}
                onChangeText={(txt) => setCustomYear(txt.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder={t('datePicker.yyyy')}
                placeholderTextColor={C.textSec}
                keyboardType="number-pad"
                maxLength={4}
                style={S.customInputWide}
              />
              <TouchableOpacity onPress={handleCustomApply} style={S.okBtn}>
                <Text style={S.okText}>{t('datePicker.ok')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onClose} style={S.cancelBtn}>
              <Text style={S.cancelText}>{t('datePicker.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
