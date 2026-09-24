'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { TableHub } from '@components/game/table/hub/table-hub';
import type { TableActions } from '@components/game/table/table-actions';
import { TableRing } from '@components/game/table/table-ring';
import { EMPTY_SEATS } from '@components/game/table/table-room';
import { TableTopBar } from '@components/game/table/table-top-bar';
import { useChipFlights } from '@components/game/table/use-chip-flights';
import { useRingGeometry } from '@components/game/table/use-ring-geometry';
import {
  useTableView,
  type GameSession,
} from '@components/game/table/use-table-view';

export interface SpectatorTableProps {
  gameId: string;
  game: GameSession;
}

export const SpectatorTable: React.FC<SpectatorTableProps> = ({
  gameId,
  game,
}) => {
  const view = useTableView(game);

  const seats = game.snapshot?.participants ?? EMPTY_SEATS;
  const flights = useChipFlights(seats);
  const { ringRef, hubRef, geometry } = useRingGeometry(seats.length);

  if (!view) return null;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <TableTopBar
        gameId={gameId}
        joinCode={game.snapshot?.joinCode ?? null}
        tableName={game.snapshot?.name ?? 'Table'}
        isConnected={game.isConnected}
        isOver={game.isOver}
        spectatorMode
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
          actions={SPECTATOR_ACTIONS}
          tableName={game.snapshot?.name ?? 'Table'}
        />
      </TableRing>
    </div>
  );
};

const noop = () => {};

/**
 * A spectator has no seat, so every panel shows its waiting state; nothing here
 * is ever called.
 */
const SPECTATOR_ACTIONS: TableActions = {
  startHand: noop,
  startRound: noop,
  submitAction: noop,
  submitCatalogAction: noop,
  declareWinners: noop,
  resolveRound: noop,
  closeGame: noop,
  renameSeat: noop,
  shareTable: noop,
  pending: null,
  error: null,
};
