import React, { useMemo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../stores/themeStore';
import { Text } from '../../../../components/ui/text';
import type { MathOp } from './useTransactionForm';

const NUMPAD_KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '.', '0', '⌫', '+'];

interface AmountInputProps {
  displayAmount: string;
  lifeHours: string | null;
  showLifeCost: boolean;
  colors: { primary: string; background: string };
  pendingOp: MathOp;
  onNumberPress: (num: string) => void;
  onDelete: () => void;
  onMathOp: (op: MathOp) => void;
  onEquals: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}

export function AmountInput({
  displayAmount,
  lifeHours,
  showLifeCost,
  colors,
  pendingOp,
  onNumberPress,
  onDelete,
  onMathOp,
  onEquals,
  onSubmit,
  canSubmit,
  isSubmitting,
}: AmountInputProps) {
  const { t } = useTranslation();
  const C = useTheme();
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const S = useMemo(
    () =>
      StyleSheet.create({
        section: { paddingHorizontal: 20, marginBottom: 6 },
        sectionTitle: {
          fontSize: 12,
          fontWeight: '600',
          color: C.textSec,
          marginBottom: 8,
          textTransform: 'uppercase',
        },
        amountWrap: { alignItems: 'center', justifyContent: 'center' },
        amountText: { fontSize: 32, fontWeight: '800', letterSpacing: -1, lineHeight: 40 },
        lifeCostBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
          backgroundColor: C.inputBg,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.border,
        },
        lifeCostText: { fontSize: 16, color: C.yellow, fontWeight: '700' },
        numpadGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
        numpadKey: { width: '25%', aspectRatio: 1.3, alignItems: 'center', justifyContent: 'center' },
        numpadInner: {
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
        },
        numpadOp: { backgroundColor: C.primaryBg },
        numpadOpActive: { backgroundColor: C.primaryBorder },
        numpadDel: { backgroundColor: C.redBg },
        numpadKeyText: { fontSize: 20, fontWeight: '600', color: C.textMain },
        numpadOpText: { color: C.primary },
        numpadDelText: { color: C.red },
        bottomRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 4, gap: 10 },
        saveBtn: {
          flex: 1,
          height: 52,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: C.border,
          backgroundColor: C.primary,
        },
        saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
      }),
    [C],
  );

  return (
    <>
      <View style={[S.section, { marginBottom: 6 }]}>
        <Text style={S.sectionTitle}>{t('transactions.amount')}</Text>
        <View style={[S.amountWrap, { height: showLifeCost ? 100 : 70 }]}>
          <Text style={[S.amountText, { color: colors.primary }]} numberOfLines={1}>
            {displayAmount}
          </Text>
          {lifeHours && showLifeCost && (
            <View style={S.lifeCostBadge}>
              <Ionicons name="time-outline" size={16} color={C.yellow} />
              <Text style={S.lifeCostText}>
                {lifeHours} {t('common.workUnit')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={S.numpadGrid}>
        {NUMPAD_KEYS.map((key) => {
          const isOp = ['+', '−', '×', '÷'].includes(key);
          const isDelete = key === '⌫';
          const isActiveOp = isOp && pendingOp === key;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                if (isDelete) onDelete();
                else if (isOp) onMathOp(key as MathOp);
                else if (key === '.') return;
                else onNumberPress(key);
              }}
              onLongPress={
                isDelete
                  ? () => {
                      deleteTimer.current = setInterval(() => onDelete(), 80);
                    }
                  : undefined
              }
              onPressOut={
                isDelete
                  ? () => {
                      if (deleteTimer.current) {
                        clearInterval(deleteTimer.current);
                        deleteTimer.current = null;
                      }
                    }
                  : undefined
              }
              style={S.numpadKey}
              activeOpacity={0.6}
            >
              <View
                style={[
                  S.numpadInner,
                  isOp && S.numpadOp,
                  isActiveOp && S.numpadOpActive,
                  isDelete && S.numpadDel,
                ]}
              >
                <Text style={[S.numpadKeyText, isOp && S.numpadOpText, isDelete && S.numpadDelText]}>
                  {key}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 6 }} />
      <View style={S.bottomRow}>
        {pendingOp ? (
          <TouchableOpacity style={S.saveBtn} onPress={onEquals}>
            <Text style={S.saveText}>=</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!canSubmit}
            style={[
              S.saveBtn,
              {
                backgroundColor: !canSubmit ? C.divider : colors.primary,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
          >
            <Text style={S.saveText}>
              {isSubmitting ? t('common.saving') : `✓ ${t('common.save')}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
