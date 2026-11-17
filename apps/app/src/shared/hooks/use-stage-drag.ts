'use client';

import { type DragEvent, useRef, useState } from 'react';

const DRAG_TYPE = 'application/x-crm-card';

interface StageDragOptions<T> {
  /** Cards can only be dragged when the reader may change their stage. */
  isEnabled: boolean;
  getId: (item: T) => number;
  getStageId: (item: T) => number | null | undefined;
  /** Called when a card lands on a different column. */
  onMove: (item: T, stageId: number) => void;
}

/**
 * Native HTML drag and drop between pipeline columns. It is a mouse shortcut on top of the card
 * menu's "Change stage", which stays the keyboard and touch path.
 */
export function useStageDrag<T>({ isEnabled, getId, getStageId, onMove }: StageDragOptions<T>) {
  const [dragged, setDragged] = useState<T | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);
  // The drop reads the card from a ref: state set on dragstart may not be rendered by drop time.
  const draggedRef = useRef<T | null>(null);

  const reset = () => {
    draggedRef.current = null;
    setDragged(null);
    setOverStageId(null);
  };

  const cardProps = (item: T) =>
    isEnabled
      ? {
          draggable: true,
          'data-dragging': dragged !== null && getId(dragged) === getId(item) ? '' : undefined,
          onDragStart: (event: DragEvent<HTMLElement>) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(DRAG_TYPE, String(getId(item)));
            draggedRef.current = item;
            setDragged(item);
          },
          onDragEnd: reset,
        }
      : {};

  const columnProps = (stageId: number) =>
    isEnabled
      ? {
          'data-drop-target': overStageId === stageId ? '' : undefined,
          onDragOver: (event: DragEvent<HTMLElement>) => {
            if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            if (overStageId !== stageId) setOverStageId(stageId);
          },
          onDragLeave: (event: DragEvent<HTMLElement>) => {
            // Moving between children of the column fires leave too; only clear on a real exit.
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            setOverStageId((current) => (current === stageId ? null : current));
          },
          onDrop: (event: DragEvent<HTMLElement>) => {
            event.preventDefault();
            const item = draggedRef.current;
            reset();
            if (item && getStageId(item) !== stageId) onMove(item, stageId);
          },
        }
      : {};

  return { cardProps, columnProps, isDragging: dragged !== null };
}
