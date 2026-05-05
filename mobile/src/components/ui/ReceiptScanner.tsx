import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import { aiService } from '../../services/ai';
import type { AiReceiptResult } from '../../services/ai';

interface ReceiptScannerProps {
  onResult: (result: AiReceiptResult) => void;
  onError?: (error: string) => void;
  color?: string;
}

export function ReceiptScannerButton({
  onResult,
  onError,
}: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Нет доступа', 'Разрешите доступ к камере в настройках');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) {
        return;
      }

      const asset = result.assets[0];
      const mimeType: string = asset.mimeType ?? 'image/jpeg';

      setIsLoading(true);

      const aiResult = await aiService.parseReceipt(asset.base64!, mimeType);
      onResult(aiResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка сканирования';
      console.error('Receipt scan error:', error);
      onError?.(message);
      Alert.alert('Ошибка', 'Не удалось распознать чек. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleScan}
      disabled={isLoading}
      className="items-center gap-1"
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {isLoading ? (
          <Ionicons name="hourglass-outline" size={20} color="#8E8E93" />
        ) : (
          <Ionicons name="camera-outline" size={20} color="#6366F1" />
        )}
      </View>
      <Text className="text-xs text-[#8E8E93]">
        {isLoading ? 'Скан...' : 'Чек'}
      </Text>
    </TouchableOpacity>
  );
}

export function ReceiptGalleryButton({
  onResult,
  onError,
}: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Нет доступа', 'Разрешите доступ к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const asset = result.assets[0];
      setIsLoading(true);

      const aiResult = await aiService.parseReceipt(
        asset.base64!,
        asset.mimeType ?? 'image/jpeg',
      );
      onResult(aiResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      onError?.(message);
      Alert.alert('Ошибка', 'Не удалось распознать чек.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePick} disabled={isLoading} className="items-center gap-1">
      <View className="w-12 h-12 rounded-full items-center justify-center bg-[rgba(99,102,241,0.1)]">
        <Text className="text-xl">🖼️</Text>
      </View>
      <Text className="text-xs text-[#8E8E93]">Галерея</Text>
    </TouchableOpacity>
  );
}