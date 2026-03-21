import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme } from '../../utils/theme';

interface LifeCostBadgeProps {
  amount: number; // в копейках
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

export function LifeCostBadge({ amount, size = 'small', showMessage = true }: LifeCostBadgeProps) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  const hourlyRate = 1500; // Примерная ставка в час
  const hours = Math.round((amount / 100) / hourlyRate * 10) / 10;
  const days = Math.round(hours / 8 * 10) / 10;

  let message = '';
  if (days >= 20) {
    message = `${Math.round(days)} рабочих дней`;
  } else if (days >= 10) {
    message = `${Math.round(days)} рабочих дня`;
  } else if (days >= 5) {
    message = `${Math.round(days)} рабочих дня`;
  } else if (days >= 1) {
    message = `${Math.round(hours)} часов`;
  } else {
    message = `${Math.round(hours * 60)} минут`;
  }

  const containerPadding = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const textSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const subtextSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;

  return (
    <View style={[styles.container, { backgroundColor: '#F59E0B15', padding: containerPadding }]}>
      <View style={styles.header}>
        <Ionicons name="time" size={iconSize} color="#F59E0B" />
        <Text style={[styles.hoursText, { color: '#F59E0B', fontSize: textSize }]}>
          {hours}ч
        </Text>
      </View>
      {showMessage && (
        <Text style={[styles.messageText, { color: colors.textSecondary, fontSize: subtextSize }]}>
          = {message} вашей жизни
        </Text>
      )}
    </View>
  );
}

export function LifeCostInline({ amount }: { amount: number }) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  const hourlyRate = 1500;
  const hours = Math.round((amount / 100) / hourlyRate * 10) / 10;

  return (
    <View style={styles.inlineContainer}>
      <Ionicons name="time-outline" size={12} color="#F59E0B" />
      <Text style={[styles.inlineText, { color: colors.textSecondary }]}>
        {hours}ч
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursText: {
    fontWeight: '700',
  },
  messageText: {
    marginTop: 4,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
