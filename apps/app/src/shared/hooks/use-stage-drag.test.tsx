import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useStageDrag } from './use-stage-drag';

interface Card {
  id: number;
  stageId: number;
}

const CARDS: Card[] = [
  { id: 1, stageId: 10 },
  { id: 2, stageId: 20 },
];

function Board({
  isEnabled,
  onMove,
}: {
  isEnabled: boolean;
  onMove: (card: Card, to: number) => void;
}) {
  const drag = useStageDrag<Card>({
    isEnabled,
    getId: (card) => card.id,
    getStageId: (card) => card.stageId,
    onMove,
  });

  return (
    <>
      {[10, 20].map((stageId) => (
        <section key={stageId} aria-label={`stage ${stageId}`} {...drag.columnProps(stageId)}>
          {CARDS.filter((card) => card.stageId === stageId).map((card) => (
            <div key={card.id} data-testid={`card ${card.id}`} {...drag.cardProps(card)} />
          ))}
        </section>
      ))}
    </>
  );
}

function dataTransfer() {
  const store = new Map<string, string>();
  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    get types() {
      return [...store.keys()];
    },
    setData: (type: string, value: string) => store.set(type, value),
    getData: (type: string) => store.get(type) ?? '',
  };
}

function dragTo(cardId: number, stageId: number) {
  const transfer = dataTransfer();
  const column = screen.getByRole('region', { name: `stage ${stageId}` });
  fireEvent.dragStart(screen.getByTestId(`card ${cardId}`), { dataTransfer: transfer });
  fireEvent.dragOver(column, { dataTransfer: transfer });
  fireEvent.drop(column, { dataTransfer: transfer });
}

describe('useStageDrag', () => {
  it('reports a card dropped on another column', () => {
    const onMove = vi.fn();
    render(<Board isEnabled onMove={onMove} />);

    dragTo(1, 20);

    expect(onMove).toHaveBeenCalledWith(CARDS[0], 20);
  });

  it('ignores a drop back on the same column', () => {
    const onMove = vi.fn();
    render(<Board isEnabled onMove={onMove} />);

    dragTo(1, 10);

    expect(onMove).not.toHaveBeenCalled();
  });

  it('does not make cards draggable without permission', () => {
    render(<Board isEnabled={false} onMove={vi.fn()} />);

    expect(screen.getByTestId('card 1')).not.toHaveAttribute('draggable');
  });
});
