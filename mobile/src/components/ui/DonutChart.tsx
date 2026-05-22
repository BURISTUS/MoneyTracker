import { useTranslation } from 'react-i18next';
import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../../stores/themeStore';
import Svg, { G, Circle } from 'react-native-svg';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import type { Category } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH * 0.64, 260);
const CENTER = CHART_SIZE / 2;
const STROKE_WIDTH = CHART_SIZE * 0.22;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ICON_RADIUS = RADIUS + 36;

interface DonutChartProps {
  categories: Array<{ category: Category; amount: number; percentage: number }>;
  totalAmount: number;
  onCategoryPress?: (categoryId: string) => void;
  type: 'EXPENSE' | 'INCOME';
}

export function DonutChart({
  categories,
  totalAmount,
  onCategoryPress,
  type,
}: DonutChartProps) {
  const { t } = useTranslation();
  const C = useTheme();
  if (categories.length === 0) {
    return (
      <View style={{ height: CHART_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, color: '#8E8E93' }}>{t("common.noData")}</Text>
      </View>
    );
  }

  // Build segments with cumulative offset
  let cumulativePct = 0;
  const segments = categories.map((item, i) => {
    const pct = item.percentage;
    const segment = {
      ...item,
      index: i,
      dashLength: (pct / 100) * CIRCUMFERENCE,
      dashOffset: -(cumulativePct / 100) * CIRCUMFERENCE,
      midAngleDeg: (cumulativePct + pct / 2) / 100 * 360, // degrees from top, clockwise
    };
    cumulativePct += pct;
    return segment;
  });

  const totalFormatted = (totalAmount / 100).toLocaleString('ru-RU');

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          {/* Background ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="transparent"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Segments — rotated -90° so 0° = top of circle */}
          <G rotation={-90} origin={`${CENTER}, ${CENTER}`}>
            {segments.map((seg) => (
              <Circle
                key={seg.category.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="transparent"
                stroke={seg.category.color || '#6366F1'}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${seg.dashLength} ${CIRCUMFERENCE}`}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                opacity={0.92}
              />
            ))}
          </G>
        </Svg>

        {/* Center text */}
        <View
          style={{
            position: 'absolute',
            top: CENTER - 36,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: type === 'EXPENSE' ? '#FF3B30' : '#34D399',
              letterSpacing: -0.5,
            }}
          >
            {totalFormatted}
          </Text>
          <Text style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>₽</Text>
        </View>

        {/* Category icons around the donut */}
        {segments.map((seg) => {
          const angleRad = (seg.midAngleDeg - 90) * (Math.PI / 180); // SVG coords: 0°=top, clockwise
          const x = CENTER + ICON_RADIUS * Math.cos(angleRad);
          const y = CENTER + ICON_RADIUS * Math.sin(angleRad);

          return (
            <Pressable
              key={seg.category.id}
              style={{
                position: 'absolute',
                left: x - 18,
                top: y - 18,
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: C.divider,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => onCategoryPress?.(seg.category.id)}
            >
              <CategoryIcon
                icon={seg.category.icon}
                color={seg.category.color || '#6366F1'}
                size={20}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Legend — show all categories */}
      <View style={{ width: '100%', marginTop: 12, gap: 8 }}>
        {categories.map((item) => (
          <View key={item.category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.category.color || '#6366F1',
              }}
            />
            <Text style={{ flex: 1, fontSize: 13, color: '#D4D4D8', fontWeight: '500' }}>
              {item.category.name}
            </Text>
            <Text style={{ fontSize: 13, color: C.textSec, fontWeight: '600' }}>
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
