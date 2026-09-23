'use client';

import {
  CreateGameHint,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { FeltBadge } from '@components/game/felt/felt-stage';
import { ScrollFade } from '@components/ui/scroll-fade';
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
  const { modes: allowedModes } = useFeatureMetadata(FeatureFlag.CreateGame);

  const available = modes?.filter((entry) =>
    allowedModes.includes(entry.mode),
  ).length;

  return (
    <CreateGameSection
      title="The game"
      meta={available ? `${available} available` : undefined}
    >
      <div className="py-2">
        {isPending && <CreateGameHint>Loading the games…</CreateGameHint>}

        {modes?.length === 0 && (
          <CreateGameHint>No game is available right now.</CreateGameHint>
        )}

        <ScrollFade asChild>
          <ul className="flex gap-2">
            {modes?.map((entry) => {
              const isLocked = !allowedModes.includes(entry.mode);
              const isSelected = !isLocked && entry.mode === selected;

              return (
                <li key={entry.mode} className="w-64 shrink-0 grow">
                  <button
                    type="button"
                    disabled={isLocked}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(entry.mode)}
                    className={cn(
                      'border-on-media-hairline bg-on-media-scrim flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors',
                      isLocked
                        ? 'cursor-not-allowed opacity-55'
                        : isSelected
                          ? 'border-warning bg-on-media-film'
                          : 'hover:bg-on-media-film',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-on-media-foreground text-sm font-bold">
                          {entry.name}
                        </span>
                        {entry.experimental && (
                          <FeltBadge tone="solid">Experimental</FeltBadge>
                        )}
                      </span>
                      {isLocked ? (
                        <Lock className="text-on-media-muted-foreground size-4 shrink-0" />
                      ) : (
                        isSelected && (
                          <Check className="text-warning size-4 shrink-0" />
                        )
                      )}
                    </span>
                    <span className="text-on-media-muted-foreground text-xs leading-relaxed">
                      {entry.description}
                    </span>
                    {/* What it would take to open one, rather than the bare fact
                      that you cannot: a lock that does not say how to get past
                      it is just a dead card on the screen. */}
                    {isLocked && (
                      <span className="text-on-media-muted-foreground text-xs leading-relaxed">
                        Part of the paid plan — upgrade to open a table in this
                        game.
                      </span>
                    )}
                    {/* Only once it is the table being opened: on every card it
                      would read as a warning about the list, not the choice. */}
                    {entry.experimental && isSelected && (
                      <span className="text-warning text-xs leading-relaxed">
                        {EXPERIMENTAL_MODE_NOTE[entry.mode]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollFade>
      </div>
    </CreateGameSection>
  );
};
