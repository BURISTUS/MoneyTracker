import React, { useCallback } from 'react';
import { View, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';

type ConfirmVariant = 'destructive' | 'confirm';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  variant = 'destructive',
  confirmText,
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const C = useTheme();

  const VARIANT_CONFIG = {
    destructive: {
      icon: 'trash-outline' as const,
      iconColor: C.red,
      iconBg: C.redBg,
      confirmBg: C.red,
      confirmText: '#FFFFFF',
    },
    confirm: {
      icon: 'help-circle-outline' as const,
      iconColor: C.primary,
      iconBg: C.primaryBg,
      confirmBg: C.primary,
      confirmText: '#FFFFFF',
    },
  };

  const cfg = VARIANT_CONFIG[variant];
  const actionText = confirmText ?? (variant === 'destructive' ? 'Удалить' : 'Подтвердить');

  const S = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: C.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: C.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      padding: 24,
      width: '100%',
      maxWidth: 340,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: C.textMain,
      marginBottom: 6,
    },
    message: {
      fontSize: 14,
      color: C.textSec,
      lineHeight: 20,
      marginBottom: 24,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: C.divider,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '600',
      color: C.textSec,
    },
    confirmBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    confirmText: {
      fontSize: 14,
      fontWeight: '700',
    },
  });

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={S.overlay} onPress={onCancel}>
        <Pressable onPress={() => {}}>
          <View style={S.card}>
            <View style={[S.iconWrap, { backgroundColor: cfg.iconBg }]}>
              <Ionicons name={cfg.icon} size={24} color={cfg.iconColor} />
            </View>
            <Text style={S.title}>{title}</Text>
            <Text style={S.message}>{message}</Text>
            <View style={S.btnRow}>
              <TouchableOpacity onPress={onCancel} style={S.cancelBtn}>
                <Text style={S.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[S.confirmBtn, { backgroundColor: cfg.confirmBg }]}
              >
                <Text style={[S.confirmText, { color: cfg.confirmText }]}>{actionText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
