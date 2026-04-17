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
import { Text } from './Text';

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
  const [customDay, setCustomDay] = useState('');
  const [customMonth, setCustomMonth] = useState('');

  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);

  const presets = useMemo(() => getPresetDates(), []);

  const handlePreset = useCallback((date: Date) => {
    onSelect(date);
    setCustomDay('');
    setCustomMonth('');
  }, [onSelect]);

  const handleCustomApply = useCallback(() => {
    const d = parseInt(customDay, 10);
    const m = parseInt(customMonth, 10);
    const y = new Date().getFullYear();
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      onSelect(new Date(y, m - 1, d));
      setCustomDay('');
      setCustomMonth('');
    }
  }, [customDay, customMonth, onSelect]);

  const handleDayChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
    setCustomDay(clean);
    if (clean.length === 2) {
      monthRef.current?.focus();
    }
  }, []);

  const handleMonthChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 2);
    setCustomMonth(clean);
  }, []);

  const handleMonthKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === 'Backspace' && customMonth.length === 0) {
        dayRef.current?.focus();
      }
    },
    [customMonth],
  );

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center' as const,
  };

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        }}>
          <View style={{ width: 36, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />

          <View style={{ paddingHorizontal: 20 }}>
            <Text size="lg" weight="bold" style={{ color: '#FFFFFF', marginBottom: 4 }}>
              Дата операции
            </Text>
            <Text size="sm" style={{ color: '#8E8E93', marginBottom: 20 }}>
              {formatDayMonth(currentDate)}
            </Text>

            {/* Presets */}
            <View style={{ gap: 8, marginBottom: 20 }}>
              {presets.map((preset) => {
                const isSelected = currentDate.toDateString() === preset.date.toDateString();
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => handlePreset(preset.date)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: isSelected ? '#6366F1' : 'transparent',
                    }}
                  >
                    <Text size="md" weight={isSelected ? 'semibold' : 'regular'} style={{ color: isSelected ? '#FFFFFF' : '#EBEBF5' }}>
                      {preset.label}
                    </Text>
                    <Text size="sm" style={{ color: '#8E8E93' }}>
                      {formatDayMonth(preset.date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom date inputs — only day + month */}
            <Text size="xs" weight="medium" style={{ color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase' }}>
              Выбрать дату
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TextInput
                ref={dayRef}
                value={customDay}
                onChangeText={handleDayChange}
                placeholder="ДД"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={2}
                style={{ ...inputStyle, flex: 1 }}
              />
              <TextInput
                ref={monthRef}
                value={customMonth}
                onChangeText={handleMonthChange}
                onKeyPress={handleMonthKeyPress}
                placeholder="ММ"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={2}
                style={{ ...inputStyle, flex: 1 }}
              />
              <TouchableOpacity
                onPress={handleCustomApply}
                style={{
                  backgroundColor: '#6366F1',
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  justifyContent: 'center',
                }}
              >
                <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>OK</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 14,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <Text size="md" style={{ color: '#8E8E93' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
