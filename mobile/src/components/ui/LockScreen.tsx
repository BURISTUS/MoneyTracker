import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../stores/themeStore';
import { useSecurityStore } from '../../stores/securityStore';
import { Text } from '../../../components/ui/text';

const PIN_LENGTH = 4;

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();
  const C = useTheme();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shakeAnim, setShakeAnim] = useState(false);

  const S = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        iconWrap: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: C.primaryBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        },
        title: {
          fontSize: 22,
          fontWeight: '700',
          color: C.textMain,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 15,
          color: C.textSec,
          marginBottom: 40,
        },
        dotsRow: {
          flexDirection: 'row',
          gap: 20,
          marginBottom: 40,
        },
        dot: {
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: C.border,
        },
        dotFilled: {
          backgroundColor: C.primary,
          borderColor: C.primary,
        },
        dotError: {
          borderColor: C.red,
          backgroundColor: C.red,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: 280,
          justifyContent: 'center',
        },
        numBtn: {
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 6,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
        },
        numText: {
          fontSize: 28,
          fontWeight: '600',
          color: C.textMain,
        },
        bioBtn: {
          marginTop: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: C.primaryBg,
        },
        bioText: {
          fontSize: 15,
          fontWeight: '600',
          color: C.primary,
        },
        errorText: {
          fontSize: 13,
          color: C.red,
          marginTop: 12,
        },
      }),
    [C],
  );

  const handleBiometric = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('security.unlockBiometric'),
        cancelLabel: t('common.cancel'),
      });

      if (result.success) {
        onUnlock();
      }
    } catch {}
  }, [onUnlock]);

  useEffect(() => {
    const checkBio = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        handleBiometric();
      }
    };
    checkBio();
  }, []);

  const handlePinInput = useCallback(
    (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === PIN_LENGTH) {
        const hash = simpleHash(newPin);
        const storedHash = useSecurityStore.getState().pinHash;
        if (hash === storedHash) {
          onUnlock();
        } else {
          setError(true);
          setShakeAnim(true);
          Vibration.vibrate(200);
          setTimeout(() => {
            setPin('');
            setShakeAnim(false);
          }, 600);
        }
      }
    },
    [pin, onUnlock],
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const dots = Array.from({ length: PIN_LENGTH });

  return (
    <View style={S.container}>
      <View style={S.iconWrap}>
        <Ionicons name="lock-closed" size={32} color={C.primary} />
      </View>

      <Text style={S.title}>{t('security.enterPin')}</Text>
      <Text style={S.subtitle}>{t('security.pinSubtitle')}</Text>

      <View
        style={[
          S.dotsRow,
          shakeAnim && { transform: [{ translateX: -10 }] },
        ]}
      >
        {dots.map((_, i) => (
          <View
            key={i}
            style={[
              S.dot,
              i < pin.length && !error && S.dotFilled,
              i < pin.length && error && S.dotError,
            ]}
          />
        ))}
      </View>

      {error && <Text style={S.errorText}>{t('security.wrongPin')}</Text>}

      <View style={S.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(
          (key) => {
            if (key === '') return <View key="empty" style={{ width: 80, height: 80, margin: 6 }} />;
            if (key === 'del') {
              return (
                <TouchableOpacity key="del" style={S.numBtn} onPress={handleDelete}>
                  <Ionicons name="backspace-outline" size={24} color={C.textSec} />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity key={key} style={S.numBtn} onPress={() => handlePinInput(key)}>
                <Text style={S.numText}>{key}</Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>

      <TouchableOpacity style={S.bioBtn} onPress={handleBiometric}>
        <Ionicons name="finger-print-outline" size={22} color={C.primary} />
        <Text style={S.bioText}>{t('security.useBiometric')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export { simpleHash };
