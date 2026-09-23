'use client';

import { FeltPanel, FeltStage } from '@components/game/felt/felt-stage';
import { TableRoom } from '@components/game/table/table-room';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useGameSession } from '@hooks/use-game-session';
import { usePlayerToken } from '@hooks/use-player-token';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

interface GameRoomProps {
  gameId: string;
}

/**
 * The shell the states that are not a table share, so they do not each invent
 * one.
 */
const RoomShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <FeltStage variant="table" className="justify-center">
    {children}
  </FeltStage>
);

const RoomLoading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoomShell>
    <FeltPanel className="flex items-center justify-center gap-2.5 py-12 text-sm">
      <Loader2 aria-hidden className="size-4 animate-spin" />
      {children}
    </FeltPanel>
  </RoomShell>
);

/**
 * `/game/:uuid` — the table, for the people who are at it.
 *
 * This route is for playing a seat you already hold, and nothing else. There is
 * one way into a game and it is the join flow: it is where a table is named, a
 * chair is picked and a token is issued, and arriving here without that token
 * means you are not in this game — so you are sent there rather than shown a
 * table you could only watch.
 *
 * That is why nothing on this screen claims a seat. Letting the table hand out
 * chairs would have made a second, quieter way in, one that skips the steps the
 * join flow exists to perform.
 *
 * The redirect is also the exit for a token the server rejects:
 * `useGameSession` drops a refused token, which reaches {@link usePlayerToken},
 * which lands here on the next render.
 */
export const GameRoom: React.FC<GameRoomProps> = ({ gameId }) => {
  const router = useRouter();
  const token = usePlayerToken(gameId);

  // Gate on the session query so a signed-in player is never treated as a
  // guest because their cookie had not been read yet.
  const { isSuccess } = useQuery(retrieveSessionOptions());
  const game = useGameSession({ gameId, enabled: isSuccess });

  const isMember = token !== null;

  useLayoutEffect(() => {
    if (!isMember) router.replace(ROUTES.game.join(gameId));
  }, [isMember, gameId, router]);

  // `replace` is not instant, and rendering the table in the meantime would
  // flash a room this visitor is not in.
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

  // The token is in hand but the socket has not said which seat it buys yet.
  // Waiting spares the table a first paint in which nobody owns a chair, and
  // with it every panel having to cope with a member who has no seat.
  if (!game.participantId) {
    return <RoomLoading>Finding your seat…</RoomLoading>;
  }

  return <TableRoom gameId={gameId} game={game} />;
};
