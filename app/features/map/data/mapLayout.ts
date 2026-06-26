/** Reference dimensions for normalized star coordinates on the Manila map artwork. */
export const MAP_ASPECT = 16 / 9;
export const MAX_MAP_ZOOM = 2.5;

export interface MapNodeLayout {
  levelId: string;
  cityLabel: string;
  /** Normalized 0–1 position on the map image (star sits on the landmark). */
  x: number;
  y: number;
  /** Landmark highlight center — on the building illustration. */
  landmarkX: number;
  landmarkY: number;
}

/** Nine stars on Manila landmarks — positions match annotated reference map. */
export const MAP_NODE_LAYOUTS: MapNodeLayout[] = [
  { levelId: 'level1', cityLabel: 'Intramuros', x: 0.17, y: 0.24, landmarkX: 0.19, landmarkY: 0.2 },
  { levelId: 'level2', cityLabel: 'Sampaloc', x: 0.38, y: 0.2, landmarkX: 0.4, landmarkY: 0.16 },
  { levelId: 'level3', cityLabel: 'Quiapo', x: 0.55, y: 0.22, landmarkX: 0.57, landmarkY: 0.18 },
  { levelId: 'level4', cityLabel: 'National Museum', x: 0.45, y: 0.38, landmarkX: 0.47, landmarkY: 0.34 },
  { levelId: 'level5', cityLabel: 'Rizal Park', x: 0.22, y: 0.52, landmarkX: 0.24, landmarkY: 0.48 },
  { levelId: 'level6', cityLabel: 'Manila City Hall', x: 0.32, y: 0.62, landmarkX: 0.34, landmarkY: 0.58 },
  { levelId: 'level7', cityLabel: 'PGH', x: 0.58, y: 0.58, landmarkX: 0.6, landmarkY: 0.54 },
  { levelId: 'level8', cityLabel: 'Binondo', x: 0.26, y: 0.42, landmarkX: 0.28, landmarkY: 0.38 },
  { levelId: 'level9', cityLabel: 'Divisoria', x: 0.18, y: 0.4, landmarkX: 0.2, landmarkY: 0.36 },
];

export function layoutForLevel(levelId: string): MapNodeLayout | undefined {
  return MAP_NODE_LAYOUTS.find((n) => n.levelId === levelId);
}

export function computeMinMapZoom(viewportW: number, viewportH: number, mapW: number, mapH: number): number {
  return Math.max(viewportW / mapW, viewportH / mapH);
}
