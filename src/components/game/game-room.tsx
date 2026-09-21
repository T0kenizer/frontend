'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { SeatJoinForm } from '@components/game/seat-join-form';
import { SeatUpdateForm } from '@components/game/seat-update-form';
import { useGameSession } from '@hooks/use-game-session';
import { resolveApiUrl } from '@services/games/games.api';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

interface GameRoomProps {
  gameId: string;
}

/**
 * Live game room: the visitor sees the table (free/occupied seats) before
 * committing to one — picking a free seat opens a form that claims it and
 * issues this client's player token. Once seated, the token is what identifies
 * them, so a refresh lands back in the same chair. The real table UI (rounds,
 * actions) replaces the remaining markup later; the seat wiring stays.
 */
export const GameRoom: React.FC<GameRoomProps> = ({ gameId }) => {
  const { data: session, isSuccess } = useQuery(retrieveSessionOptions());
  const [pickedSeat, setPickedSeat] = React.useState<Optional<number>>(
    undefined,
  );
  const [isEditingSeat, setIsEditingSeat] = React.useState(false);

  // Who the player is stays a server decision: the join call reads the session
  // cookie if there is one. All the client contributes is a suggested name.
  const defaultDisplayName =
    session?.user.displayName ?? session?.user.username;

  // Gate on the session query so a signed-in player is never seated before
  // their cookie could be read, which would seat them as a guest.
  const game = useGameSession({ gameId, enabled: isSuccess });

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

  // The client recognises its own seat through the participant id its token
  // names — the snapshot no longer says who holds what, and deliberately so.
  const mySeat = game.mySeat;

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          {game.snapshot.name}{' '}
          {game.snapshot.joinCode && (
            <span className="font-mono">{game.snapshot.joinCode}</span>
          )}
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
          const isMine = participant.id === game.participantId;
          const isFree = !participant.claimed;

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
                {participant.claimed && !participant.connected && ' · away'}
              </span>
              {game.snapshot?.currentRound?.turn.activeParticipant ===
                participant.id && <span aria-label="active turn">🎯</span>}

              {isFree && !mySeat && (
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
