'use client';

import { FeltNotice, FeltPanel } from '@components/game/felt/felt-stage';
import { SeatNameForm } from '@components/game/seat-name-form';
import { TableHub } from '@components/game/table/hub/table-hub';
import type { TableActions } from '@components/game/table/table-actions';
import { TableRing } from '@components/game/table/table-ring';
import { TableTopBar } from '@components/game/table/table-top-bar';
import { useChipFlights } from '@components/game/table/use-chip-flights';
import { useRingGeometry } from '@components/game/table/use-ring-geometry';
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

  const seats = game.snapshot?.participants ?? EMPTY_SEATS;
  const flights = useChipFlights(seats);
  const { ringRef, hubRef, geometry } = useRingGeometry(seats.length);

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
      <FeltPanel size="sm" className="rounded-3xl px-5 py-5">
        <SeatNameForm
          mode="rename"
          defaultDisplayName={view.mySeat.displayName}
          onCancel={() => setIsRenaming(false)}
          onSubmit={async (data) => {
            await game.updateSeat(data);
            setIsRenaming(false);
          }}
        />
      </FeltPanel>
    ) : null;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <TableTopBar
        gameId={gameId}
        joinCode={game.snapshot?.joinCode ?? null}
        tableName={game.snapshot?.name ?? 'Table'}
        isConnected={game.isConnected}
        isOver={game.isOver}
      />

      {game.socketError && (
        <FeltNotice tone="error" className="mx-4 mb-2 shrink-0">
          {game.socketError}
        </FeltNotice>
      )}

      <TableRing
        seats={view.seats}
        geometry={geometry}
        flights={flights}
        ringRef={ringRef}
        hubRef={hubRef}
        chipModel={view.chipModel}
      >
        <TableHub
          view={view}
          actions={actions}
          tableName={game.snapshot?.name ?? 'Table'}
          form={form}
        />
      </TableRing>
    </div>
  );
};

/** Stable empty array: a fresh `[]` each render would restart the chip diff. */
export const EMPTY_SEATS: NonNullable<GameSession['snapshot']>['participants'] =
  [];
