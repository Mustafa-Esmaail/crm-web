import { describe, expect, it } from 'vitest';

import type { ChartNode } from '../types/chart';
import {
  CANVAS_PADDING,
  computeLayout,
  LEVEL_GAP,
  NODE_HEIGHT,
  NODE_WIDTH,
  SIBLING_GAP,
} from './layout';

const node = (id: string, children: ChartNode[] = []): ChartNode => ({
  id,
  title: id,
  avatarId: 1,
  count: children.length,
  children,
});

const none = new Set<string>();
const at = (layout: ReturnType<typeof computeLayout>, id: string) =>
  layout.nodes.find((item) => item.node.id === id);

describe('computeLayout', () => {
  it('puts a lone node at the padded corner', () => {
    const layout = computeLayout([node('a')], { collapsedIds: none, isRtl: false });

    expect(at(layout, 'a')).toMatchObject({ x: CANVAS_PADDING, y: CANVAS_PADDING });
    expect(layout.width).toBe(CANVAS_PADDING * 2 + NODE_WIDTH);
    expect(layout.edges).toEqual([]);
  });

  it('centres a parent over its two children and drops each level down', () => {
    const layout = computeLayout([node('p', [node('l'), node('r')])], {
      collapsedIds: none,
      isRtl: false,
    });
    const parent = at(layout, 'p');
    const left = at(layout, 'l');
    const right = at(layout, 'r');

    expect((left?.x ?? 0) + NODE_WIDTH + SIBLING_GAP).toBe(right?.x);
    expect((parent?.x ?? 0) + NODE_WIDTH / 2).toBe(
      ((left?.x ?? 0) + (right?.x ?? 0) + NODE_WIDTH) / 2,
    );
    expect(left?.y).toBe(CANVAS_PADDING + NODE_HEIGHT + LEVEL_GAP);
  });

  it('draws one edge per parent-child link, from the parent bottom to the child top', () => {
    const layout = computeLayout([node('p', [node('c')])], { collapsedIds: none, isRtl: false });
    const child = at(layout, 'c');

    expect(layout.edges).toHaveLength(1);
    expect(layout.edges[0]?.path).toMatch(new RegExp(`V ${child?.y}$`));
  });

  it('hides the subtree of a collapsed node and shrinks the canvas', () => {
    const tree = [node('p', [node('a', [node('a1')]), node('b')])];
    const open = computeLayout(tree, { collapsedIds: none, isRtl: false });
    const folded = computeLayout(tree, { collapsedIds: new Set(['a']), isRtl: false });

    expect(at(folded, 'a1')).toBeUndefined();
    expect(at(folded, 'a')).toBeDefined();
    expect(folded.height).toBeLessThan(open.height);
  });

  it('mirrors left and right for Arabic while keeping the parent centred', () => {
    const tree = [node('p', [node('first'), node('second')])];
    const ltr = computeLayout(tree, { collapsedIds: none, isRtl: false });
    const rtl = computeLayout(tree, { collapsedIds: none, isRtl: true });

    expect((at(ltr, 'first')?.x ?? 0) < (at(ltr, 'second')?.x ?? 0)).toBe(true);
    expect((at(rtl, 'first')?.x ?? 0) > (at(rtl, 'second')?.x ?? 0)).toBe(true);
    expect(at(rtl, 'p')?.x).toBe(at(ltr, 'p')?.x);
  });

  it('lays several roots out side by side', () => {
    const layout = computeLayout([node('a'), node('b')], { collapsedIds: none, isRtl: false });

    expect((at(layout, 'a')?.x ?? 0) + NODE_WIDTH + SIBLING_GAP).toBe(at(layout, 'b')?.x);
  });

  it('copes with nothing to draw', () => {
    const layout = computeLayout([], { collapsedIds: none, isRtl: false });

    expect(layout.nodes).toEqual([]);
    expect(layout.height).toBe(CANVAS_PADDING * 2);
  });
});
