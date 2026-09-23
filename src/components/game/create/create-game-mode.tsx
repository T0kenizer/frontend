'use client';

import {
  CreateGameHint,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { FeltBadge } from '@components/game/felt/felt-stage';
import { EXPERIMENTAL_MODE_NOTE } from '@constants/games';
import { useFeatureMetadata } from '@hooks/use-plan';
import { cn } from '@lib/utils';
import { listGameModesOptions } from '@services/games/games.options';
import { useQuery } from '@tanstack/react-query';
import { Feature as FeatureFlag, GameMode } from '@tokenizer/shared/types';
import { Check, Lock } from 'lucide-react';

/**
 * The first decision, and the one every other one hangs off.
 *
 * Choosing the game is not choosing a preset: it is choosing which rules the
 * table will be played by, and therefore which parameters the rest of this
 * screen is even allowed to ask for.
 *
 * A mode the server calls experimental says so on its own card, and says what
 * that costs the host once it is picked. Burying it further down the list would
 * have been the quieter choice and the dishonest one: the free table is not a
 * lesser poker, it is a different promise — you write the rules, and nothing
 * checks them.
 *
 * A mode the plan does not include is shown all the same, locked. `GET
 * /games/modes` answers what the server runs, not what this host may open — it
 * is public and has no plan to read — so which of them are reachable is decided
 * here, against the same metadata the API will enforce on create. Hiding them
 * outright would have been the easier render and the worse screen: a host
 * cannot ask for what they cannot see, and the one thing an upgrade has to be
 * is legible.
 */

export interface CreateGameModeProps {
  selected: GameMode;
  onSelect: (mode: GameMode) => void;
}

export const CreateGameMode: React.FC<CreateGameModeProps> = ({
  selected,
  onSelect,
}) => {
  const { data: modes, isPending } = useQuery(listGameModesOptions());

  return (
    <CreateGameSection
      title="The game"
      meta={modes?.length ? `${modes.length} available` : undefined}
    >
      <div className="py-2">
        {isPending && <CreateGameHint>Loading the games…</CreateGameHint>}

        {modes?.length === 0 && (
          <CreateGameHint>No game is available right now.</CreateGameHint>
        )}

        <ul className="grid gap-2 sm:grid-cols-2">
          {modes?.map((entry) => {
            const isSelected = entry.mode === selected;

            return (
              <li key={entry.mode}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(entry.mode)}
                  className={cn(
                    'border-on-media-hairline bg-on-media-scrim flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-warning bg-on-media-film'
                      : 'hover:bg-on-media-film',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-on-media-foreground text-sm font-bold">
                      {entry.name}
                    </span>
                    {isSelected && (
                      <Check className="text-warning size-4 shrink-0" />
                    )}
                  </span>
                  <span className="text-on-media-muted-foreground text-xs leading-relaxed">
                    {entry.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </CreateGameSection>
  );
};
