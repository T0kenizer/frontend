'use client';

import { RoomLoading, RoomUnavailable } from '@components/game/room-shell';
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
      <RoomUnavailable message={game.error?.message}>
        <Button variant="line" asChild>
          <Link href={ROUTES.game.join()}>Enter a code instead</Link>
        </Button>
      </RoomUnavailable>
    );
  }

  if (!game.participantId) {
    if (game.socketError) {
      return (
        <RoomUnavailable message={game.socketError}>
          <Button variant="line" onClick={game.reattach}>
            Try again
          </Button>
        </RoomUnavailable>
      );
    }
    return <RoomLoading>Finding your seat…</RoomLoading>;
  }

  return <TableRoom gameId={gameId} game={game} />;
};
