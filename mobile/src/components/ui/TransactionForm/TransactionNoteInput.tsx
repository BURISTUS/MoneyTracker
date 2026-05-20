import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../stores/themeStore';

interface TransactionNoteInputProps {
  visible: boolean;
  note: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function TransactionNoteInput({
  visible,
  note,
  onChangeText,
  placeholder,
}: TransactionNoteInputProps) {
  const { t } = useTranslation();
  const C = useTheme();

  const S = useMemo(
    () =>
      StyleSheet.create({
        section: { paddingHorizontal: 20, marginBottom: 16 },
        noteInput: {
          backgroundColor: C.inputBg,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: C.textMain,
          borderWidth: 1,
          borderColor: C.border,
        },
      }),
    [C],
  );

  if (!visible) return null;

  return (
    <View style={S.section}>
      <TextInput
        style={S.noteInput}
        value={note}
        onChangeText={onChangeText}
        placeholder={placeholder || t('transactions.notePlaceholder')}
        placeholderTextColor={C.textMuted}
        autoFocus
      />
    </View>
  );
}
