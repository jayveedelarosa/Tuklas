import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../../../common/theme/colors';
import { MAP_NODE_LAYOUTS } from '../data/mapLayout';

interface MapPathTrailProps {
  mapWidth: number;
  mapHeight: number;
  completedLevelIds: string[];
}

function segmentRevealed(fromLevelIndex: number, completedLevelIds: string[]): boolean {
  const fromId = `level${fromLevelIndex + 1}`;
  return completedLevelIds.includes(fromId);
}

/** Dashed trail connecting stars; each segment lights up when the prior level is beaten. */
export function MapPathTrail({ mapWidth, mapHeight, completedLevelIds }: MapPathTrailProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={mapWidth} height={mapHeight}>
        {MAP_NODE_LAYOUTS.slice(0, -1).map((from, i) => {
          const to = MAP_NODE_LAYOUTS[i + 1];
          const revealed = segmentRevealed(i, completedLevelIds);
          const x1 = from.x * mapWidth;
          const y1 = from.y * mapHeight;
          const x2 = to.x * mapWidth;
          const y2 = to.y * mapHeight;
          return (
            <Line
              key={`${from.levelId}-${to.levelId}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={revealed ? colors.primary : 'rgba(201,191,175,0.35)'}
              strokeWidth={revealed ? 5 : 3}
              strokeDasharray={revealed ? '10 6' : '6 8'}
              strokeLinecap="round"
              opacity={revealed ? 1 : 0.5}
            />
          );
        })}
      </Svg>
    </View>
  );
}
