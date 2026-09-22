'use client';

import {
  FeltBadge,
  FeltHeader,
  FeltNotice,
  FeltPanel,
  FeltStage,
  FeltStat,
  FeltStatGroup,
} from '@components/game/felt/felt-stage';
import { SeatRow } from '@components/game/felt/seat-row';
import { SeatNameForm } from '@components/game/seat-name-form';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useGameSession } from '@hooks/use-game-session';
import { formatAmount } from '@lib/amount';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import type { ParticipantSnapshot } from '@tokenizer/shared/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface GameRoomProps {
  gameId: string;
}

/** The shell every state of the room shares, so they do not each invent one. */
const RoomShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <FeltStage variant="table" className="justify-center">
    {children}
  </FeltStage>
);

/**
 * Live game room: the visitor sees the table (free/occupied seats) before
 * committing to one — picking a free seat opens a form that claims it and
 * issues this client's player token. Once seated, the token is what identifies
 * them, so a refresh lands back in the same chair. The real table UI (rounds,
 * actions) replaces the remaining markup later; the seat wiring stays.
 *
 * Everything on screen comes from the felt kit the create and join screens are
 * built from. This screen used to be painted in hub tokens — `bg-surface-2`,
 * `text-muted-foreground` — over a backdrop that has no theme, so a player
 * arriving here from the join flow crossed a visible seam into what looked like
 * a different product.
 */
export const GameRoom: React.FC<GameRoomProps> = ({ gameId }) => {
  const { data: session, isSuccess } = useQuery(retrieveSessionOptions());
  const [pickedSeat, setPickedSeat] =
    React.useState<Optional<number>>(undefined);
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
      <RoomShell>
        <FeltPanel className="flex items-center justify-center gap-2.5 py-12 text-sm">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Dealing you in…
        </FeltPanel>
      </RoomShell>
    );
  }

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

  const { snapshot } = game;

  // The client recognises its own seat through the participant id its token
  // names — the snapshot no longer says who holds what, and deliberately so.
  const mySeat = game.mySeat;
  const activeParticipant = snapshot.currentRound?.turn.activeParticipant;

  const seats = [...snapshot.participants].sort(
    (a, b) => a.seatIndex - b.seatIndex,
  );
  const taken = seats.filter((seat) => seat.claimed).length;
  const inPlay = seats.reduce((total, seat) => total + seat.balance, 0);

  const seatState = (seat: ParticipantSnapshot) => {
    if (seat.id === game.participantId) return 'mine' as const;
    return seat.claimed ? ('taken' as const) : ('free' as const);
  };

  return (
    <FeltStage variant="table">
      <FeltHeader
        eyebrow={
          snapshot.joinCode ? `Table ${snapshot.joinCode}` : 'At the table'
        }
        title={snapshot.name}
      >
        <div className="flex flex-wrap items-center gap-2">
          <FeltBadge tone={game.isConnected ? 'active' : 'muted'}>
            {game.isConnected ? 'Live' : 'Connecting…'}
          </FeltBadge>
          <FeltBadge tone="muted">{snapshot.status.toLowerCase()}</FeltBadge>
        </div>
      </FeltHeader>

      {game.socketError && (
        <FeltNotice tone="error">{game.socketError}</FeltNotice>
      )}

      <FeltPanel size="sm" className="shrink-0">
        <FeltStatGroup>
          <FeltStat label="Seats" value={`${taken}/${seats.length}`} />
          <FeltStat label="In play" value={formatAmount(inPlay)} />
          <FeltStat
            label="Your stack"
            value={mySeat ? formatAmount(mySeat.balance) : '—'}
          />
        </FeltStatGroup>
      </FeltPanel>

      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {seats.map((seat) => {
          const isMine = seat.id === game.participantId;
          const isFree = !seat.claimed;

          return (
            <li key={seat.id}>
              <SeatRow
                seat={seat}
                state={seatState(seat)}
                isActive={activeParticipant === seat.id}
                caption={
                  isFree
                    ? 'Waiting for a player'
                    : `${formatAmount(seat.balance)} · ${seat.status.toLowerCase()}${
                        seat.connected ? '' : ' · away'
                      }`
                }
              >
                {isFree && !mySeat && (
                  <Button
                    size="xs"
                    variant="line"
                    onClick={() => setPickedSeat(seat.seatIndex)}
                  >
                    Sit here
                  </Button>
                )}
                {isMine && (
                  <Button
                    size="xs"
                    variant="line"
                    onClick={() => setIsEditingSeat(true)}
                  >
                    Rename
                  </Button>
                )}
              </SeatRow>
            </li>
          );
        })}
      </ul>

      {pickedSeat !== undefined && !mySeat && (
        <FeltPanel size="sm" className="shrink-0">
          <SeatNameForm
            mode="claim"
            seatIndex={pickedSeat}
            defaultDisplayName={defaultDisplayName}
            onCancel={() => setPickedSeat(undefined)}
            onSubmit={async (data) => {
              await game.join({ seatIndex: pickedSeat, ...data });
              setPickedSeat(undefined);
            }}
          />
        </FeltPanel>
      )}

      {isEditingSeat && mySeat && (
        <FeltPanel size="sm" className="shrink-0">
          <SeatNameForm
            mode="rename"
            defaultDisplayName={mySeat.displayName}
            onCancel={() => setIsEditingSeat(false)}
            onSubmit={async (data) => {
              await game.updateSeat(data);
              setIsEditingSeat(false);
            }}
          />
        </FeltPanel>
      )}
    </FeltStage>
  );
};
