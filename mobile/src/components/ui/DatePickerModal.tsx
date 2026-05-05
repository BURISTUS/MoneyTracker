import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  TextInput,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Text } from '../../../components/ui/text';

interface DatePickerModalProps {
  visible: boolean;
  currentDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function getPresetDates() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);
  return [
    { label: 'Сегодня', date: today },
    { label: 'Вчера', date: yesterday },
    { label: 'Позавчера', date: dayBefore },
  ];
}

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

export function DatePickerModal({
  visible,
  currentDate,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  const { t } = useTranslation();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const [customDay, setCustomDay] = useState(pad(now.getDate()));
  const [customMonth, setCustomMonth] = useState(pad(now.getMonth() + 1));
  const [customYear, setCustomYear] = useState(String(now.getFullYear()));

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);

  const presets = useMemo(() => getPresetDates(), []);

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

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View className="flex-1 bg-[rgba(0,0,0,0.7)] justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="bg-[#13131A] rounded-t-3xl"
          style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
        >
          <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-4" />

          <View className="px-5">
            <Text bold className="text-lg text-white mb-1">{t("transactions.transactionDate")}</Text>
            <Text className="text-sm text-[#8E8E93] mb-5">{formatDayMonth(currentDate)}</Text>

            <View className="gap-2 mb-5">
              {presets.map((preset) => {
                const isSelected = currentDate.toDateString() === preset.date.toDateString();
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => handlePreset(preset.date)}
                    className="flex-row justify-between items-center py-3.5 px-4 rounded-xl border"
                    style={{
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: isSelected ? '#6366F1' : 'transparent',
                    }}
                  >
                    <Text bold={isSelected} className={`text-base ${isSelected ? 'text-white' : 'text-[#EBEBF5]'}`}>
                      {preset.label}
                    </Text>
                    <Text className="text-sm text-[#8E8E93]">{formatDayMonth(preset.date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text bold className="text-xs text-[#8E8E93] mb-2 uppercase">{t("common.selectDate")}</Text>
            <View className="flex-row gap-2 mb-1">
              <Text className="flex-1 text-[10px] text-[#52525B] text-center uppercase">{t('common.day')}</Text>
              <Text className="flex-1 text-[10px] text-[#52525B] text-center uppercase">{t('common.month')}</Text>
              <Text className="flex-[1.3] text-[10px] text-[#52525B] text-center uppercase">{t('common.year')}</Text>
            </View>
            <View className="flex-row gap-2 mb-4">
              <TextInput
                ref={dayRef}
                value={customDay}
                onChangeText={handleDayChange}
                onBlur={handleDayBlur}
                placeholder="ДД"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={2}
                className="flex-1 bg-[rgba(255,255,255,0.06)] rounded-[10px] px-3 py-3 text-white text-base text-center"
              />
              <TextInput
                ref={monthRef}
                value={customMonth}
                onChangeText={handleMonthChange}
                onBlur={handleMonthBlur}
                onKeyPress={handleMonthKeyPress}
                placeholder="ММ"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={2}
                className="flex-1 bg-[rgba(255,255,255,0.06)] rounded-[10px] px-3 py-3 text-white text-base text-center"
              />
              <TextInput
                value={customYear}
                onChangeText={(t) => setCustomYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="ГГГГ"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={4}
                className="flex-[1.3] bg-[rgba(255,255,255,0.06)] rounded-[10px] px-3 py-3 text-white text-base text-center"
              />
              <TouchableOpacity
                onPress={handleCustomApply}
                className="bg-primary-500 rounded-[10px] px-5 justify-center"
              >
                <Text bold className="text-base text-white">OK</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="py-3.5 items-center rounded-xl bg-[rgba(255,255,255,0.04)]"
            >
              <Text className="text-base text-[#8E8E93]">Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
