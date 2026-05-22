import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { PremiumBadge } from './PremiumBadge';
import * as ImagePicker from 'expo-image-picker';
import { aiService } from '../../services/ai';
import type { AiReceiptResult } from '../../services/ai';
import { useToast } from './Toast';

interface ReceiptScannerProps {
  onResult: (result: AiReceiptResult) => void;
  onError?: (error: string) => void;
}

export function ReceiptScannerButton({ onResult, onError }: ReceiptScannerProps) {
  const { t } = useTranslation();
  const C = useTheme();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);
  const receiptAllowed = checkAccess('AI_RECEIPT')?.allowed;

  const handlePress = () => {
    if (showPaywall('AI_RECEIPT')) return;
    setShowPicker(true);
  };

  const scanFrom = async (source: 'camera' | 'gallery') => {
    setShowPicker(false);

    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { toast.showError(t('receiptScanner.allowCamera')); return; }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { toast.showError(t('receiptScanner.allowGallery')); return; }
      }

      const launchFn = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launchFn({ mediaTypes: ['images'], quality: 0.7, base64: true, allowsEditing: true });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setIsLoading(true);
      const asset = result.assets[0];
      const aiResult = await aiService.parseReceipt(asset.base64!, asset.mimeType ?? 'image/jpeg');
      onResult(aiResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('receiptScanner.scanError');
      console.error('Receipt scan error:', error);
      onError?.(message);
      toast.showError(t('receiptScanner.notRecognized'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} disabled={isLoading} style={{ alignItems: 'center', gap: 4 }}>
        <View style={{ position: 'relative' }}>
          <View style={{
            width: 48, height: 48, borderRadius: 16,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: isLoading ? C.inputBg : C.primaryBg,
            borderWidth: 1, borderColor: C.border,
          }}>
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={20} color={C.textSec} />
            ) : (
              <Ionicons name="camera-outline" size={20} color={C.primary} />
            )}
          </View>
          {!receiptAllowed && <PremiumBadge size="sm" style={{ position: 'absolute', top: -6, right: -6 }} />}
        </View>
        <Text style={{ fontSize: 12, color: C.textSec }}>{isLoading ? t('receiptScanner.scanning') : t('receiptScanner.receipt')}</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setShowPicker(false)}>
          <Pressable style={{ backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, paddingTop: 8 }} onPress={e => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.textMuted, alignSelf: 'center', marginBottom: 16 }} />

            <Text style={{ fontSize: 18, fontWeight: '700', color: C.textMain, textAlign: 'center', marginBottom: 20 }}>{t('receiptScanner.scanReceipt')}</Text>

            <Pressable onPress={() => scanFrom('camera')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#6366F115', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="camera" size={22} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.textMain }}>{t('receiptScanner.camera')}</Text>
                <Text style={{ fontSize: 13, color: C.textSec }}>{t('receiptScanner.takePhoto')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </Pressable>

            <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 20 }} />

            <Pressable onPress={() => scanFrom('gallery')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#818CF815', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="images" size={22} color="#818CF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.textMain }}>{t('receiptScanner.gallery')}</Text>
                <Text style={{ fontSize: 13, color: C.textSec }}>{t('receiptScanner.selectFromGallery')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}