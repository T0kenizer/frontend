'use client';

import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Chip } from '@components/ui/chip';
import { ACTION_CATALOG, FORCED_BET_KINDS } from '@constants/games';
import type { GameDraftController } from '@hooks/use-game-draft';
import {
  ChipModel,
  Direction,
  EndResolution,
  PotMode,
} from '@tokenizer/shared/types';
import { CircleAlert } from 'lucide-react';
import * as React from 'react';

const amountFormat = new Intl.NumberFormat('en-US');

/** The chips stacked under the name — decoration, hence hidden from readers. */
const STACK_PREVIEW = [25, 100, 5, 500] as const;

export interface CreateGameSummaryProps {
  controller: GameDraftController;
  onCreate: () => void;
  isCreating: boolean;
}

/**
 * The table as it would open right now.
 *
 * It reads from the same draft the form writes to rather than from a separate
 * preview state, so there is no version of the table the host can see but not
 * create — and the one thing standing between the two, the blocker, is shown
 * right above the button it disables.
 */
export const CreateGameSummary: React.FC<CreateGameSummaryProps> = ({
  controller,
  onCreate,
  isCreating,
}) => {
  const { draft, review, totalInPlay } = controller;

  const enabledActions = ACTION_CATALOG.filter((action) =>
    draft.enabledActions.includes(action.id),
  );

  const meta = [
    draft.potMode === PotMode.Single ? 'one pot' : 'side pots',
    draft.chipModel === ChipModel.AbstractBalance ? 'balance' : 'chips',
    draft.direction === Direction.Clockwise ? 'clockwise' : 'counter-clockwise',
  ].join(' · ');

  const facts: [string, string][] = [
    [
      'Opening bets',
      draft.forcedBets.length
        ? draft.forcedBets
            .map(
              (bet) =>
                `${FORCED_BET_KINDS.find((kind) => kind.label === bet.label)?.name ?? bet.label} ${amountFormat.format(bet.amount)}`,
            )
            .join(' · ')
        : 'none',
    ],
    [
      'Actions',
      enabledActions.length
        ? enabledActions.map((action) => action.label.toLowerCase()).join(', ')
        : 'none',
    ],
    ['Joining after the deal', draft.allowMidGameClaims ? 'Allowed' : 'Closed'],
    [
      'End of a round',
      draft.resolution === EndResolution.Automatic
        ? 'Automatic'
        : 'Decided by the host',
    ],
  ];

  const warning = review.blocker ?? review.advice;

  return (
    <aside className="flex flex-col gap-3.5 lg:sticky lg:top-5">
      <Card variant="felt" className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-on-media-muted-foreground text-[0.625rem] font-bold tracking-[0.11em] uppercase">
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-xl leading-tight font-extrabold tracking-[-0.03em]">
            {draft.name.trim() || 'Unnamed game'}
          </p>
          <p className="text-on-media-muted-foreground mt-1 text-xs">{meta}</p>

          <div className="mt-3.5 flex items-end" aria-hidden>
            {STACK_PREVIEW.map((denomination, index) => (
              <Chip
                key={denomination}
                denomination={denomination}
                className={index > 0 ? '-ml-3' : undefined}
              />
            ))}
          </div>

          <dl className="border-on-media-hairline mt-3.5 flex border-t pt-3.5">
            {(
              [
                ['Seats', amountFormat.format(draft.seats.length)],
                [
                  'Stack',
                  draft.perSeatStacks
                    ? 'varies'
                    : amountFormat.format(draft.defaultInitialBalance),
                ],
                ['In play', amountFormat.format(totalInPlay)],
              ] as [string, string][]
            ).map(([term, value], index) => (
              <div
                key={term}
                className={
                  index > 0
                    ? 'border-on-media-hairline min-w-0 flex-1 border-l pl-3'
                    : 'min-w-0 flex-1'
                }
              >
                <dt className="text-on-media-muted-foreground text-[0.6rem] font-bold tracking-[0.09em] uppercase">
                  {term}
                </dt>
                <dd className="mt-0.5 truncate text-base font-extrabold tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card variant="felt" className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-on-media-muted-foreground text-[0.625rem] font-bold tracking-[0.11em] uppercase">
            What is set
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-2.5 text-xs">
            {facts.map(([term, value]) => (
              <div key={term} className="flex justify-between gap-3">
                <dt className="text-on-media-muted-foreground">{term}</dt>
                <dd className="text-right font-semibold first-letter:uppercase">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {warning && (
        <Alert variant="felt" className="rounded-xl px-3 py-2.5 text-xs">
          <CircleAlert />
          <AlertDescription className="text-xs leading-relaxed">
            {warning}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2.5">
        <Button
          type="button"
          variant="felt-inverse"
          size="lg"
          className="h-11 w-full"
          loading={isCreating}
          disabled={!!review.blocker}
          onClick={onCreate}
        >
          {isCreating ? 'Opening the table…' : 'Create the game'}
        </Button>
        <p className="text-on-media-muted-foreground text-center text-xs leading-relaxed">
          The table opens in a waiting room; players join with the code.
        </p>
      </div>
    </aside>
  );
};
