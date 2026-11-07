/** One box on the canvas, whatever it represents (a person in the manager view, a department otherwise). */
export interface ChartNode {
  id: string;
  title: string;
  subtitle?: string | null;
  /** Drives the avatar colour, so the same person keeps their colour across the app. */
  avatarId: number;
  /** The number shown in the chip: people below this node, or people in this department. */
  count: number;
  /** Where clicking the title goes; omitted when the box has no page of its own. */
  href?: string;
  children: ChartNode[];
}

export interface PositionedNode {
  node: ChartNode;
  x: number;
  y: number;
}

export interface ChartEdge {
  fromId: string;
  toId: string;
  /** SVG path: down from the parent, across, then down into the child. */
  path: string;
}

export interface ChartLayout {
  nodes: PositionedNode[];
  edges: ChartEdge[];
  width: number;
  height: number;
}

export const CHART_MODES = ['manager', 'department'] as const;
export type ChartMode = (typeof CHART_MODES)[number];
