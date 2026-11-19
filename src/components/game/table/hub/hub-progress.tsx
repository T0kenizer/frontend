'use client';

import { StreetBadge } from '@components/badges/street';
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

  // Only the stage the hand is in now — no track of the ones around it.
  const stage = !poker
    ? null
    : view.phase === 'showdown'
      ? 'showdown'
      : view.phase === 'betting'
        ? view.street
        : null;

  return (
    <header className="pb-4 text-left" aria-live="polite" aria-atomic="true">
      <div className="flex items-center justify-between gap-3">
        <h1
          className={cn(feltTitleVariants({ size: 'default' }), 'tabular-nums')}
        >
          {poker ? 'Hand' : 'Round'} {number}
        </h1>
        {stage && <StreetBadge stage={stage} />}
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
