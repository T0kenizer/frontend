'use client';

import { FeltPanel } from '@components/game/felt/felt-stage';
import { RoomLoading, RoomShell } from '@components/game/room-shell';
import { SpectatorTable } from '@components/game/table/spectator-table';
import { useGameSession } from '@hooks/use-game-session';

interface SpectatorRoomProps {
  gameId: string;
}

export const SpectatorRoom: React.FC<SpectatorRoomProps> = ({ gameId }) => {
  const game = useGameSession({ gameId, spectate: true });

  if (game.isLoading) return <RoomLoading>Finding that table…</RoomLoading>;

  if (game.error || !game.snapshot) {
    return (
      <RoomShell>
        <FeltPanel className="py-10 text-center">
          <p className="text-sm font-semibold xl:text-lg">
            {game.error?.message ?? 'That table is no longer available.'}
          </p>
        </FeltPanel>
      </RoomShell>
    );
  }

  return <SpectatorTable gameId={gameId} game={game} />;
};
