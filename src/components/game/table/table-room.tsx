'use client';

import { SeatNameForm } from '@components/game/seat-name-form';
import type { TableActions } from '@components/game/table/table-actions';
import { TableLayout } from '@components/game/table/table-layout';
import {
  useTableView,
  type GameSession,
} from '@components/game/table/use-table-view';
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
          title: game.snapshot?.name ?? 'Tokenizer',
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

  // Left for the React Compiler to memoize. Spelling the dependencies out by
  // hand here was a losing game: the compiler infers `game.snapshot` where the
  // list said `game.snapshot?.name`, disagrees, and bails out of optimizing
  // the whole component rather than the one value.
  const actions: TableActions = {
    startHand: () => void run('start', game.startHand),
    startRound: () => void run('start', game.startRound),
    submitAction: (action, amount, targetParticipantId) =>
      void run(action, () =>
        game.submitAction(action, amount, targetParticipantId),
      ),
    // Keyed by the catalog id the host wrote, exactly as the poker call is
    // keyed by its action: it is what the panel spins the pressed button on.
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

  // Renaming is the only form the table has. Claiming a chair belongs to the
  // join flow — see `game-room.tsx` — so there is nothing here that seats
  // anybody.
  const form =
    isRenaming && view.mySeat ? (
      <SeatNameForm
        mode="rename"
        defaultDisplayName={view.mySeat.displayName}
        onCancel={() => setIsRenaming(false)}
        onSubmit={async (data) => {
          await game.updateSeat(data);
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
