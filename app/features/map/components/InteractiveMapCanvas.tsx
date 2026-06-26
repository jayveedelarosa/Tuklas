import React, { useEffect, useMemo } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MapStarNode, LevelNodeStatus } from '../../../common/components/LevelNode';
import {
  MAP_ASPECT,
  MAP_NODE_LAYOUTS,
  MAX_MAP_ZOOM,
  computeMinMapZoom,
  layoutForLevel,
} from '../data/mapLayout';
import { MapPathTrail } from './MapPathTrail';
import { LandmarkHighlight } from './LandmarkHighlight';

const mapImage = require('../../../../assets/map/Manila City [L].png');
const FOCUS_MS = 500;

export interface MapStarEntry {
  levelId: string;
  index: number;
  status: LevelNodeStatus;
}

interface InteractiveMapCanvasProps {
  stars: MapStarEntry[];
  completedLevelIds: string[];
  selectedLevelId: string | null;
  highlightLevelId: string | null;
  initialFocusLevelId: string | null;
  focusTargetLevelId: string | null;
  onStarPress: (levelId: string, status: LevelNodeStatus) => void;
}

function clampPan(tx: number, ty: number, scale: number, vw: number, vh: number, mapW: number, mapH: number) {
  'worklet';
  const scaledW = mapW * scale;
  const scaledH = mapH * scale;
  return {
    x: clamp(tx, vw - scaledW, 0),
    y: clamp(ty, vh - scaledH, 0),
  };
}

function focusTransform(
  levelId: string,
  mapW: number,
  mapH: number,
  vw: number,
  vh: number,
  targetScale: number
) {
  const layout = MAP_NODE_LAYOUTS.find((n) => n.levelId === levelId);
  if (!layout) return { scale: targetScale, tx: 0, ty: 0 };
  const px = layout.x * mapW;
  const py = layout.y * mapH;
  const tx = vw / 2 - px * targetScale;
  const ty = vh / 2 - py * targetScale;
  const clamped = clampPan(tx, ty, targetScale, vw, vh, mapW, mapH);
  return { scale: targetScale, tx: clamped.x, ty: clamped.y };
}

export function InteractiveMapCanvas({
  stars,
  completedLevelIds,
  selectedLevelId,
  highlightLevelId,
  initialFocusLevelId,
  focusTargetLevelId,
  onStarPress,
}: InteractiveMapCanvasProps) {
  const { width: vw, height: vh } = useWindowDimensions();

  const mapWidth = useMemo(() => vw, [vw]);
  const mapHeight = useMemo(() => vw / MAP_ASPECT, [vw]);
  const minScale = useMemo(
    () => computeMinMapZoom(vw, vh, mapWidth, mapHeight),
    [vw, vh, mapWidth, mapHeight]
  );
  const minScaleSV = useSharedValue(minScale);

  useEffect(() => {
    minScaleSV.value = minScale;
  }, [minScale, minScaleSV]);

  const scale = useSharedValue(minScale);
  const savedScale = useSharedValue(minScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTX = useSharedValue(0);
  const savedTY = useSharedValue(0);

  const applyFocus = (levelId: string, zoom = 1.5) => {
    const targetScale = clamp(zoom, minScale, MAX_MAP_ZOOM);
    const { scale: s, tx, ty } = focusTransform(levelId, mapWidth, mapHeight, vw, vh, targetScale);
    const timing = { duration: FOCUS_MS };
    scale.value = withTiming(s, timing);
    translateX.value = withTiming(tx, timing);
    translateY.value = withTiming(ty, timing);
    savedScale.value = s;
    savedTX.value = tx;
    savedTY.value = ty;
  };

  useEffect(() => {
    const start = focusTransform(
      initialFocusLevelId ?? 'level3',
      mapWidth,
      mapHeight,
      vw,
      vh,
      minScale
    );
    scale.value = start.scale;
    translateX.value = start.tx;
    translateY.value = start.ty;
    savedScale.value = start.scale;
    savedTX.value = start.tx;
    savedTY.value = start.ty;
  }, [mapWidth, mapHeight, vw, vh, minScale, initialFocusLevelId]);

  useEffect(() => {
    if (focusTargetLevelId) applyFocus(focusTargetLevelId, 1.55);
  }, [focusTargetLevelId]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, minScaleSV.value, MAX_MAP_ZOOM);
      scale.value = next;
      const clamped = clampPan(translateX.value, translateY.value, next, vw, vh, mapWidth, mapHeight);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const nextX = savedTX.value + e.translationX;
      const nextY = savedTY.value + e.translationY;
      const clamped = clampPan(nextX, nextY, scale.value, vw, vh, mapWidth, mapHeight);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedTX.value = translateX.value;
      savedTY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const highlightLayout = highlightLevelId ? layoutForLevel(highlightLevelId) : null;

  return (
    <View style={styles.viewport} testID="interactive-map-canvas">
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.mapLayer, { width: mapWidth, height: mapHeight }, animatedStyle]}>
          <Image source={mapImage} style={{ width: mapWidth, height: mapHeight }} resizeMode="stretch" />
          <MapPathTrail mapWidth={mapWidth} mapHeight={mapHeight} completedLevelIds={completedLevelIds} />
          {highlightLayout && (
            <LandmarkHighlight
              x={highlightLayout.landmarkX * mapWidth}
              y={highlightLayout.landmarkY * mapHeight}
              active={Boolean(highlightLevelId)}
            />
          )}
          {stars.map((star) => {
            const layout = layoutForLevel(star.levelId);
            if (!layout) return null;
            const left = layout.x * mapWidth;
            const top = layout.y * mapHeight;
            return (
              <View
                key={star.levelId}
                style={[
                  styles.starAnchor,
                  { left: left - 20, top: top - 20, zIndex: selectedLevelId === star.levelId ? 10 : 1 },
                ]}
              >
                <MapStarNode
                  index={star.index}
                  status={star.status}
                  onPress={() => onStarPress(star.levelId, star.status)}
                  testID={`level-node-${star.levelId}`}
                />
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden', backgroundColor: '#c9a96e' },
  mapLayer: { position: 'relative' },
  starAnchor: { position: 'absolute', alignItems: 'center' },
});
