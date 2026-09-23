'use client';

import {
  CreateGameHint,
  CreateGameRow,
  CreateGameSection,
  CreateGameSegment,
} from '@components/game/create/create-game-stage';
import { Button } from '@components/ui/button';
import { Chip } from '@components/ui/chip';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { FORCED_BET_KINDS } from '@constants/games';
import type { GameDraftController } from '@hooks/use-game-draft';
import { toAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { ChipModel, PayoutMode, PotMode } from '@tokenizer/shared/types';
import { Plus, X } from 'lucide-react';
import * as React from 'react';

/** What each way of paying out actually does, in one line. */
const PAYOUT_HINTS: Record<PayoutMode, string> = {
  [PayoutMode.WinnerTakesAll]: 'The winner of the round takes the whole pot.',
  [PayoutMode.Split]:
    'The pot is shared between the players still in the hand.',
  [PayoutMode.PeerToPeer]:
    'Winnings settle directly between players, with no shared pot.',
};

/** The denominations shown as a sample of what a chip table plays with. */
const SAMPLE_CHIPS = [1, 5, 25, 100] as const;

/** The grid both the blind rows and their header sit on. */
const FORCED_BET_GRID =
  'grid grid-cols-[minmax(0,1.3fr)_5.5rem_minmax(0,1fr)_2rem] gap-2';

export interface CreateGameEconomyProps {
  controller: GameDraftController;
}

/**
 * How a free table counts, pools and pays out — and what it takes off the
 * players before a round is even played.
 *
 * Poker asks none of this: its pot, its payout and its forced bets all follow
 * from the rules of the game, and the host is only asked for the stakes. Here
 * there are no rules to follow from, so every one of them is a question.
 */
export const CreateGameEconomy: React.FC<CreateGameEconomyProps> = ({
  controller,
}) => {
  const { draft, patch, addForcedBet, updateForcedBet, removeForcedBet } =
    controller;

  return (
    <CreateGameSection title="The money">
      <CreateGameRow
        label="Counting"
        hint="A plain balance, or chips with distinct values."
      >
        <CreateGameSegment
          label="Counting"
          value={draft.chipModel}
          onValueChange={(chipModel) => patch({ chipModel })}
          options={[
            { value: ChipModel.AbstractBalance, label: 'Balance' },
            { value: ChipModel.Denominated, label: 'Chips' },
          ]}
        />
        {draft.chipModel === ChipModel.Denominated && (
          <div className="flex gap-2" aria-hidden>
            {SAMPLE_CHIPS.map((denomination) => (
              <Chip key={denomination} denomination={denomination} size="sm" />
            ))}
          </div>
        )}
      </CreateGameRow>

      <CreateGameRow label="The pot" hint="Side pots come later.">
        <CreateGameSegment
          label="The pot"
          value={draft.potMode}
          onValueChange={(potMode) => patch({ potMode })}
          options={[
            { value: PotMode.Single, label: 'One pot' },
            {
              value: PotMode.MultipleSidepots,
              label: 'Side pots',
              disabled: true,
            },
          ]}
        />
      </CreateGameRow>

      <CreateGameRow label="Who collects">
        <CreateGameSegment
          label="Who collects"
          value={draft.payoutMode}
          onValueChange={(payoutMode) => patch({ payoutMode })}
          options={[
            { value: PayoutMode.WinnerTakesAll, label: 'The winner' },
            { value: PayoutMode.Split, label: 'Split' },
            { value: PayoutMode.PeerToPeer, label: 'Player to player' },
          ]}
        />
        <CreateGameHint>{PAYOUT_HINTS[draft.payoutMode]}</CreateGameHint>
      </CreateGameRow>

      <CreateGameRow
        label="Opening bets"
        hint="Taken automatically at the start of every round."
      >
        {draft.forcedBets.length > 0 && (
          <>
            <div
              className={cn(
                FORCED_BET_GRID,
                'text-on-media-muted-foreground w-full px-2.5 text-[0.625rem] font-bold tracking-[0.08em] uppercase',
              )}
            >
              <span>Bet</span>
              <span>Amount</span>
              <span>Owed by</span>
              <span />
            </div>

            <ul className="flex w-full flex-col gap-2">
              {draft.forcedBets.map((bet) => (
                <li
                  key={bet.key}
                  className={cn(
                    FORCED_BET_GRID,
                    'border-on-media-hairline bg-on-media-scrim items-center rounded-lg border px-2.5 py-2',
                  )}
                >
                  <Select
                    value={bet.label}
                    onValueChange={(label) =>
                      updateForcedBet(bet.key, { label })
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label="Kind of opening bet"
                      variant="felt"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORCED_BET_KINDS.map((kind) => (
                        <SelectItem key={kind.label} value={kind.label}>
                          {kind.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    inputMode="numeric"
                    value={bet.amount}
                    aria-label="Amount of the opening bet"
                    aria-invalid={bet.amount < 1}
                    onChange={(event) =>
                      updateForcedBet(bet.key, {
                        amount: toAmount(event.target.value),
                      })
                    }
                    variant="felt"
                    size="sm"
                    className="tabular-nums"
                  />

                  <Select
                    value={String(bet.seatOffset)}
                    onValueChange={(seatOffset) =>
                      updateForcedBet(bet.key, {
                        seatOffset: Number(seatOffset),
                      })
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label="Seat that owes the opening bet"
                      variant="felt"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {draft.seats.map((seat, index) => (
                        <SelectItem key={seat.key} value={String(index)}>
                          Seat {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove this opening bet"
                    onClick={() => removeForcedBet(bet.key)}
                    className="text-on-media-muted-foreground hover:bg-on-media-film hover:text-destructive"
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}

        {!draft.forcedBets.length && (
          <CreateGameHint>
            No opening bets — every round starts on an empty pot.
          </CreateGameHint>
        )}

        <Button type="button" variant="line" size="lg" onClick={addForcedBet}>
          <Plus />
          Add a bet
        </Button>
      </CreateGameRow>
    </CreateGameSection>
  );
};
