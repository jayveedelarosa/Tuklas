import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { PomodoroSessionRecord } from '../../features/pomodoro/models/pomodoro';

interface StreakHeatmapProps {
  history: PomodoroSessionRecord[];
  days?: number;
}

type DayStatus = 'completed' | 'abandoned' | 'none';

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function StreakHeatmap({ history, days = 28 }: StreakHeatmapProps) {
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

  return (
    <View testID="streak-heatmap">
      <View style={styles.grid}>
        {cells.map((cell) => (
          <View key={cell.key} style={[styles.cell, cellStyleFor(cell.status)]} />
        ))}
      </View>
      <View style={styles.legendRow}>
        <LegendDot color={colors.success} label="Completed" />
        <LegendDot color={colors.danger} label="Abandoned" />
        <LegendDot color={colors.border} label="No session" />
      </View>
    </View>
  );
}

function cellStyleFor(status: DayStatus) {
  if (status === 'completed') return { backgroundColor: colors.success };
  if (status === 'abandoned') return { backgroundColor: colors.danger };
  return { backgroundColor: colors.border };
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const CELL_SIZE = 18;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: CELL_SIZE * 7 + 6 * 4 },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 4, margin: 2 },
  legendRow: { flexDirection: 'row', marginTop: spacing.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md, marginTop: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendLabel: { fontSize: 12, color: colors.textMuted },
});
