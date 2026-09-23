'use client';

import {
  CreateGameHint,
  CreateGameRow,
  CreateGameSection,
  CreateGameSegment,
} from '@components/game/create/create-game-stage';
import { ChipsGroup } from '@components/ui/chips-group';
import { Input } from '@components/ui/input';
import { BETTING_STRUCTURES } from '@constants/games';
import type { GameDraftController } from '@hooks/use-game-draft';
import { toAmount } from '@lib/amount';
import { BettingStructure, ChipModel } from '@tokenizer/shared/types';

export interface CreateGameStakesProps {
  controller: GameDraftController;
}

/**
 * What the table plays for.
 *
 * Four numbers and a look, and that is the whole of poker's economy: the blinds
 * that start every hand, the ante if there is one, what caps a bet, and whether
 * a stack is drawn as a figure or as chips. There is nothing here about who
 * pays the blinds or how the pot is shared out, because poker already answers
 * both — the button says who pays, and the pot goes to the hand that wins it.
 */
export const CreateGameStakes: React.FC<CreateGameStakesProps> = ({
  controller,
}) => {
  const { draft, patch } = controller;

  const structure = BETTING_STRUCTURES.find(
    (entry) => entry.value === draft.bettingStructure,
  );

  return (
    <CreateGameSection
      title="The stakes"
      meta={`${draft.smallBlind} / ${draft.bigBlind}`}
    >
      <CreateGameRow
        label="Blinds"
        hint="Posted every hand by the two seats left of the button."
      >
        <div className="flex w-full items-center gap-2">
          <Input
            id="small-blind"
            inputMode="numeric"
            aria-label="Small blind"
            aria-invalid={draft.smallBlind < 1}
            value={draft.smallBlind}
            onChange={(event) =>
              patch({ smallBlind: toAmount(event.target.value) })
            }
            variant="felt"
            size="lg"
            className="w-24 tabular-nums"
          />
          <span className="text-on-media-muted-foreground text-sm" aria-hidden>
            /
          </span>
          <Input
            id="big-blind"
            inputMode="numeric"
            aria-label="Big blind"
            aria-invalid={draft.bigBlind < draft.smallBlind}
            value={draft.bigBlind}
            onChange={(event) =>
              patch({ bigBlind: toAmount(event.target.value) })
            }
            variant="felt"
            size="lg"
            className="w-24 tabular-nums"
          />
        </div>
        <CreateGameHint>
          The button moves one seat every hand, so everybody pays both in turn.
        </CreateGameHint>
      </CreateGameRow>

      <CreateGameRow
        label="Ante"
        hint="Taken off every seat before the blinds. Zero for none."
        htmlFor="ante"
      >
        <Input
          id="ante"
          inputMode="numeric"
          value={draft.ante}
          onChange={(event) => patch({ ante: toAmount(event.target.value) })}
          variant="felt"
          size="lg"
          className="w-24 tabular-nums"
        />
        {draft.ante > 0 && (
          <CreateGameHint>
            {draft.ante * draft.seats.length} in the middle before a card is
            dealt.
          </CreateGameHint>
        )}
      </CreateGameRow>

      <CreateGameRow label="Betting">
        <CreateGameSegment
          label="Betting"
          value={draft.bettingStructure}
          onValueChange={(bettingStructure: BettingStructure) =>
            patch({ bettingStructure })
          }
          options={BETTING_STRUCTURES.map((entry) => ({
            value: entry.value,
            label: entry.label,
          }))}
        />
        {structure && <CreateGameHint>{structure.hint}</CreateGameHint>}
      </CreateGameRow>

      <CreateGameRow
        label="Counting"
        hint="A plain balance, or chips with distinct values."
      >
        <CreateGameSegment
          label="Counting"
          value={draft.chipModel}
          onValueChange={(chipModel: ChipModel) => patch({ chipModel })}
          options={[
            { value: ChipModel.AbstractBalance, label: 'Balance' },
            { value: ChipModel.Denominated, label: 'Chips' },
          ]}
        />
        {draft.chipModel === ChipModel.Denominated && <ChipsGroup />}
      </CreateGameRow>
    </CreateGameSection>
  );
};
