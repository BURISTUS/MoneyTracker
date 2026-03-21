import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, useColorScheme, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDataStore } from '../../../src/stores/dataStore';
import { lightTheme, darkTheme } from '../../../src/utils/theme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount);
}

export default function LifeCostScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const { calculateLifeCost } = useDataStore();
  const [hourlyRate, setHourlyRate] = useState('1500');
  const [amount, setAmount] = useState('');
  const [investmentYears, setInvestmentYears] = useState('10');
  const [investmentAmount, setInvestmentAmount] = useState('');

  const rate = useMemo(() => parseFloat(hourlyRate) || 1500, [hourlyRate]);
  const inputAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const lifeCost = useMemo(() => calculateLifeCost(inputAmount * 100), [inputAmount, calculateLifeCost]);
  const investAmount = useMemo(() => parseFloat(investmentAmount) || 0, [investmentAmount]);
  const years = useMemo(() => parseFloat(investmentYears) || 10, [investmentYears]);
  const futureValue = useMemo(() => {
    if (investAmount <= 0) return 0;
    const annualRate = 0.12;
    const months = years * 12;
    const monthlyRate = annualRate / 12;
    return investAmount * Math.pow(1 + monthlyRate, months);
  }, [investAmount, years]);
  const investmentGain = useMemo(() => futureValue - investAmount, [futureValue, investAmount]);

  const examples = [
    { name: 'iPhone 15 Pro', price: 120000 },
    { name: 'MacBook Pro', price: 180000 },
    { name: 'Отпуск', price: 150000 },
    { name: 'Кроссовки', price: 15000 },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 24 },
    header: { alignItems: 'center', marginBottom: 24 },
    headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F59E0B15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
    headerSubtitle: { fontSize: 14, textAlign: 'center', maxWidth: 280 },
    section: { borderRadius: 20, padding: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    rateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#667eea10', borderRadius: 12, padding: 16 },
    rateCurrency: { fontSize: 24, fontWeight: '700', marginRight: 8 },
    rateInput: { flex: 1, fontSize: 24, fontWeight: '700' },
    rateLabel: { fontSize: 16 },
    rateHint: { fontSize: 12, marginTop: 8 },
    amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundTertiary, borderRadius: 12, padding: 16, marginBottom: 16 },
    amountCurrency: { fontSize: 24, fontWeight: '700', marginRight: 8 },
    amountInput: { flex: 1, fontSize: 24, fontWeight: '700' },
    resultCard: { backgroundColor: '#F59E0B10', borderRadius: 16, padding: 16, alignItems: 'center' },
    lifeCostBadge: { alignItems: 'center' },
    lifeCostHours: { fontSize: 36, fontWeight: '800', marginTop: 8 },
    lifeCostDays: { fontSize: 14, color: colors.textSecondary },
    resultMessage: { fontSize: 14, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
    investmentRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    investmentInput: { flex: 1, padding: 12, borderRadius: 10, fontSize: 16 },
    investmentResult: { borderRadius: 16, padding: 20, alignItems: 'center' },
    investmentResultLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    investmentResultValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
    investmentGain: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    investmentGainText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginLeft: 4 },
    examplesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    exampleCard: { width: '47%', borderRadius: 16, padding: 16 },
    exampleName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    examplePrice: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    exampleCost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    exampleHours: { fontSize: 12 },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="time" size={32} color="#F59E0B" /></View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Цена твоей жизни</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Узнай, сколько часов жизни стоит каждая покупка</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Твоя стоимость часа</Text>
          <View style={styles.rateInputContainer}>
            <Text style={[styles.rateCurrency, { color: colors.primary }]}>₽</Text>
            <TextInput style={[styles.rateInput, { color: colors.text }]} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>в час</Text>
          </View>
          <Text style={[styles.rateHint, { color: colors.textSecondary }]}>При зарплате {formatCurrency(rate * 176)}/месяц</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Калькулятор</Text>
          <View style={styles.amountInputContainer}>
            <Text style={[styles.amountCurrency, { color: colors.primary }]}>₽</Text>
            <TextInput style={[styles.amountInput, { color: colors.text }]} placeholder="Введите сумму" placeholderTextColor={colors.textTertiary} value={amount} onChangeText={setAmount} keyboardType="numeric" />
          </View>
          {inputAmount > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.lifeCostBadge}>
                <Ionicons name="time" size={32} color="#F59E0B" />
                <Text style={[styles.lifeCostHours, { color: colors.text }]}>{lifeCost.hours} часов</Text>
                <Text style={[styles.lifeCostDays, { color: colors.textSecondary }]}>{lifeCost.days} рабочих дней</Text>
              </View>
              <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>{lifeCost.message}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Инвестиции</Text>
          <View style={styles.investmentRow}>
            <TextInput style={[styles.investmentInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]} placeholder="Сумма" placeholderTextColor={colors.textTertiary} value={investmentAmount} onChangeText={setInvestmentAmount} keyboardType="numeric" />
            <TextInput style={[styles.investmentInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]} placeholder="Лет" placeholderTextColor={colors.textTertiary} value={investmentYears} onChangeText={setInvestmentYears} keyboardType="numeric" />
          </View>
          {investAmount > 0 && (
            <LinearGradient colors={[colors.primary, colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.investmentResult}>
              <Text style={styles.investmentResultLabel}>Через {years} лет</Text>
              <Text style={styles.investmentResultValue}>{formatCurrency(futureValue)}</Text>
              <View style={styles.investmentGain}><Ionicons name="trending-up" size={16} color="#FFFFFF" /><Text style={styles.investmentGainText}>+{formatCurrency(investmentGain)}</Text></View>
            </LinearGradient>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Примеры</Text>
          <View style={styles.examplesGrid}>
            {examples.map((item, index) => {
              const exampleCost = calculateLifeCost(item.price * 100);
              return (
                <TouchableOpacity key={index} style={[styles.exampleCard, { backgroundColor: colors.surface }]} onPress={() => setAmount(item.price.toString())}>
                  <Text style={[styles.exampleName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.examplePrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
                  <View style={styles.exampleCost}><Ionicons name="time" size={12} color="#F59E0B" /><Text style={[styles.exampleHours, { color: colors.textSecondary }]}>{exampleCost.hours}ч</Text></View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
