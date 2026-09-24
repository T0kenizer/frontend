'use client';

import { feltTitleVariants } from '@components/game/felt/felt-stage';
import { TurnOrder } from '@components/game/table/turn-order';
import type { TableView } from '@components/game/table/use-table-view';
import { cn } from '@lib/utils';
import { GameMode } from '@tokenizer/shared/types';

/** Stable context above the changing actions, shared by both game modes. */
export const HubProgress: React.FC<{ view: TableView }> = ({ view }) => {
  if (view.phase === 'lobby' || view.phase === 'finished') return null;

  const poker = view.mode === GameMode.Poker;
  const number = poker ? view.handNumber : view.dealsPlayed;
  const interruption = !poker && view.interruptionOpen;
  const active = view.activeSeat;

  return (
    <header className="pb-1" aria-live="polite" aria-atomic="true">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h1
          className={cn(feltTitleVariants({ size: 'default' }), 'tabular-nums')}
        >
          {poker ? 'Hand' : 'Round'} {number}
        </h1>
        {poker && view.streetLabel && (
          <span className="text-on-media-muted-foreground text-xs">
            {view.streetLabel}
          </span>
        )}
      </div>

      {view.phase === 'betting' && (
        <TurnOrder
          currentLabel={
            interruption
              ? 'Open turn'
              : view.isMyTurn
                ? 'Your turn'
                : 'Current turn'
          }
          current={{
            id: interruption ? 'open-turn' : (active?.id ?? 'waiting'),
            name: interruption ? 'Anyone' : (active?.displayName ?? 'Waiting'),
            note: view.proxySeat ? 'You play this seat' : undefined,
          }}
          next={{
            id: view.nextSeat?.id ?? 'undecided',
            name: view.nextSeat?.displayName ?? 'To be decided',
            note:
              view.nextSeat && view.nextSeat.id === view.mySeat?.id
                ? 'You'
                : undefined,
          }}
        />
      )}
    </header>
  );
};
