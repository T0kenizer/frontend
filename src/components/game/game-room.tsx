'use client';

import { FeltPanel } from '@components/game/felt/felt-stage';
import { RoomLoading, RoomShell } from '@components/game/room-shell';
import { TableRoom } from '@components/game/table/table-room';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useGameSession } from '@hooks/use-game-session';
import { usePlayerToken } from '@hooks/use-player-token';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

interface GameRoomProps {
  gameId: string;
}

export const GameRoom: React.FC<GameRoomProps> = ({ gameId }) => {
  const router = useRouter();
  const token = usePlayerToken(gameId);

  const { isSuccess } = useQuery(retrieveSessionOptions());
  const game = useGameSession({ gameId, enabled: isSuccess });

  const isMember = token !== null;

  useLayoutEffect(() => {
    if (!isMember) router.replace(ROUTES.game.join(gameId));
  }, [isMember, gameId, router]);

  if (!isMember)
    return <RoomLoading>Taking you to the join screen…</RoomLoading>;

  if (game.isLoading) return <RoomLoading>Dealing you in…</RoomLoading>;

  if (game.error || !game.snapshot) {
    return (
      <RoomShell>
        <FeltPanel className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-sm font-semibold">
            {game.error?.message ?? 'That table is no longer available.'}
          </p>
          <Button variant="line" asChild>
            <Link href={ROUTES.game.join()}>Enter a code instead</Link>
          </Button>
        </FeltPanel>
      </RoomShell>
    );
  }

  if (!game.participantId) {
    return <RoomLoading>Finding your seat…</RoomLoading>;
  }

  return <TableRoom gameId={gameId} game={game} />;
};
