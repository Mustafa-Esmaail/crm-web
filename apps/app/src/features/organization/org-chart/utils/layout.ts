import type { ChartEdge, ChartLayout, ChartNode, PositionedNode } from '../types/chart';

// Layout maths for absolutely-positioned boxes; these are geometry, not styling.
export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 92;
export const SIBLING_GAP = 24;
export const LEVEL_GAP = 56;
export const CANVAS_PADDING = 32;

interface LayoutOptions {
  /** Boxes whose children are hidden. */
  collapsedIds: ReadonlySet<string>;
  /** Mirror horizontally so the first child sits on the right, as reading order does in Arabic. */
  isRtl: boolean;
}

function visibleChildren(node: ChartNode, collapsedIds: ReadonlySet<string>): ChartNode[] {
  return collapsedIds.has(node.id) ? [] : node.children;
}

/**
 * Classic top-down tree: each node is centred over its children, and a subtree is as wide as
 * its children side by side (or one box, for a leaf). Several roots sit next to each other.
 */
export function computeLayout(
  roots: ChartNode[],
  { collapsedIds, isRtl }: LayoutOptions,
): ChartLayout {
  const widths = new Map<string, number>();

  const subtreeWidth = (node: ChartNode): number => {
    const cached = widths.get(node.id);
    if (cached !== undefined) return cached;

    const children = visibleChildren(node, collapsedIds);
    const childrenWidth = children.reduce(
      (sum, child, index) => sum + subtreeWidth(child) + (index > 0 ? SIBLING_GAP : 0),
      0,
    );
    const width = Math.max(NODE_WIDTH, childrenWidth);
    widths.set(node.id, width);
    return width;
  };

  const positioned: PositionedNode[] = [];
  const links: Array<{ fromId: string; toId: string }> = [];
  let maxDepth = 0;

  const place = (node: ChartNode, left: number, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    const width = subtreeWidth(node);
    positioned.push({
      node,
      x: left + (width - NODE_WIDTH) / 2,
      y: CANVAS_PADDING + depth * (NODE_HEIGHT + LEVEL_GAP),
    });

    const children = visibleChildren(node, collapsedIds);
    const childrenWidth = children.reduce(
      (sum, child, index) => sum + subtreeWidth(child) + (index > 0 ? SIBLING_GAP : 0),
      0,
    );
    let cursor = left + (width - childrenWidth) / 2;
    for (const child of children) {
      links.push({ fromId: node.id, toId: child.id });
      place(child, cursor, depth + 1);
      cursor += subtreeWidth(child) + SIBLING_GAP;
    }
  };

  let rootLeft = CANVAS_PADDING;
  roots.forEach((root, index) => {
    if (index > 0) rootLeft += SIBLING_GAP;
    place(root, rootLeft, 0);
    rootLeft += subtreeWidth(root);
  });

  const width = rootLeft + CANVAS_PADDING;
  const height =
    roots.length === 0
      ? CANVAS_PADDING * 2
      : CANVAS_PADDING * 2 + (maxDepth + 1) * NODE_HEIGHT + maxDepth * LEVEL_GAP;

  const mirror = (x: number) => (isRtl ? width - x - NODE_WIDTH : x);
  const nodes = positioned.map((item) => ({ ...item, x: mirror(item.x) }));
  const byId = new Map(nodes.map((item) => [item.node.id, item]));

  const edges: ChartEdge[] = links.flatMap(({ fromId, toId }) => {
    const from = byId.get(fromId);
    const to = byId.get(toId);
    if (!from || !to) return [];

    const fromX = from.x + NODE_WIDTH / 2;
    const toX = to.x + NODE_WIDTH / 2;
    const fromY = from.y + NODE_HEIGHT;
    const midY = fromY + LEVEL_GAP / 2;
    return [{ fromId, toId, path: `M ${fromX} ${fromY} V ${midY} H ${toX} V ${to.y}` }];
  });

  return { nodes, edges, width, height };
}
