'use client';

import { SeatNameForm } from '@components/game/seat-name-form';
import type { TableActions } from '@components/game/table/table-actions';
import { TableLayout } from '@components/game/table/table-layout';
import {
  useTableView,
  type GameSession,
} from '@components/game/table/use-table-view';
import { APP_NAME } from '@constants/index';
import ROUTES from '@constants/routes';
import { useState } from 'react';
import { toast } from 'sonner';

export interface TableRoomProps {
  gameId: string;
  game: GameSession;
}

export const TableRoom: React.FC<TableRoomProps> = ({ gameId, game }) => {
  const view = useTableView(game);

  const [pending, setPending] = useState<Nullable<string>>(null);
  const [error, setError] = useState<Nullable<string>>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const run = async (id: string, call: () => Promise<unknown>) => {
    setPending(id);
    setError(null);
    try {
      await call();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'That did not go through.',
      );
    } finally {
      setPending(null);
    }
  };

  const shareTable = async () => {
    const url = new URL(
      ROUTES.game.join(gameId),
      window.location.origin,
    ).toString();
    const code = game.snapshot?.joinCode;

    if (navigator.share) {
      try {
        await navigator.share({
          title: game.snapshot?.name ?? APP_NAME,
          text: code ? `Join my table — code ${code}` : 'Join my table',
          url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const actions: TableActions = {
    startHand: () => void run('start', game.startHand),
    startRound: () => void run('start', game.startRound),
    submitAction: (action, amount, targetParticipantId) =>
      void run(action, () =>
        game.submitAction(action, amount, targetParticipantId),
      ),
    submitCatalogAction: (definitionId, amount, targetParticipantId) =>
      void run(definitionId, () =>
        game.submitCatalogAction(definitionId, amount, targetParticipantId),
      ),
    declareWinners: (awards) =>
      void run('showdown', () => game.declareWinners(awards)),
    resolveRound: (winnerIds) =>
      void run('resolve', () => game.resolveRound(winnerIds)),
    closeGame: () => void run('close', game.closeGame),
    renameSeat: () => setIsRenaming(true),
    shareTable: () => void shareTable(),
    pending,
    error,
  };

  if (!view) return null;

  const form =
    isRenaming && view.mySeat ? (
      <SeatNameForm
        mode="rename"
        defaultDisplayName={view.mySeat.displayName}
        currentAvatarUrl={view.mySeat.avatarUrl}
        onCancel={() => setIsRenaming(false)}
        onSubmit={async ({ avatar, ...data }) => {
          if (data.displayName !== undefined) await game.updateSeat(data);
          if (avatar !== undefined) await game.setSeatAvatar(avatar);
          setIsRenaming(false);
        }}
      />
    ) : null;

  return (
    <TableLayout
      gameId={gameId}
      game={game}
      view={view}
      actions={actions}
      form={form}
    />
  );
};
