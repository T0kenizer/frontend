'use client';

import { CreateGameEconomy } from '@components/game/create/create-game-economy';
import { CreateGameFlow } from '@components/game/create/create-game-flow';
import { CreateGameSeats } from '@components/game/create/create-game-seats';
import {
  CreateGameRow,
  CreateGameSection,
  FELT_INPUT,
} from '@components/game/create/create-game-stage';
import { CreateGameSummary } from '@components/game/create/create-game-summary';
import { Logo } from '@components/layout/logo';
import { Input } from '@components/ui/input';
import { GAME_NAME_MAX_LENGTH } from '@constants/games';
import ROUTES from '@constants/routes';
import { useGameDraft } from '@hooks/use-game-draft';
import { cn } from '@lib/utils';
import { createGameOptions } from '@services/games/games.options';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

/**
 * Where a table is dealt into existence.
 *
 * Everything a game will play by is settled here, because most of it cannot be
 * changed afterwards: seats are declared once and claimed later, and the action
 * catalog is what the runtime hands a player on their turn. The rail on the
 * right shows the table that is about to open, so the host reads the
 * consequences of a switch without having to imagine them.
 */
export const CreateGame: React.FC = () => {
  const router = useRouter();
  const controller = useGameDraft();
  const { draft, config, review, patch } = controller;

  const { mutate: createGame, isPending } = useMutation(createGameOptions());

  const handleCreate = () => {
    if (review.blocker || isPending) return;

    const name = draft.name.trim();

    createGame(
      { ...(name ? { name } : {}), config },
      {
        // Creating a game seats the owner, so the result is a join result: the
        // token is stored by the mutation, the uuid is the route.
        onSuccess: (result) => router.push(ROUTES.game(result.snapshot.id)),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 pt-5 pb-16">
      <div className="mb-6 flex items-center gap-3.5">
        <Logo />
        <Link
          href={ROUTES.home()}
          className="text-on-media-muted-foreground hover:text-on-media-foreground ml-auto text-xs font-semibold no-underline hover:no-underline"
        >
          Cancel
        </Link>
      </div>

      <h1 className="font-heading text-3xl font-extrabold tracking-[-0.04em]">
        New game
      </h1>
      <p className="text-on-media-muted-foreground mt-2 mb-6 max-w-[56ch] text-sm leading-relaxed">
        Name the seats, set the starting stack and the rules of the turn. All of
        it stays editable until you open the table.
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(event) => event.preventDefault()}
        >
          <CreateGameSection title="The game">
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
                className={cn(FELT_INPUT, 'h-9 w-full')}
              />
            </CreateGameRow>
          </CreateGameSection>

          <CreateGameSeats controller={controller} />
          <CreateGameEconomy controller={controller} />
          <CreateGameFlow controller={controller} />
        </form>

        <CreateGameSummary
          controller={controller}
          onCreate={handleCreate}
          isCreating={isPending}
        />
      </div>
    </div>
  );
};
