'use client';

import { Feature } from '@components/feature';
import { CreateGameEconomy } from '@components/game/create/create-game-economy';
import { CreateGameFlow } from '@components/game/create/create-game-flow';
import { CreateGameSeats } from '@components/game/create/create-game-seats';
import {
  CreateGameRow,
  CreateGameSection,
} from '@components/game/create/create-game-stage';
import { CreateGameSummary } from '@components/game/create/create-game-summary';
import { CreateGameTemplates } from '@components/game/create/create-game-templates';
import {
  FeltBackLink,
  FeltHeader,
  FeltStage,
} from '@components/game/felt/felt-stage';
import { Logo } from '@components/layout/logo';
import { Input } from '@components/ui/input';
import { GAME_NAME_MAX_LENGTH } from '@constants/games';
import ROUTES from '@constants/routes';
import { useGameDraft } from '@hooks/use-game-draft';
import { useFeature, useMaxSeats } from '@hooks/use-plan';
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
        ...(canCustomize
          ? { config }
          : { templateId: templateId!, seats: config.seating.seats }),
      },
      {
        onSuccess: (result) => router.push(ROUTES.game(result.snapshot.id)),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <FeltStage variant="form">
      <div className="flex items-center gap-3.5">
        <Logo />
        <FeltBackLink className="ml-auto" asChild>
          <Link href={ROUTES.home()}>Cancel</Link>
        </FeltBackLink>
      </div>

      <FeltHeader
        size="lg"
        title="New game"
        description="Name the table. Whatever your plan unlocks below stays editable until you open it."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          className="flex flex-col gap-4"
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
                variant="felt"
                size="lg"
              />
            </CreateGameRow>
          </CreateGameSection>

          <CreateGameTemplates
            selectedId={templateId}
            onSelect={setPickedTemplateId}
          />

          <CreateGameSeats controller={controller} maxSeats={maxSeats} />

          <Feature
            feature={FeatureFlag.CreateGame}
            when={(metadata) => metadata.canCustomize}
          >
            <CreateGameEconomy controller={controller} />
            <CreateGameFlow controller={controller} />
          </Feature>
        </form>

        <CreateGameSummary
          controller={controller}
          onCreate={handleCreate}
          isCreating={isPending}
          blocker={blocker}
        />
      </div>
    </FeltStage>
  );
};
