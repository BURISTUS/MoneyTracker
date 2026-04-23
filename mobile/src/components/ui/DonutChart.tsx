import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
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
  const colors = type === 'EXPENSE'
    ? ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE']
    : ['#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#FFCC00'];

  if (categories.length === 0) {
    return (
      <View className="items-center justify-center" style={{ height: CHART_SIZE }}>
        <Text className="text-base text-[#8E8E93]">Нет данных</Text>
      </View>
    );
  }

  let startAngle = 0;

  return (
    <View className="items-center justify-center">
      <View className="relative" style={{ width: CHART_SIZE, height: CHART_SIZE }}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          {categories.map((item, index) => {
            const angle = (item.percentage / 100) * 360;

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

        <View
          className="absolute left-0 right-0 items-center justify-center"
          style={{ top: CENTER - 40 }}
        >
          <Text
            bold
            className="text-[36px] leading-[42px]"
            style={{ color: type === 'EXPENSE' ? '#FF3B30' : '#34C759' }}
          >
            {type === 'EXPENSE' ? '− ' : '+ '}
            {(totalAmount / 100).toLocaleString('ru-RU')}
          </Text>
          <Text className="text-sm text-[#8E8E93] mt-1">₽</Text>
        </View>

        {categories.map((item, index) => {
          const midAngle = (item.percentage / 200 + (categories.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0) / 100)) * 360 - 90;
          const x = CENTER + ICON_RADIUS * Math.cos(midAngle * Math.PI / 180);
          const y = CENTER + ICON_RADIUS * Math.sin(midAngle * Math.PI / 180);

          return (
            <View
              key={item.category.id}
              className="absolute"
              style={{ left: x - 24, top: y - 24 }}
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

      <View className="mt-6 flex-row flex-wrap justify-center gap-3">
        {categories.slice(0, 4).map((item, index) => (
          <View key={item.category.id} className="flex-row items-center gap-1">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.category.color || colors[index % colors.length] }}
            />
            <Text className="text-xs text-[#8E8E93]">
              {item.category.name} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
