'use client';

import {
  FeltBackLink,
  FeltHeader,
  FeltNotice,
  FeltPanel,
  FeltStat,
} from '@components/game/felt/felt-stage';
import { SeatRow } from '@components/game/felt/seat-row';
import { Button } from '@components/ui/button';
import type { GameSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';

export interface JoinSeatStepProps {
  snapshot: GameSnapshot;
  onPickSeat: (seatIndex: number) => void;
  onBack: () => void;
}

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
    <FeltPanel>
      <FeltBackLink className="mb-4" onClick={onBack}>
        Another table
      </FeltBackLink>
      <FeltHeader
        className="mb-6"
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
        <dl className="shrink-0 text-right">
          <FeltStat label="Seats taken" value={`${taken}/${seats.length}`} />
        </dl>
      </div>

      <ul className="mb-4 flex max-h-67 flex-col gap-1.5 overflow-y-auto">
        {seats.map((seat) => {
          const isFree = !seat.claimed;
          const isPicked = picked === seat.seatIndex;

          return (
            <li key={seat.id}>
              <SeatRow
                seat={seat}
                state={isPicked ? 'picked' : isFree ? 'free' : 'taken'}
                caption={isPicked ? 'Your place' : undefined}
                disabled={!isFree}
                pressed={isPicked}
                onSelect={() => setPicked(seat.seatIndex)}
              />
            </li>
          );
        })}
      </ul>

      {isFull && (
        <FeltNotice tone="error" className="mb-4">
          Every seat is taken. Ask the host to free one up.
        </FeltNotice>
      )}

      <Button
        variant="felt-inverse"
        size="xl"
        disabled={picked === null}
        onClick={() => picked !== null && onPickSeat(picked)}
        className="w-full"
      >
        {picked === null ? 'Pick a place' : `Take seat ${picked + 1}`}
      </Button>
    </FeltPanel>
  );
};
