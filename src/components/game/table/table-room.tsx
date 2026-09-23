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
import * as React from 'react';
import { toast } from 'sonner';

/**
 * The live table, assembled.
 *
 * Two halves and nothing else: {@link TableRing} draws the chairs and the people
 * in them, {@link TableHub} draws whatever the game is asking for. This
 * component is the only place that knows about both, and all it does is hold
 * the state neither of them should own — what is in flight, what the server
 * last refused, which form is open — and hand each half what it needs.
 *
 * Nothing here decides what a state of the game _means_; that is
 * {@link useTableView}, once, off the snapshot.
 */

export interface TableRoomProps {
  gameId: string;
  game: GameSession;
}

export const TableRoom: React.FC<TableRoomProps> = ({ gameId, game }) => {
  const view = useTableView(game);

  const [pending, setPending] = React.useState<Nullable<string>>(null);
  const [error, setError] = React.useState<Nullable<string>>(null);
  const [isRenaming, setIsRenaming] = React.useState(false);

  const seats = game.snapshot?.participants ?? EMPTY_SEATS;
  const flights = useChipFlights(seats);
  const { ringRef, hubRef, geometry } = useRingGeometry(seats.length);

  /**
   * One wrapper around every call that can fail, because they all fail the same
   * way: the socket acks with a message, and the player needs to see it on the
   * panel they pressed rather than in a toast that has already gone.
   */
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

    // `navigator.share` is the one that actually gets the link to someone in
    // the room; the clipboard is the fallback for a laptop with no share sheet.
    if (navigator.share) {
      try {
        await navigator.share({
          title: game.snapshot?.name ?? 'Tokenizer',
          text: code ? `Join my table — code ${code}` : 'Join my table',
          url,
        });
        return;
      } catch {
        // Dismissing the share sheet throws. That is not a failure worth
        // reporting, so fall through to the clipboard.
      }
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
    submitAction: (action, amount, targetParticipantId) =>
      void run(action, () =>
        game.submitAction(action, amount, targetParticipantId),
      ),
    declareWinners: (awards) =>
      void run('showdown', () => game.declareWinners(awards)),
    closeGame: () => void run('close', game.closeGame),
    renameSeat: () => setIsRenaming(true),
    addSeat: () => void run('add-seat', () => game.addSeat()),
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
const EMPTY_SEATS: NonNullable<GameSession['snapshot']>['participants'] = [];
