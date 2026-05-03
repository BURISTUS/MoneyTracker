import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

interface ToastContextValue {
  toasts: ToastData[];
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

// Global emitter for non-React code (api.ts interceptor)
type ToastEmitter = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
} | null;
let globalToast: ToastEmitter = null;

export function showGlobalError(message: string) {
  if (globalToast) {
    globalToast.showError(message);
  } else {
    console.error('[Toast]', message);
  }
}

export function showGlobalSuccess(message: string) {
  if (globalToast) {
    globalToast.showSuccess(message);
  } else {
    console.log('[Toast]', message);
  }
}

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; border: string }> = {
  success: {
    icon: 'checkmark-circle',
    color: '#489768',
    bg: 'rgba(72,151,104,0.12)',
    border: 'rgba(72,151,104,0.25)',
  },
  error: {
    icon: 'alert-circle',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
  },
  info: {
    icon: 'information-circle',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
  },
};

const AUTO_DISMISS_MS = 3000;

const S = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    ...Platform.select({ android: { elevation: 100 } }),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F5F5',
  },
  dismissBtn: {
    padding: 2,
  },
});

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const cfg = TOAST_CONFIG[toast.type];

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(toast.fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(toast.slideAnim, { toValue: -10, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss(toast.id));
  }, [toast, onDismiss]);

  return (
    <Animated.View
      style={[
        S.toast,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          opacity: toast.fadeAnim,
          transform: [{ translateY: toast.slideAnim }],
        },
      ]}
    >
      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      <Text style={S.message} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={handleDismiss} style={S.dismissBtn}>
        <Ionicons name="close" size={16} color="#8C8C8C" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      const id = ++counterRef.current;
      const fadeAnim = new Animated.Value(0);
      const slideAnim = new Animated.Value(-10);

      const newToast: ToastData = { id, message, type, fadeAnim, slideAnim };
      setToasts((prev) => [newToast, ...prev]);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [removeToast],
  );

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  // Register global emitter
  useEffect(() => {
    globalToast = { showError, showSuccess, showInfo };
    return () => { globalToast = null; };
  }, [showError, showSuccess, showInfo]);

  return (
    <ToastContext.Provider value={{ toasts, showSuccess, showError, showInfo, dismiss: removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useContext(ToastContext);

  return (
    <Modal transparent visible={toasts.length > 0} animationType="none" statusBarTranslucent>
      <View style={S.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </View>
    </Modal>
  );
}
