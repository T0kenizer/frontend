'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { SeatJoinForm } from '@components/game/seat-join-form';
import { SeatUpdateForm } from '@components/game/seat-update-form';
import { useGameSession } from '@hooks/use-game-session';
import { useGuestIdentity } from '@hooks/use-guest-identity';
import { resolveApiUrl } from '@services/games/games.api';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

interface GameRoomProps {
  gameId: string;
}

/**
 * Live game room: the visitor sees the table (free/occupied seats) before
 * committing to one — picking a free seat opens a form (name + camera photo)
 * that claims it. Once seated, the same identity can rename/re-photo their
 * seat at any time. The real table UI (rounds, actions) replaces the
 * remaining markup later; the seat lifecycle wiring stays.
 */
export const GameRoom: React.FC<GameRoomProps> = ({ gameId }) => {
  const { data: session, isSuccess } = useQuery(retrieveSessionOptions());
  const guest = useGuestIdentity();
  const [pickedSeat, setPickedSeat] = React.useState<Optional<number>>(
    undefined,
  );
  const [isEditingSeat, setIsEditingSeat] = React.useState(false);

  // Signed-in users join as themselves; anonymous visitors fall back to the
  // persisted guest identity — but only once the session query settled, so a
  // logged-in user is never mistakenly seated as a guest.
  const guestFallback = isSuccess && !session ? guest : undefined;
  const externalId = session?.user.uuid ?? guestFallback?.externalId;
  const defaultDisplayName =
    session?.user.displayName ?? session?.user.username ?? guestFallback?.displayName;
  const defaultPhotoUrl = session?.user.avatarUrl
    ? resolveApiUrl(session.user.avatarUrl)
    : undefined;

  const game = useGameSession({ gameId, externalId });

  if (game.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading game…
      </div>
    );
  }

  if (game.error || !game.snapshot) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {game.error?.message ?? 'Game not found'}
      </div>
    );
  }

  const mySeat = game.snapshot.participants.find(
    (p) => p.controller === externalId,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          Game <span className="font-mono">{game.snapshot.joinCode}</span>
        </h1>
        <span className="text-muted-foreground text-sm">
          {game.snapshot.status}
          {game.isConnected ? ' · live' : ' · connecting…'}
        </span>
      </header>

      {game.socketError && (
        <p className="text-destructive text-sm">{game.socketError}</p>
      )}

      <ul className="flex flex-col gap-2 text-sm">
        {game.snapshot.participants.map((participant) => {
          const isMine = participant.controller === externalId;
          const isFree = participant.controller === null;

          return (
            <li key={participant.id} className="flex items-center gap-3">
              <span className="w-6 text-right font-mono">
                #{participant.seatIndex}
              </span>
              <Avatar size="sm">
                {participant.photoUrl && (
                  <AvatarImage src={resolveApiUrl(participant.photoUrl)} alt="" />
                )}
                <AvatarFallback />
              </Avatar>
              <span className="font-medium">
                {isFree ? 'Free seat' : participant.displayName}
              </span>
              <span className="text-muted-foreground">
                {participant.role} · {participant.status} · {participant.balance}
              </span>
              {game.snapshot?.currentRound?.turn.activeParticipant ===
                participant.id && <span aria-label="active turn">🎯</span>}

              {isFree && !mySeat && game.isConnected && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setPickedSeat(participant.seatIndex)}
                >
                  Sit here
                </Button>
              )}
              {isMine && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setIsEditingSeat(true)}
                >
                  Edit
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {pickedSeat !== undefined && !mySeat && (
        <div className="bg-surface-2 rounded-lg p-4">
          <SeatJoinForm
            seatIndex={pickedSeat}
            defaultDisplayName={defaultDisplayName}
            defaultPhotoUrl={defaultPhotoUrl}
            onCancel={() => setPickedSeat(undefined)}
            onSubmit={async (data) => {
              await game.join({ seatIndex: pickedSeat, ...data });
              setPickedSeat(undefined);
            }}
          />
        </div>
      )}

      {isEditingSeat && mySeat && (
        <div className="bg-surface-2 rounded-lg p-4">
          <SeatUpdateForm
            seat={mySeat}
            onCancel={() => setIsEditingSeat(false)}
            onSubmit={async (data) => {
              await game.updateSeat(data);
              setIsEditingSeat(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
