import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Text } from '../../../components/ui/text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;
const BAR_AREA_HEIGHT = CHART_HEIGHT - 24;
const BAR_GAP = 2;

interface DayData {
  day: number;
  expense: number;
  income: number;
}

interface SpendingChartProps {
  data: DayData[];
  monthLabel: string;
}

export function SpendingChart({ data, monthLabel }: SpendingChartProps) {
  const { maxVal, bars } = useMemo(() => {
    const maxExpense = Math.max(...data.map((d) => d.expense), 0);
    const maxIncome = Math.max(...data.map((d) => d.income), 0);
    const maxVal = Math.max(maxExpense, maxIncome, 1);

    const barWidth = Math.max((CHART_WIDTH - data.length * BAR_GAP) / data.length, 3);

    const bars = data.map((d) => {
      const expenseH = maxVal > 0 ? (d.expense / maxVal) * BAR_AREA_HEIGHT : 0;
      const incomeH = maxVal > 0 ? (d.income / maxVal) * BAR_AREA_HEIGHT : 0;

      return {
        expenseH,
        incomeH,
      };
    });

    return { maxVal, bars };
  }, [data]);

  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const totalIncome = data.reduce((s, d) => s + d.income, 0);

  const formatK = (v: number) => {
    const rubles = v / 100;
    if (rubles >= 1000000) return `${(rubles / 1000000).toFixed(1)}М`;
    if (rubles >= 1000) return `${Math.round(rubles / 1000)}к`;
    return `${Math.round(rubles)}`;
  };

  return (
    <View className="gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-medium text-typography-400">{monthLabel}</Text>
        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-sm bg-success-500" />
            <Text className="text-xs text-typography-400">{formatK(totalIncome)}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-sm bg-error-500" />
            <Text className="text-xs text-typography-400">{formatK(totalExpense)}</Text>
          </View>
        </View>
      </View>

      <View className="bg-[rgba(255,255,255,0.02)] rounded-2xl p-3">
        <Svg width={CHART_WIDTH - 24} height={CHART_HEIGHT}>
          {bars.map((bar, i) => {
            const svgWidth = CHART_WIDTH - 24;
            const bw = Math.max((svgWidth - data.length * BAR_GAP) / data.length, 3);
            const bx = i * (bw + BAR_GAP);

            const expH = maxVal > 0 ? (data[i].expense / maxVal) * BAR_AREA_HEIGHT : 0;
            const incH = maxVal > 0 ? (data[i].income / maxVal) * BAR_AREA_HEIGHT : 0;
            const expY = BAR_AREA_HEIGHT - expH;
            const incY = BAR_AREA_HEIGHT - incH;

            return (
              <React.Fragment key={data[i].day}>
                {incH > 1 && (
                  <Rect
                    x={bx}
                    y={incY}
                    width={bw * 0.6}
                    height={incH}
                    fill="#34C759"
                    opacity={0.5}
                    rx={1}
                  />
                )}
                {expH > 1 && (
                  <Rect
                    x={bx + bw * 0.4}
                    y={expY}
                    width={bw * 0.6}
                    height={expH}
                    fill="#FF3B30"
                    opacity={0.7}
                    rx={1}
                  />
                )}
              </React.Fragment>
            );
          })}

          <Line
            x1={0}
            y1={BAR_AREA_HEIGHT}
            x2={CHART_WIDTH - 24}
            y2={BAR_AREA_HEIGHT}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {data.length <= 31 && data.length > 0 && (() => {
            const svgWidth = CHART_WIDTH - 24;
            const bw = Math.max((svgWidth - data.length * BAR_GAP) / data.length, 3);
            const labels = [1, 5, 10, 15, 20, 25, data[data.length - 1].day];
            return labels.map((day) => {
              const idx = data.findIndex((d) => d.day === day);
              if (idx < 0) return null;
              const x = idx * (bw + BAR_GAP) + bw / 2;
              return (
                <SvgText
                  key={day}
                  x={x}
                  y={CHART_HEIGHT - 2}
                  fill="#8E8E93"
                  fontSize={8}
                  textAnchor="middle"
                >
                  {day}
                </SvgText>
              );
            });
          })()}
        </Svg>
      </View>
    </View>
  );
}
