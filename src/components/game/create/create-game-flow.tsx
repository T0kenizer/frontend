'use client';

import {
  CreateGameHint,
  CreateGameRow,
  CreateGameSection,
  CreateGameSegment,
} from '@components/game/create/create-game-stage';
import { FeltBadge } from '@components/game/felt/felt-stage';
import { Switch } from '@components/ui/switch';
import { ACTION_CATALOG, INTERRUPTION_WINDOWS } from '@constants/games';
import type { GameDraftController } from '@hooks/use-game-draft';
import { cn } from '@lib/utils';
import { Direction, EndResolution, TurnRegime } from '@tokenizer/shared/types';

/** What each turn regime actually does, in one line. */
const REGIME_HINTS: Record<TurnRegime, string> = {
  [TurnRegime.Sequential]:
    'The turn moves from player to player, with no way to cut in.',
  [TurnRegime.SequentialInterruptible]:
    'A player can cut into the turn during the window set below.',
  [TurnRegime.Simultaneous]:
    'Everyone plays at once; there is no order of play.',
};

export interface CreateGameFlowProps {
  controller: GameDraftController;
}

/**
 * A free table's turn: who speaks, in which order, for how long — and what they
 * are allowed to say.
 *
 * The action catalog is the part that reaches the table most directly: what is
 * left on here is exactly what a player is offered on their turn, so turning
 * everything off is caught before the table ever opens.
 */
export const CreateGameFlow: React.FC<CreateGameFlowProps> = ({
  controller,
}) => {
  const { draft, patch, toggleAction } = controller;

  const isInterruptible = draft.regime === TurnRegime.SequentialInterruptible;

  return (
    <CreateGameSection title="The flow">
      <CreateGameRow label="Order of play">
        <CreateGameSegment
          label="Order of play"
          value={draft.regime}
          onValueChange={(regime) => patch({ regime })}
          options={[
            { value: TurnRegime.Sequential, label: 'One at a time' },
            {
              value: TurnRegime.SequentialInterruptible,
              label: 'With instant raises',
            },
            { value: TurnRegime.Simultaneous, label: 'All at once' },
          ]}
        />
        <CreateGameHint>{REGIME_HINTS[draft.regime]}</CreateGameHint>
      </CreateGameRow>

      <CreateGameRow label="Direction">
        <CreateGameSegment
          label="Direction"
          value={draft.direction}
          onValueChange={(direction) => patch({ direction })}
          options={[
            { value: Direction.Clockwise, label: 'Clockwise' },
            { value: Direction.CounterClockwise, label: 'Counter-clockwise' },
          ]}
        />
      </CreateGameRow>

      {isInterruptible && (
        <CreateGameRow
          label="Window to cut in"
          hint="How long the others get to react before the turn moves on."
        >
          <CreateGameSegment
            label="Window to cut in"
            value={String(draft.interruptionWindow)}
            onValueChange={(value) =>
              patch({ interruptionWindow: Number(value) })
            }
            options={INTERRUPTION_WINDOWS.map((window) => ({
              value: String(window.value),
              label: window.label,
            }))}
          />
        </CreateGameRow>
      )}

      <CreateGameRow
        label="End of a round"
        hint="Automatic: the round closes as soon as one player is left."
      >
        <CreateGameSegment
          label="End of a round"
          value={draft.resolution}
          onValueChange={(resolution) => patch({ resolution })}
          options={[
            { value: EndResolution.Automatic, label: 'Automatic' },
            { value: EndResolution.ManualHost, label: 'I decide' },
          ]}
        />
      </CreateGameRow>

      <CreateGameRow
        label="What players can do"
        hint="Turn off anything that has no place in your game."
      >
        <ul className="flex w-full flex-col gap-2">
          {ACTION_CATALOG.map((action) => {
            const isOn = draft.enabledActions.includes(action.id);
            const tag = action.grantsInterruption
              ? 'Can cut in'
              : action.foldsParticipant
                ? 'Leaves the round'
                : null;

            return (
              <li
                key={action.id}
                className={cn(
                  'border-on-media-hairline bg-on-media-scrim grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2.5 transition-opacity',
                  !isOn && 'opacity-55',
                )}
              >
                <Switch
                  checked={isOn}
                  onCheckedChange={() => toggleAction(action.id)}
                  aria-label={`Allow players to ${action.label.toLowerCase()}`}
                  variant="felt"
                />
                <span>
                  <span className="block text-sm font-semibold">
                    {action.label}
                  </span>
                  <span className="text-on-media-muted-foreground mt-0.5 block text-xs">
                    {action.description}
                  </span>
                </span>
                {tag && <FeltBadge>{tag}</FeltBadge>}
              </li>
            );
          })}
        </ul>
      </CreateGameRow>
    </CreateGameSection>
  );
};
