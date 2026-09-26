'use client';

import { CreateGameEconomy } from '@components/game/create/create-game-economy';
import { CreateGameFlow } from '@components/game/create/create-game-flow';
import { CreateGameMode } from '@components/game/create/create-game-mode';
import { CreateGameSeats } from '@components/game/create/create-game-seats';
import {
  CreateGameRow,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { CreateGameStakes } from '@components/game/create/create-game-stakes';
import { CreateGameSummary } from '@components/game/create/create-game-summary';
import {
  FeltBackLink,
  FeltHeader,
  FeltStage,
} from '@components/game/felt/felt-stage';
import { Logo } from '@components/layout/logo/smart-logo';
import { Input } from '@components/ui/input';
import { GAME_NAME_MAX_LENGTH } from '@constants/games';
import ROUTES from '@constants/routes';
import { useGameDraft } from '@hooks/use-game-draft';
import { useGameName } from '@hooks/use-game-name';
import { useMaxSeats } from '@hooks/use-plan';
import { createGameOptions } from '@services/games/games.options';
import { writePlayerToken } from '@services/games/games.tokens';
import { useMutation } from '@tanstack/react-query';
import { GameMode } from '@tokenizer/shared/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const CreateGame: React.FC = () => {
  const router = useRouter();
  const maxSeats = useMaxSeats();
  const controller = useGameDraft(maxSeats);
  const { draft, config, review, patch } = controller;
  const name = useGameName(draft.name);

  const { mutate: createGame, isPending } = useMutation(createGameOptions());

  const handleCreate = () => {
    if (review.blocker || isPending) return;

    createGame(
      {
        mode: draft.mode,
        name,
        config,
      },
      {
        onSuccess: (result) => {
          writePlayerToken(result.snapshot.id, result.token);
          router.push(ROUTES.game(result.snapshot.id));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <FeltStage variant="form">
      <div className="flex items-center gap-3.5">
        <Logo />
        <FeltBackLink className="ml-auto" asChild>
          <Link href={ROUTES.dashboard()}>Cancel</Link>
        </FeltBackLink>
      </div>

      <FeltHeader
        size="lg"
        title="New game"
        description="Pick the game, name the table, set it up. Everything below stays editable until you open it."
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <CreateGameMode
            selected={draft.mode}
            onSelect={(mode) => patch({ mode })}
          />

          <CreateGameSection title="The table">
            <CreateGameRow
              label="Name"
              hint="Shown on the table and in the invitation."
              htmlFor="game-name"
            >
              <Input
                id="game-name"
                value={draft.name}
                onChange={(event) => patch({ name: event.target.value })}
                maxLength={GAME_NAME_MAX_LENGTH}
                placeholder="Friday night"
                variant="felt"
                size="lg"
              />
            </CreateGameRow>
          </CreateGameSection>

          <CreateGameSeats controller={controller} maxSeats={maxSeats} />

          {draft.mode === GameMode.Poker ? (
            <CreateGameStakes controller={controller} />
          ) : (
            <>
              <CreateGameEconomy controller={controller} />
              <CreateGameFlow controller={controller} />
            </>
          )}
        </form>

        <CreateGameSummary
          controller={controller}
          onCreate={handleCreate}
          isCreating={isPending}
        />
      </div>
    </FeltStage>
  );
};
