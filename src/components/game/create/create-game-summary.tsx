'use client';

import { Alert, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ChipsGroup } from '@components/ui/chips-group';
import { ACTION_CATALOG, BETTING_STRUCTURES } from '@constants/games';
import type { GameDraft, GameDraftController } from '@hooks/use-game-draft';
import { useGameName } from '@hooks/use-game-name';
import {
  ChipModel,
  EndResolution,
  GameMode,
  TurnRegime,
} from '@tokenizer/shared/types';
import { CircleAlert } from 'lucide-react';

const amountFormat = new Intl.NumberFormat('en-US');

export interface CreateGameSummaryProps {
  controller: GameDraftController;
  onCreate: () => void;
  isCreating: boolean;
}

export const CreateGameSummary: React.FC<CreateGameSummaryProps> = ({
  controller,
  onCreate,
  isCreating,
}) => {
  const { draft, review, totalInPlay } = controller;
  const name = useGameName(draft.name);

  const isPoker = draft.mode === GameMode.Poker;

  const meta = [
    isPoker ? 'poker' : 'free table',
    isPoker
      ? BETTING_STRUCTURES.find(
          (entry) => entry.value === draft.bettingStructure,
        )?.label.toLowerCase()
      : `${draft.enabledActions.length} moves`,
    draft.chipModel === ChipModel.AbstractBalance ? 'balance' : 'chips',
  ]
    .filter(Boolean)
    .join(' · ');

  const facts: [string, string][] = [
    ...(isPoker ? pokerFacts(draft) : freeFacts(draft)),
    ['Joining after the deal', draft.allowMidGameClaims ? 'Allowed' : 'Closed'],
    ['Extra seats', draft.allowExtraSeats ? 'Can be added' : 'Fixed'],
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
            {name}
          </p>
          <p className="text-on-media-muted-foreground mt-1 text-xs">{meta}</p>

          <ChipsGroup className="mt-3.5" size={48} staggered />

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
          variant="gold"
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

const pokerFacts = (draft: GameDraft): [string, string][] => [
  [
    'Blinds',
    `${amountFormat.format(draft.smallBlind)} / ${amountFormat.format(draft.bigBlind)}`,
  ],
  ['Ante', draft.ante ? amountFormat.format(draft.ante) : 'none'],
  ['Showdown', 'Called by the table'],
];

const freeFacts = (draft: GameDraft): [string, string][] => [
  [
    'Opening bets',
    draft.forcedBets.length
      ? draft.forcedBets
          .map((bet) => amountFormat.format(bet.amount))
          .join(' / ')
      : 'none',
  ],
  [
    'Moves',
    ACTION_CATALOG.filter((action) => draft.enabledActions.includes(action.id))
      .map((action) => action.label)
      .join(', ') || 'none',
  ],
  [
    'Order of play',
    draft.regime === TurnRegime.Sequential
      ? 'One at a time'
      : draft.regime === TurnRegime.SequentialInterruptible
        ? 'With instant raises'
        : 'All at once',
  ],
  [
    'End of a round',
    draft.resolution === EndResolution.Automatic
      ? 'When one player is left'
      : 'Called by the host',
  ],
];
