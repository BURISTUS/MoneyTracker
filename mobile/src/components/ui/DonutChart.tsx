import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from './Text';
import { CategoryIcon } from './CategoryIcon';
import { useTheme } from '../../theme';
import type { Category } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);
const CENTER = CHART_SIZE / 2;
const STROKE_WIDTH = CHART_SIZE * 0.2;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const ICON_RADIUS = RADIUS + 35;

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
  const { spacing } = useTheme();

  const colors = type === 'EXPENSE'
    ? ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE']
    : ['#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#FFCC00'];

  if (categories.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height: CHART_SIZE }}>
        <Text size="md" style={{ color: '#8E8E93' }}>Нет данных</Text>
      </View>
    );
  }

  let startAngle = 0;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'relative', width: CHART_SIZE, height: CHART_SIZE }}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          {categories.map((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;

            const x1 = CENTER + RADIUS * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = CENTER + RADIUS * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = CENTER + RADIUS * Math.cos((startAngle + angle - 90) * Math.PI / 180);
            const y2 = CENTER + RADIUS * Math.sin((startAngle + angle - 90) * Math.PI / 180);

            const dashArray = `${(item.percentage / 100) * 2 * Math.PI * RADIUS} ${2 * Math.PI * RADIUS}`;
            const dashOffset = -((startAngle) / 360) * 2 * Math.PI * RADIUS;

            startAngle += angle;

            const color = item.category.color || colors[index % colors.length];

            return (
              <Circle
                key={item.category.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="transparent"
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                opacity={0.9}
              />
            );
          })}
        </Svg>

        {/* Center content */}
        <View
          style={{
            position: 'absolute',
            top: CENTER - 40,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            size="display"
            weight="bold"
            style={{
              color: type === 'EXPENSE' ? '#FF3B30' : '#34C759',
              fontSize: 36,
              lineHeight: 42,
            }}
          >
            {type === 'EXPENSE' ? '− ' : '+ '}
            {(totalAmount / 100).toLocaleString('ru-RU')}
          </Text>
          <Text size="sm" style={{ color: '#8E8E93', marginTop: 4 }}>
            ₽
          </Text>
        </View>

        {/* Category icons around chart */}
        {categories.map((item, index) => {
          const angle = (item.percentage / 200 + (categories.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0) / 100)) * 360 - 90;
          const x = CENTER + ICON_RADIUS * Math.cos(angle * Math.PI / 180);
          const y = CENTER + ICON_RADIUS * Math.sin(angle * Math.PI / 180);

          return (
            <View
              key={item.category.id}
              style={{
                position: 'absolute',
                left: x - 24,
                top: y - 24,
              }}
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => onCategoryPress?.(item.category.id)}
            >
              <CategoryIcon
                icon={item.category.icon}
                color={item.category.color || colors[index % colors.length]}
                size={24}
              />
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        {categories.slice(0, 4).map((item, index) => (
          <View key={item.category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: item.category.color || colors[index % colors.length],
              }}
            />
            <Text size="xs" style={{ color: '#8E8E93' }}>
              {item.category.name} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
