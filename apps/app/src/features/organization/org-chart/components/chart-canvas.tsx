'use client';

import { Button, Input } from '@crm/ui';
import { Maximize2, Minus, Plus, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ChartNode } from '../types/chart';
import { findMatches } from '../utils/adapters';
import { computeLayout } from '../utils/layout';
import { ChartNodeCard } from './chart-node-card';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.4;
const ZOOM_STEP = 0.1;

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

interface ChartCanvasProps {
  roots: ChartNode[];
}

export function ChartCanvas({ roots }: ChartCanvasProps) {
  const t = useTranslations('orgChart');
  const isRtl = useLocale() === 'ar';
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(new Set());

  const layout = useMemo(
    () => computeLayout(roots, { collapsedIds, isRtl }),
    [roots, collapsedIds, isRtl],
  );
  const matches = useMemo(() => new Set(findMatches(roots, search)), [roots, search]);

  const toggle = useCallback((id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  // Scale the whole chart into view when it fits, then centre it (the root sits mid-width).
  const fit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Shrink a wide chart to fit, but never blow a small one up past its natural size.
    const next = clampZoom(Math.min(1, viewport.clientWidth / layout.width));
    setZoom(next);
    requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (layout.width * next - viewport.clientWidth) / 2);
    });
  }, [layout.width]);

  // Once per mount; the page remounts this canvas when the mode changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fit only
  useEffect(() => fit(), []);

  return (
    <div className="bg-card shadow-card relative overflow-hidden rounded-xl border">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto relative w-64 max-w-[55%]">
          <Search
            className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            className="bg-card ps-9"
          />
        </div>
        <div className="bg-card pointer-events-auto flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('zoomOut')}
            onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
          >
            <Minus className="size-4" aria-hidden />
          </Button>
          <span className="num text-caption text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('zoomIn')}
            onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('fit')} onClick={fit}>
            <Maximize2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="scrollbar-subtle chart-grid h-[640px] overflow-auto pt-16"
        dir="ltr"
      >
        <div style={{ width: layout.width * zoom, height: layout.height * zoom }}>
          <div
            className="relative origin-top-left"
            style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}
          >
            <svg
              className="text-border-strong pointer-events-none absolute inset-0"
              width={layout.width}
              height={layout.height}
              aria-hidden
            >
              {layout.edges.map((edge) => (
                <path
                  key={`${edge.fromId}-${edge.toId}`}
                  d={edge.path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </svg>
            {layout.nodes.map(({ node, x, y }) => (
              <ChartNodeCard
                key={node.id}
                node={node}
                x={x}
                y={y}
                selected={selectedId === node.id}
                matched={matches.has(node.id)}
                collapsed={collapsedIds.has(node.id)}
                onSelect={setSelectedId}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
