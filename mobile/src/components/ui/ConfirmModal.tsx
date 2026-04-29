import React, { useCallback } from 'react';
import { View, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';

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

const VARIANT_CONFIG = {
  destructive: {
    icon: 'trash-outline' as const,
    iconColor: '#EF4444',
    iconBg: 'rgba(239,68,68,0.12)',
    confirmBg: '#EF4444',
    confirmText: '#FFFFFF',
  },
  confirm: {
    icon: 'help-circle-outline' as const,
    iconColor: '#6366F1',
    iconBg: 'rgba(99,102,241,0.12)',
    confirmBg: '#6366F1',
    confirmText: '#FFFFFF',
  },
};

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#141418',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: '#F5F5F5',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#8C8C8C',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8C8C8C',
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
  const cfg = VARIANT_CONFIG[variant];
  const actionText = confirmText ?? (variant === 'destructive' ? 'Удалить' : 'Подтвердить');

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
