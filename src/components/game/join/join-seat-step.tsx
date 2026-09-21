'use client';

import {
  JoinBackButton,
  JoinHeader,
  JoinPanel,
} from '@components/game/join/join-stage';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { resolveApiUrl } from '@services/games/games.api';
import { ParticipantRole, type GameSnapshot } from '@tokenizer/shared/types';
import { CircleAlert } from 'lucide-react';
import * as React from 'react';

export interface JoinSeatStepProps {
  snapshot: GameSnapshot;
  onPickSeat: (seatIndex: number) => void;
  /** Back to the code screen — a different table, not a different seat. */
  onBack: () => void;
}

/**
 * Step two: which chair?
 *
 * Seats are declared once, when the host creates the table, so this screen only
 * ever offers what already exists — there is no way to add a chair from here,
 * and a full table says so rather than pretending otherwise.
 *
 * A claimed seat is shown rather than hidden: a visitor recognising the names
 * around it is how they know they are joining the right game, and it is the
 * only confirmation a scanned QR ever gives them.
 */
export const JoinSeatStep: React.FC<JoinSeatStepProps> = ({
  snapshot,
  onPickSeat,
  onBack,
}) => {
  const [picked, setPicked] = React.useState<Nullable<number>>(null);

  const seats = React.useMemo(
    () => [...snapshot.participants].sort((a, b) => a.seatIndex - b.seatIndex),
    [snapshot.participants],
  );
  const taken = seats.filter((seat) => seat.claimed).length;
  const isFull = taken === seats.length;

  return (
    <JoinPanel>
      <JoinBackButton onClick={onBack}>Another table</JoinBackButton>
      <JoinHeader
        eyebrow={
          snapshot.joinCode ? `Table ${snapshot.joinCode}` : snapshot.name
        }
        title="Pick your place"
        description="Tap a free seat to sit down. Players already seated are dimmed."
      />

      <div className="border-on-media-hairline mb-3 flex items-center gap-3.5 border-b pb-3.5">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">
            {snapshot.name}
          </span>
          <span className="text-on-media-muted-foreground block text-xs">
            {snapshot.status.toLowerCase()}
          </span>
        </span>
        <span className="text-on-media-muted-foreground shrink-0 text-right text-[0.65rem] font-bold tracking-[0.07em] uppercase">
          <b className="text-on-media-foreground block text-base tabular-nums">
            {taken}/{seats.length}
          </b>
          seats taken
        </span>
      </div>

      <ul className="mb-4 flex max-h-67 flex-col gap-1.5 overflow-y-auto">
        {seats.map((seat) => {
          const isFree = !seat.claimed;
          const isPicked = picked === seat.seatIndex;

          return (
            <li key={seat.id}>
              <button
                type="button"
                disabled={!isFree}
                aria-pressed={isPicked}
                onClick={() => setPicked(seat.seatIndex)}
                className={cn(
                  'border-on-media-hairline bg-on-media-scrim flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                  isFree
                    ? 'hover:bg-on-media-film hover:border-on-media-border cursor-pointer border-dashed'
                    : 'opacity-60',
                  isPicked &&
                    'border-warning bg-warning-soft ring-warning/20 border-solid ring-3',
                )}
              >
                <span className="text-on-media-muted-foreground w-5 shrink-0 text-center text-xs font-bold tabular-nums">
                  {seat.seatIndex + 1}
                </span>
                <Avatar size="sm">
                  {seat.photoUrl && (
                    <AvatarImage src={resolveApiUrl(seat.photoUrl)} alt="" />
                  )}
                  <AvatarFallback />
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {isFree ? 'Free seat' : seat.displayName}
                  </span>
                  <span className="text-on-media-muted-foreground block text-xs">
                    {isPicked
                      ? 'Your place'
                      : isFree
                        ? 'Waiting for a player'
                        : seat.connected
                          ? 'In play'
                          : 'Away'}
                  </span>
                </span>
                {seat.role === ParticipantRole.Host && (
                  <span className="bg-on-media-film shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-extrabold tracking-[0.06em] uppercase">
                    Host
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {isFull && (
        <p className="bg-destructive/15 border-destructive/35 mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed">
          <CircleAlert className="text-destructive mt-px size-3.5 shrink-0" />
          Every seat is taken. Ask the host to free one up.
        </p>
      )}

      <Button
        variant="felt-inverse"
        size="lg"
        disabled={picked === null}
        onClick={() => picked !== null && onPickSeat(picked)}
        className="h-11 w-full"
      >
        {picked === null ? 'Pick a place' : `Take seat ${picked + 1}`}
      </Button>
    </JoinPanel>
  );
};
