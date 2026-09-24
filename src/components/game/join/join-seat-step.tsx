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
import { cn } from '@lib/utils';
import { GameMode, type GameSnapshot } from '@tokenizer/shared/types';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

export type PickedSeat =
  | { kind: 'existing'; seatIndex: number }
  | { kind: 'new'; seatIndex: number };

export interface JoinSeatStepProps {
  snapshot: GameSnapshot;
  onPickSeat: (seat: PickedSeat) => void;
  onBack: () => void;
}

export const JoinSeatStep: React.FC<JoinSeatStepProps> = ({
  snapshot,
  onPickSeat,
  onBack,
}) => {
  const [picked, setPicked] = useState<Nullable<PickedSeat>>(null);

  const seats = useMemo(
    () => [...snapshot.participants].sort((a, b) => a.seatIndex - b.seatIndex),
    [snapshot.participants],
  );
  const taken = seats.filter((seat) => seat.claimed).length;
  const isFull = taken === seats.length;

  const canPullUpAChair = isFull && snapshot.canAddSeat;
  const newSeatIndex = seats.length;

  const isMidDeal =
    snapshot.mode === GameMode.Poker
      ? snapshot.currentHand !== null
      : snapshot.currentRound !== null;

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
        description={
          canPullUpAChair
            ? 'Every seat is taken — pull up a chair of your own.'
            : 'Tap a free seat to sit down. Players already seated are dimmed.'
        }
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
          const isPicked =
            picked?.kind === 'existing' && picked.seatIndex === seat.seatIndex;

          return (
            <li key={seat.id}>
              <SeatRow
                seat={seat}
                state={isPicked ? 'picked' : isFree ? 'free' : 'taken'}
                caption={isPicked ? 'Your place' : undefined}
                disabled={!isFree}
                pressed={isPicked}
                onSelect={() =>
                  setPicked({ kind: 'existing', seatIndex: seat.seatIndex })
                }
              />
            </li>
          );
        })}

        {canPullUpAChair && (
          <li>
            <button
              type="button"
              aria-pressed={picked?.kind === 'new'}
              onClick={() =>
                setPicked({ kind: 'new', seatIndex: newSeatIndex })
              }
              className={cn(
                'border-on-media-hairline bg-on-media-scrim flex w-full items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 text-left transition-colors',
                picked?.kind === 'new'
                  ? 'border-warning bg-on-media-film border-solid'
                  : 'hover:bg-on-media-film',
              )}
            >
              <span className="border-on-media-hairline flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed">
                <Plus className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  Pull up a chair
                </span>
                <span className="text-on-media-muted-foreground block text-xs">
                  Seat {newSeatIndex + 1} · opened for you
                </span>
              </span>
            </button>
          </li>
        )}
      </ul>

      {isFull && !canPullUpAChair && (
        <FeltNotice tone="error" className="mb-4">
          {isMidDeal
            ? 'Every seat is taken. A chair can only be pulled up between deals — try again in a moment.'
            : 'Every seat is taken, and this table cannot grow any further.'}
        </FeltNotice>
      )}

      <Button
        variant="gold"
        size="xl"
        disabled={picked === null}
        onClick={() => picked && onPickSeat(picked)}
        className="w-full"
      >
        {picked === null
          ? 'Pick a seat'
          : picked.kind === 'new'
            ? `Pull up seat ${picked.seatIndex + 1}`
            : `Take seat ${picked.seatIndex + 1}`}
      </Button>
    </FeltPanel>
  );
};
