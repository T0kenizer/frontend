'use client';

import {
  CreateGameHint,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { cn } from '@lib/utils';
import { listGameModesOptions } from '@services/games/games.options';
import { useQuery } from '@tanstack/react-query';
import { GameMode } from '@tokenizer/shared/types';
import { Check } from 'lucide-react';

/**
 * The first decision, and the one every other one hangs off.
 *
 * Choosing the game is not choosing a preset: it is choosing which rules the
 * table will be played by, and therefore which parameters the rest of this
 * screen is even allowed to ask for. There is one game today, and it is still
 * shown as a choice — a host should know what they are sitting down to.
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
