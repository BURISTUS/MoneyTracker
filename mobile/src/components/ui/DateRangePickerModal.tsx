import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  Platform,
  ScrollView,
  PanResponder,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerModalProps {
  visible: boolean;
  currentRange: DateRange | null;
  onSelect: (range: DateRange) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay();
  if (startWeekday === 0) startWeekday = 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 1; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 0; i < remaining; i++) cells.push(null);
  }
  return cells;
}

function formatShort(date: Date): string {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

export type { DateRange };
export function DateRangePickerModal({
  visible,
  currentRange,
  onSelect,
  onClose,
}: DateRangePickerModalProps) {
  const C = useTheme();
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const isFutureMonth = viewYear > todayDate.getFullYear()
    || (viewYear === todayDate.getFullYear() && viewMonth > todayDate.getMonth());

  const switchMonth = useCallback((delta: -1 | 1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      if (delta === -1) {
        setViewMonth((m) => {
          if (m === 0) { setViewYear((y) => y - 1); return 11; }
          return m - 1;
        });
      } else {
        setViewMonth((m) => {
          if (m === 11) { setViewYear((y) => y + 1); return 0; }
          return m + 1;
        });
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start(() => { isAnimating.current = false; });
    });
  }, [fadeAnim]);

  const handleDayPress = useCallback((day: number) => {
    const tapped = new Date(viewYear, viewMonth, day);
    if (tapped > todayDate) return;

    if (!start || (start && end)) {
      setStart(tapped);
      setEnd(null);
    } else {
      if (tapped < start) {
        setStart(tapped);
        setEnd(start);
      } else {
        setEnd(tapped);
      }
    }
  }, [viewYear, viewMonth, start, end, todayDate]);

  const handleApply = useCallback(() => {
    if (start && end) {
      onSelect({ startDate: start, endDate: end });
    }
  }, [start, end, onSelect]);

  const handlePreset = useCallback((s: Date, e: Date) => {
    const clampedEnd = e > todayDate ? todayDate : e;
    setStart(s);
    setEnd(clampedEnd);
    setViewYear(s.getFullYear());
    setViewMonth(s.getMonth());
  }, [todayDate]);

  const handleClose = useCallback(() => {
    setStart(null);
    setEnd(null);
    onClose();
  }, [onClose]);

  const presets = useMemo(() => {
    const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    const weekStart = new Date(today);
    const dow = today.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - dow + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > today) weekEnd.setTime(today.getTime());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (monthEnd > today) monthEnd.setTime(today.getTime());
    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const last30 = new Date(today);
    last30.setDate(last30.getDate() - 29);
    return [
      { label: 'Этот месяц', start: monthStart, end: monthEnd },
      { label: 'Прошлый месяц', start: prevMonthStart, end: prevMonthEnd },
      { label: 'Эта неделя', start: weekStart, end: weekEnd },
      { label: 'Последние 30 дней', start: last30, end: today },
    ];
  }, [todayDate]);

  const calendarPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, gs) =>
      Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.2,
    onMoveShouldSetPanResponderCapture: (_, gs) =>
      Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.2,
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) < 20) return;
      if (gs.dx > 0) switchMonth(-1);
      else if (!isFutureMonth) switchMonth(1);
    },
  }), [switchMonth, isFutureMonth]);

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={handleClose} transparent>
      <View style={{ flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
        <View
          style={{ backgroundColor: C.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
        >
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.handle, alignSelf: 'center', marginTop: 8, marginBottom: 12 }} />

          <View className="px-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text bold className="text-lg" style={{ color: C.textMain }}>Выбрать период</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={C.textSec} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                {presets.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => handlePreset(p.start, p.end)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.divider }}
                  >
                    <Text className="text-xs" style={{ color: C.textMain }}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {start && !end && (
              <View className="mb-2 py-2 px-3 rounded-lg bg-primary-500/10">
                <Text className="text-xs text-primary-400">
                  Выберите конечную дату
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity onPress={() => switchMonth(-1)} className="w-9 h-9 items-center justify-center">
                <Ionicons name="chevron-back" size={20} color={C.textMain} />
              </TouchableOpacity>
              <Text bold className="text-base" style={{ color: C.textMain }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={() => !isFutureMonth && switchMonth(1)}
                className="w-9 h-9 items-center justify-center"
                style={{ opacity: isFutureMonth ? 0.2 : 1 }}
              >
                <Ionicons name="chevron-forward" size={20} color={C.textMain} />
              </TouchableOpacity>
            </View>

            <Animated.View style={{ opacity: fadeAnim }}>
              <View className="flex-row mb-1">
                {WEEKDAYS.map((d) => (
                  <View key={d} className="flex-1 items-center py-1.5">
                    <Text className="text-[10px]" style={{ color: C.textSec }}>{d}</Text>
                  </View>
                ))}
              </View>

              <View {...calendarPanResponder.panHandlers}>
                <View className="flex-row flex-wrap">
                {calendarDays.map((day, i) => {
                  if (day === null) {
                    return <View key={`e${i}`} className="w-[14.28%] h-10" />;
                  }

                  const date = new Date(viewYear, viewMonth, day);
                  const isFuture = date > todayDate;
                  const isToday = isSameDay(date, todayDate);
                  const isStart = start && isSameDay(date, start);
                  const isEnd = end && isSameDay(date, end);
                  const inRange = start && end && !isStart && !isEnd && isDateInRange(date, start, end);

                  return (
                    <View key={`d${i}`} className="w-[14.28%] h-10 items-center justify-center">
                      <TouchableOpacity
                        onPress={() => !isFuture && handleDayPress(day)}
                        className="w-9 h-9 items-center justify-center rounded-full"
                        style={
                          isStart || isEnd
                            ? { backgroundColor: C.tabActive }
                            : inRange
                              ? { backgroundColor: C.primaryBg }
                              : isToday
                                ? { borderWidth: 1.5, borderColor: C.tabActive }
                                : undefined
                        }
                      >
                        <Text
                          className="text-xs"
                          style={{
                            color: isFuture ? C.textMuted
                              : isStart || isEnd ? '#FFF'
                              : isToday ? C.primary
                              : inRange ? C.primary
                              : C.textMain,
                            fontWeight: isStart || isEnd ? '700' : isToday ? '600' : '400',
                          }}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
              </View>
            </Animated.View>

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border }}>
              {start && end ? (
                <TouchableOpacity
                  onPress={handleApply}
                  className="rounded-xl py-3.5 items-center"
                  style={{ backgroundColor: C.tabActive }}
                >
                  <Text bold className="text-base" style={{ color: '#FFF' }}>
                    {formatShort(start)} — {formatShort(end)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: C.inputBg }}>
                  <Text className="text-sm" style={{ color: C.textSec }}>
                    {start ? `Начало: ${formatShort(start)}` : 'Нажмите на начальную дату'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
