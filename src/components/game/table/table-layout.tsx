'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { TableHub } from '@components/game/table/hub/table-hub';
import {
  NO_TABLE_ACTIONS,
  type TableActions,
} from '@components/game/table/table-actions';
import { TableRing } from '@components/game/table/table-ring';
import { TableTopBar } from '@components/game/table/table-top-bar';
import { useChipFlights } from '@components/game/table/use-chip-flights';
import { useRingGeometry } from '@components/game/table/use-ring-geometry';
import type {
  GameSession,
  TableView,
} from '@components/game/table/use-table-view';

export interface TableLayoutProps {
  gameId: string;
  game: GameSession;
  view: TableView;
  actions?: TableActions;
  form?: Nullable<React.ReactNode>;
  spectatorMode?: boolean;
}

/** The live table as both the players and the shared screen see it. */
export const TableLayout: React.FC<TableLayoutProps> = ({
  gameId,
  game,
  view,
  actions = NO_TABLE_ACTIONS,
  form = null,
  spectatorMode = false,
}) => {
  const seats = game.snapshot?.participants ?? EMPTY_SEATS;
  const flights = useChipFlights(seats);
  const { ringRef, hubRef, geometry } = useRingGeometry(seats.length);

  const tableName = game.snapshot?.name ?? 'Table';

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <TableTopBar
        gameId={gameId}
        joinCode={game.snapshot?.joinCode ?? null}
        tableName={tableName}
        isConnected={game.isConnected}
        isOver={game.isOver}
        spectatorMode={spectatorMode}
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
          tableName={tableName}
          form={form}
        />
      </TableRing>
    </div>
  );
};

/** Stable empty array: a fresh `[]` each render would restart the chip diff. */
const EMPTY_SEATS: NonNullable<GameSession['snapshot']>['participants'] = [];
