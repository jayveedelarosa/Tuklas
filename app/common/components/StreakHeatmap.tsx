import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';
import { PomodoroSessionRecord } from '../../features/pomodoro/models/pomodoro';

interface StreakHeatmapProps {
  history: PomodoroSessionRecord[];
  days?: number;
  columns?: number;
  legendPlacement?: 'below' | 'right';
  cellSize?: number;
}

type DayStatus = 'completed' | 'abandoned' | 'none';

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function StreakHeatmap({
  history,
  days = 28,
  columns = 7,
  legendPlacement = 'below',
  cellSize = 28,
}: StreakHeatmapProps) {
  const cells = useMemo(() => {
    const byDate = new Map<string, DayStatus>();
    for (const record of history) {
      byDate.set(record.date, record.completed ? 'completed' : 'abandoned');
    }
    const today = new Date();
    const result: { key: string; status: DayStatus }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      result.push({ key, status: byDate.get(key) ?? 'none' });
    }
    return result;
  }, [history, days]);

  const cellMargin = Math.round(cellSize * 0.11);
  const gridWidth = columns * cellSize + cellMargin * 2 * columns;
  const legendFontSize = Math.round(cellSize * 0.48);
  const legendDotSize = Math.round(cellSize * 0.48);

  const legend = (
    <View style={legendPlacement === 'right' ? styles.legendColumn : styles.legendRow}>
      <LegendDot color={colors.success} label="Completed" dotSize={legendDotSize} fontSize={legendFontSize} />
      <LegendDot color={colors.danger} label="Abandoned" dotSize={legendDotSize} fontSize={legendFontSize} />
      <LegendDot color={colors.border} label="No session" dotSize={legendDotSize} fontSize={legendFontSize} />
    </View>
  );

  const grid = (
    <View style={[styles.grid, { width: gridWidth }]}>
      {cells.map((cell) => (
        <View
          key={cell.key}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              borderRadius: Math.round(cellSize * 0.2),
              margin: cellMargin,
            },
            cellStyleFor(cell.status),
          ]}
        />
      ))}
    </View>
  );

  return (
    <View testID="streak-heatmap">
      {legendPlacement === 'right' ? (
        <View style={styles.gridWithLegend}>
          {grid}
          {legend}
        </View>
      ) : (
        <>
          {grid}
          {legend}
        </>
      )}
    </View>
  );
}

function cellStyleFor(status: DayStatus) {
  if (status === 'completed') return { backgroundColor: colors.success };
  if (status === 'abandoned') return { backgroundColor: colors.danger };
  return { backgroundColor: colors.border };
}

function LegendDot({
  color,
  label,
  dotSize,
  fontSize,
}: {
  color: string;
  label: string;
  dotSize: number;
  fontSize: number;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { fontSize, lineHeight: fontSize * lineHeights.normal }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWithLegend: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {},
  legendRow: { flexDirection: 'row', marginTop: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  legendColumn: { marginLeft: spacing.md, justifyContent: 'center', paddingVertical: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  legendDot: { marginRight: 6 },
  legendLabel: {
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});
