'use client';

import { RoomLoading, RoomUnavailable } from '@components/game/room-shell';
import { TableLayout } from '@components/game/table/table-layout';
import { useTableView } from '@components/game/table/use-table-view';
import { useGameSession } from '@hooks/use-game-session';

interface SpectatorRoomProps {
  gameId: string;
}

export const SpectatorRoom: React.FC<SpectatorRoomProps> = ({ gameId }) => {
  const game = useGameSession({ gameId, spectate: true });
  const view = useTableView(game);

  if (game.isLoading) return <RoomLoading>Finding that table…</RoomLoading>;

  if (game.error || !view) {
    return <RoomUnavailable message={game.error?.message} />;
  }

  return <TableLayout gameId={gameId} game={game} view={view} spectatorMode />;
};
