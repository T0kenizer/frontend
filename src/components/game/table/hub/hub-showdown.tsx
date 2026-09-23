'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { WaitingDial } from '@components/game/table/hub/hub-lobby';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import type { PotAward } from '@tokenizer/shared/types';
import * as React from 'react';

/**
 * The betting is finished. Who won?
 *
 * This is the one question the app cannot answer for itself: the cards are on
 * the physical table and it never sees them. So it asks — and it asks pot by
 * pot, because a side pot is a different contest with a different field. The
 * short stack who took the main pot was never in for the one above it, and a
 * single list of winners has no way of saying who was.
 *
 * Nearly every hand has exactly one pot, and then this is one question.
 */

export interface HubShowdownProps {
  view: PokerTableView;
  actions: TableActions;
}

export const HubShowdown: React.FC<HubShowdownProps> = ({ view, actions }) => {
  const { pots, pot, contenders, isHost } = view;

  const [picked, setPicked] = React.useState<Record<string, string[]>>({});

  const toggle = (potId: string, participantId: string) =>
    setPicked((current) => {
      const chosen = current[potId] ?? [];
      return {
        ...current,
        [potId]: chosen.includes(participantId)
          ? chosen.filter((id) => id !== participantId)
          : [...chosen, participantId],
      };
    });

  const awards: PotAward[] = pots.map((entry) => ({
    potId: entry.id,
    winnerParticipantIds: picked[entry.id] ?? [],
  }));
  const isComplete = awards.every(
    (award) => award.winnerParticipantIds.length > 0,
  );

  if (!isHost) {
    return (
      <HubShell
        eyebrow="Showdown"
        title="Cards on the table"
        description="The host is settling the pot on what everyone showed."
        facts={[
          { label: 'Pot', value: formatAmount(pot) },
          { label: 'In', value: `${contenders.length}` },
        ]}
      >
        <WaitingDial label="Waiting on the showdown" />
      </HubShell>
    );
  }

  return (
    <HubShell
      eyebrow="Showdown"
      title="Who takes it?"
      description="Tap the best hand. Tap two for a split."
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        { label: 'In', value: `${contenders.length}` },
      ]}
      footnote="The app holds the chips, not the cards — this is the one call it needs from the table."
    >
      {actions.error && (
        <FeltNotice tone="error" className="mb-3 text-left">
          {actions.error}
        </FeltNotice>
      )}

      <div className="max-h-58 space-y-3 overflow-y-auto text-left">
        {pots.map((entry, index) => {
          const eligible = contenders.filter((seat) =>
            entry.eligibleParticipants.includes(seat.id),
          );
          const chosen = picked[entry.id] ?? [];

          return (
            <section key={entry.id}>
              <header className="flex items-baseline justify-between gap-2">
                <span className="text-on-media-muted-foreground text-[0.625rem] font-bold tracking-[0.09em] uppercase">
                  {entry.isSidePot ? `Side pot ${index}` : 'Main pot'}
                </span>
                <span className="text-warning text-xs font-extrabold tabular-nums">
                  {formatAmount(entry.amount)}
                </span>
              </header>

              <ul className="mt-1.5 grid gap-1.5">
                {eligible.map((seat) => {
                  const isChosen = chosen.includes(seat.id);

                  return (
                    <li key={seat.id}>
                      <button
                        type="button"
                        aria-pressed={isChosen}
                        onClick={() => toggle(entry.id, seat.id)}
                        className={cn(
                          'border-on-media-hairline bg-on-media-scrim flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                          isChosen
                            ? 'border-warning bg-warning-soft'
                            : 'hover:bg-on-media-film',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-semibold">
                          {seat.displayName}
                        </span>
                        <span className="text-on-media-muted-foreground shrink-0 tabular-nums">
                          {formatAmount(seat.balance)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <HubStack className="mt-4">
        <Button
          variant="felt-inverse"
          size="xl"
          className="w-full"
          disabled={!isComplete}
          loading={actions.pending === 'showdown'}
          onClick={() => actions.declareWinners(awards)}
        >
          {isComplete ? 'Award the pot' : 'Pick a winner for every pot'}
        </Button>
      </HubStack>
    </HubShell>
  );
};
