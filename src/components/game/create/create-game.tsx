'use client';

import { Feature } from '@components/feature';
import { CreateGameEconomy } from '@components/game/create/create-game-economy';
import { CreateGameFlow } from '@components/game/create/create-game-flow';
import { CreateGameSeats } from '@components/game/create/create-game-seats';
import {
  CreateGameRow,
  CreateGameSection,
  FELT_INPUT,
} from '@components/game/create/create-game-stage';
import { CreateGameSummary } from '@components/game/create/create-game-summary';
import { CreateGameTemplates } from '@components/game/create/create-game-templates';
import { Logo } from '@components/layout/logo';
import { Input } from '@components/ui/input';
import { GAME_NAME_MAX_LENGTH } from '@constants/games';
import ROUTES from '@constants/routes';
import { useGameDraft } from '@hooks/use-game-draft';
import { useFeature, useMaxSeats } from '@hooks/use-plan';
import { cn } from '@lib/utils';
import {
  createGameOptions,
  listGameTemplatesOptions,
} from '@services/games/games.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Feature as FeatureFlag } from '@tokenizer/shared/types';
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
  const maxSeats = useMaxSeats();
  const canCustomize = useFeature(
    FeatureFlag.CreateGame,
    (metadata) => metadata.canCustomize,
  );
  const controller = useGameDraft(maxSeats);
  const { draft, config, review, patch } = controller;

  const { data: templates } = useQuery(listGameTemplatesOptions());
  // `null` means "no explicit choice yet" — the template picker then falls
  // back to the first one in the list, without a separate effect to sync it.
  const [pickedTemplateId, setPickedTemplateId] =
    React.useState<Nullable<string>>(null);
  const templateId = pickedTemplateId ?? templates?.[0]?.id ?? null;

  const { mutate: createGame, isPending } = useMutation(createGameOptions());

  const templateBlocker =
    !canCustomize && !templateId ? 'Pick a table to open.' : null;
  const blocker = review.blocker || templateBlocker;

  const handleCreate = () => {
    if (blocker || isPending) return;

    const name = draft.name.trim();

    createGame(
      {
        ...(name ? { name } : {}),
        // A plan without the canCustomize sub-feature must open a template
        // rather than submit a config of its own — but seats stay theirs to
        // set regardless, so the draft's seating rides along as an override.
        ...(canCustomize
          ? { config }
          : { templateId: templateId!, seats: config.seating.seats }),
      },
      {
        // Creating a game seats the owner, so the result is a join result: the
        // token is stored by the mutation, the uuid is the route.
        onSuccess: (result) => router.push(ROUTES.game(result.snapshot.id)),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-5 pb-16">
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
        Name the table. Whatever your plan unlocks below stays editable until
        you open it.
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(event) => event.preventDefault()}
        >
          <Feature
            feature={FeatureFlag.CreateGame}
            when={(metadata) => metadata.canCustomize}
            fallback={
              <CreateGameTemplates
                selectedId={templateId}
                onSelect={setPickedTemplateId}
              />
            }
          >
            <CreateGameEconomy controller={controller} />
            <CreateGameFlow controller={controller} />
          </Feature>

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

          <CreateGameSeats controller={controller} maxSeats={maxSeats} />
        </form>

        <CreateGameSummary
          controller={controller}
          onCreate={handleCreate}
          isCreating={isPending}
          blocker={blocker}
        />
      </div>
    </div>
  );
};
