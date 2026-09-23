'use client';

import {
  CreateGameHint,
  CreateGameRow,
  CreateGameSection,
  CreateGameSwitchLine,
} from '@components/game/create/create-game-stage';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@components/ui/input-group';
import { Switch } from '@components/ui/switch';
import {
  INITIAL_BALANCE_STEP,
  MIN_SEATS,
  SEAT_DISPLAY_NAME_MAX_LENGTH,
} from '@constants/games';
import type { GameDraftController } from '@hooks/use-game-draft';
import { toAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { Coins, Minus, Plus, X } from 'lucide-react';
import { useState } from 'react';

export interface CreateGameSeatsProps {
  controller: GameDraftController;
  maxSeats: number;
}

/**
 * Who sits at the table, and what they sit down with.
 *
 * Seats are declared here and nowhere else: the join flow only ever offers the
 * chairs this screen created, so a table that opens two seats short stays two
 * seats short all night.
 */
export const CreateGameSeats: React.FC<CreateGameSeatsProps> = ({
  controller,
  maxSeats,
}) => {
  const {
    draft,
    addSeat,
    renameSeat,
    setSeatStack,
    removeSeat,
    setDefaultStack,
    setPerSeatStacks,
    patch,
  } = controller;

  const [newSeat, setNewSeat] = useState('');
  const isFull = draft.seats.length >= maxSeats;

  const handleAddSeat = () => {
    if (!newSeat.trim() || isFull) return;
    addSeat(newSeat);
    setNewSeat('');
  };

  return (
    <CreateGameSection
      title="The seats"
      meta={`${draft.seats.length} ${draft.seats.length === 1 ? 'seat' : 'seats'}`}
    >
      <CreateGameRow
        label="Starting stack"
        hint="What every player gets when they sit down."
        htmlFor="default-stack"
      >
        <InputGroup variant="felt" size="lg" className="w-40">
          <InputGroupAddon align="inline-start">
            <InputGroupButton
              size="icon-xs"
              aria-label="Lower the starting stack"
              disabled={draft.defaultInitialBalance <= 0}
              onClick={() =>
                setDefaultStack(
                  Math.max(
                    0,
                    draft.defaultInitialBalance - INITIAL_BALANCE_STEP,
                  ),
                )
              }
            >
              <Minus />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            id="default-stack"
            inputMode="numeric"
            value={draft.defaultInitialBalance}
            onChange={(event) => setDefaultStack(toAmount(event.target.value))}
            className="text-center font-bold tabular-nums"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Raise the starting stack"
              onClick={() =>
                setDefaultStack(
                  draft.defaultInitialBalance + INITIAL_BALANCE_STEP,
                )
              }
            >
              <Plus />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <CreateGameSwitchLine label="Set the stack seat by seat">
          <Switch
            checked={draft.perSeatStacks}
            onCheckedChange={setPerSeatStacks}
            aria-label="Set the stack seat by seat"
            variant="felt"
          />
        </CreateGameSwitchLine>

        <CreateGameHint>
          {draft.perSeatStacks
            ? 'Each seat carries its own starting stack, opening on the one above.'
            : 'Every seat starts on the same stack.'}
        </CreateGameHint>
      </CreateGameRow>

      <CreateGameRow
        label="Who plays"
        hint="Every seat carries a name, which the player can replace when they sit down."
      >
        <ul className="flex max-h-76 w-full flex-col gap-2 overflow-y-auto">
          {draft.seats.map((seat, index) => {
            const stack = seat.initialBalance ?? draft.defaultInitialBalance;
            const isCustom =
              draft.perSeatStacks && stack !== draft.defaultInitialBalance;

            return (
              <li
                key={seat.key}
                className={cn(
                  'border-on-media-hairline bg-on-media-scrim grid items-center gap-2 rounded-lg border px-2.5 py-2',
                  draft.perSeatStacks
                    ? 'grid-cols-[1.25rem_minmax(0,1fr)_auto] sm:grid-cols-[1.25rem_minmax(0,1fr)_7.5rem_auto]'
                    : 'grid-cols-[1.25rem_minmax(0,1fr)_auto]',
                )}
              >
                <span className="text-on-media-muted-foreground text-center text-xs font-bold tabular-nums">
                  {index + 1}
                </span>
                <Input
                  value={seat.displayName}
                  onChange={(event) => renameSeat(seat.key, event.target.value)}
                  maxLength={SEAT_DISPLAY_NAME_MAX_LENGTH}
                  placeholder="Name of the seat"
                  aria-label={`Name of seat ${index + 1}`}
                  aria-invalid={!seat.displayName.trim()}
                  variant="felt"
                />
                {draft.perSeatStacks && (
                  <InputGroup
                    variant="felt"
                    size="sm"
                    className={cn(
                      'col-span-full sm:col-span-1',
                      isCustom && 'border-warning text-warning',
                    )}
                  >
                    <InputGroupAddon align="inline-start">
                      <InputGroupText
                        className={cn(isCustom && 'text-warning')}
                      >
                        <Coins />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      inputMode="numeric"
                      value={stack}
                      aria-label={`Starting stack of seat ${index + 1}`}
                      onChange={(event) =>
                        setSeatStack(seat.key, toAmount(event.target.value))
                      }
                      className="font-semibold tabular-nums"
                    />
                  </InputGroup>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove seat ${index + 1}`}
                  disabled={draft.seats.length <= MIN_SEATS}
                  onClick={() => removeSeat(seat.key)}
                  className="text-on-media-muted-foreground hover:bg-on-media-film hover:text-destructive"
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>

        <div className="flex w-full gap-2">
          <Input
            value={newSeat}
            onChange={(event) => setNewSeat(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              handleAddSeat();
            }}
            maxLength={SEAT_DISPLAY_NAME_MAX_LENGTH}
            placeholder="Name of the new seat"
            aria-label="Name of the new seat"
            disabled={isFull}
            variant="felt"
            size="lg"
            className="flex-1"
          />
          <Button
            type="button"
            variant="line"
            size="lg"
            disabled={!newSeat.trim() || isFull}
            onClick={handleAddSeat}
          >
            Add
          </Button>
        </div>

        {isFull && (
          <CreateGameHint>A table tops out at {maxSeats} seats.</CreateGameHint>
        )}
      </CreateGameRow>

      <CreateGameRow
        label="Joining after the deal"
        hint="Otherwise only the players seated before the first round take part."
      >
        <CreateGameSwitchLine
          label={draft.allowMidGameClaims ? 'Allowed' : 'Closed'}
        >
          <Switch
            checked={draft.allowMidGameClaims}
            onCheckedChange={(allowMidGameClaims) =>
              patch({ allowMidGameClaims })
            }
            aria-label="Allow joining after the deal"
            variant="felt"
          />
        </CreateGameSwitchLine>
      </CreateGameRow>

      <CreateGameRow
        label="Extra seats"
        hint={`Lets you open another chair once all ${maxSeats === draft.seats.length ? 'of them' : 'of these'} are taken, up to ${maxSeats}. Off means the table size is fixed.`}
      >
        <CreateGameSwitchLine
          label={draft.allowExtraSeats ? 'Can be added' : 'Fixed'}
        >
          <Switch
            checked={draft.allowExtraSeats}
            onCheckedChange={(allowExtraSeats) => patch({ allowExtraSeats })}
            aria-label="Allow extra seats to be added later"
            variant="felt"
          />
        </CreateGameSwitchLine>
      </CreateGameRow>
    </CreateGameSection>
  );
};
