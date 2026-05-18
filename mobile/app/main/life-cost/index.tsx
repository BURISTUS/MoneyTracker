import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { useToast } from '../../../src/components/ui/Toast';

type SalaryPeriod = 'hour' | 'week' | 'month' | 'year';

const HOURS_IN_PERIOD: Record<SalaryPeriod, number> = {
  hour: 1,
  week: 40,
  month: 164,
  year: 1971,
};

const PERIODS: SalaryPeriod[] = ['hour', 'week', 'month', 'year'];

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

export default function LifeCostScreen() {
  const C = useTheme();
  const s = StyleSheet.create({
    flex: { flex: 1 },
    container: { backgroundColor: C.bg, paddingHorizontal: 16, paddingBottom: 32 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingTop: 8 },
    backBtn: { padding: 4, marginLeft: -4 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain, letterSpacing: -0.3 },
    card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 12 },
    cardIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cardLabel: { fontSize: 13, color: C.textSec, fontWeight: '500', marginBottom: 8 },
    rateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 },
    rateValue: { fontSize: 48, fontWeight: '700', color: C.textMain, letterSpacing: -1.5, lineHeight: 52 },
    rateCurrency: { fontSize: 24, fontWeight: '600', color: C.primary },
    ratePlaceholder: { fontSize: 48, fontWeight: '700', color: C.textMuted, marginBottom: 4 },
    rateSubtext: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: C.textSec },
    tabsOuter: { backgroundColor: C.inputBg, borderRadius: 10, padding: 2, marginBottom: 16, borderWidth: 1, borderColor: C.border },
    tabsRow: { flexDirection: 'row', position: 'relative' },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, zIndex: 2 },
    tabActive: {},
    tabText: { fontSize: 12, fontWeight: '500', color: C.textMuted },
    tabTextActive: { color: C.textMain, fontWeight: '600' },
    tabIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: C.primaryBg, borderRadius: 8, borderWidth: 1, borderColor: C.primaryBorder, zIndex: 1 },
    inputWrap: { marginBottom: 4 },
    input: { width: '100%' as any, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, fontWeight: '500', color: C.textMain },
    saveArea: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
    saveRow: { alignItems: 'center', marginBottom: 14 },
    saveLabel: { fontSize: 13, color: C.textSec, marginBottom: 4 },
    saveRateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    saveRateValue: { fontSize: 32, fontWeight: '700', color: C.primary, letterSpacing: -1, lineHeight: 36 },
    saveRateUnit: { fontSize: 16, fontWeight: '500', color: C.textSec },
    saveBtn: { backgroundColor: C.primary, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  });
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const setHourlyRate = useDataStore((s) => s.setHourlyRate);
  const { showSuccess } = useToast();
  const hourlyRate = getHourlyRate();

  const PERIOD_LABELS: Record<SalaryPeriod, string> = useMemo(() => ({
    hour: t('lifeCost.perHour'),
    week: t('lifeCost.perWeek'),
    month: t('lifeCost.perMonth'),
    year: t('lifeCost.perYear'),
  }), [t]);

  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('month');
  const [salaryInput, setSalaryInput] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const tabWidths = useRef<Record<SalaryPeriod, number>>({ hour: 0, week: 0, month: 0, year: 0 }).current;
  const tabXPositions = useRef<Record<SalaryPeriod, number>>({ hour: 0, week: 0, month: 0, year: 0 }).current;
  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const calculatedHourlyRate = useMemo(() => {
    const salary = parseFloat(salaryInput);
    if (!salary || salary <= 0) return null;
    return Math.round((salary / HOURS_IN_PERIOD[salaryPeriod]) * 100) / 100;
  }, [salaryInput, salaryPeriod]);

  const displayRates = useMemo(() => {
    const rate = calculatedHourlyRate ?? hourlyRate;
    if (rate <= 0) return null;
    return {
      hourly: formatNumber(rate),
      monthly: formatNumber(rate * 164),
      yearly: formatNumber(rate * 1971),
    };
  }, [calculatedHourlyRate, hourlyRate]);

  const handleTabPress = useCallback(
    (period: SalaryPeriod) => {
      setSalaryPeriod(period);
      Animated.spring(indicatorX, {
        toValue: tabXPositions[period],
        useNativeDriver: true,
        bounciness: 10,
        speed: 14,
      }).start();
    },
    [indicatorX, tabXPositions],
  );

  const handleSaveRate = useCallback(async () => {
    if (!calculatedHourlyRate || calculatedHourlyRate <= 0) return;
    await setHourlyRate(calculatedHourlyRate);
    showSuccess(t('lifeCost.rateSaved', { rate: calculatedHourlyRate.toFixed(0) }));
  }, [calculatedHourlyRate, setHourlyRate]);

  const onTabLayout = useCallback(
    (period: SalaryPeriod, event: { nativeEvent: { layout: { x: number; width: number } } }) => {
      tabWidths[period] = event.nativeEvent.layout.width;
      tabXPositions[period] = event.nativeEvent.layout.x;
      if (period === salaryPeriod) indicatorX.setValue(event.nativeEvent.layout.x);
    },
    [salaryPeriod, indicatorX, tabWidths, tabXPositions],
  );

  const showResult = (calculatedHourlyRate ?? hourlyRate) > 0;

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.flex, s.container, { paddingTop: insets.top }]}>
        <View style={{ position: 'relative' }}>
          <View style={s.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#A1A1AA" />
            </Pressable>
            <Text style={s.headerTitle}>{t('lifeCost.title', 'Life Cost')}</Text>
          </View>
        </View>
        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.cardIconWrap}>
            <Ionicons name="hourglass-outline" size={22} color="#6366F1" />
          </View>
          <Text style={s.cardLabel}>{t("lifeCost.hourlyRateLabel")}</Text>
          {showResult ? (
            <>
              <View style={s.rateRow}>
                <Text style={s.rateValue}>{displayRates?.hourly}</Text>
                <Text style={s.rateCurrency}>₽</Text>
              </View>
              <Text style={s.rateSubtext}>
                {t("lifeCost.rateSummary", { monthly: displayRates?.monthly, yearly: displayRates?.yearly })}
              </Text>
            </>
          ) : (
            <>
              <Text style={s.ratePlaceholder}>—</Text>
              <Text style={s.rateSubtext}>{t("lifeCost.calculateRateBelow")}</Text>
            </>
          )}
        </Animated.View>

        <View style={s.card}>
          <View style={s.sectionHeader}>
            <Ionicons name="calculator-outline" size={18} color="#A1A1AA" />
            <Text style={s.sectionTitle}>{t("lifeCost.calculator")}</Text>
          </View>

          <View style={s.tabsOuter}>
            <View style={s.tabsRow}>
              {PERIODS.map((period) => {
                const isActive = salaryPeriod === period;
                return (
                  <Pressable
                    key={period}
                    style={[s.tab, isActive && s.tabActive]}
                    onPress={() => handleTabPress(period)}
                    onLayout={(e) => onTabLayout(period, e)}
                  >
                    <Text style={[s.tabText, isActive && s.tabTextActive]}>
                      {PERIOD_LABELS[period]}
                    </Text>
                  </Pressable>
                );
              })}
              <Animated.View
                style={[s.tabIndicator, { transform: [{ translateX: indicatorX }], width: tabWidths[salaryPeriod] || 0 }]}
              />
            </View>
          </View>

          <View style={s.inputWrap}>
            <TextInput
              value={salaryInput}
              onChangeText={(t) => setSalaryInput(t.replace(/[^0-9]/g, ''))}
              placeholder={t('lifeCost.salaryPlaceholder', { period: PERIOD_LABELS[salaryPeriod].toLowerCase() })}
              placeholderTextColor="#52525B"
              keyboardType="decimal-pad"
              style={s.input}
            />
          </View>

          {calculatedHourlyRate !== null && calculatedHourlyRate > 0 && (
            <View style={s.saveArea}>
              <View style={s.saveRow}>
                <Text style={s.saveLabel}>{t("lifeCost.thisIs")}</Text>
                <View style={s.saveRateRow}>
                  <Text style={s.saveRateValue}>{formatNumber(calculatedHourlyRate)}</Text>
                  <Text style={s.saveRateUnit}>{t("lifeCost.rubPerHour")}</Text>
                </View>
              </View>
              <Pressable style={s.saveBtn} onPress={handleSaveRate}>
                <Text style={s.saveBtnText}>{t("lifeCost.apply")}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
