'use client';

import { FeltBadge } from '@components/game/felt/felt-stage';
import { Logo } from '@components/layout/logo';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { gameQrUrl } from '@services/games/games.api';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

/**
 * The strip over the felt: where you are, how to get others here, how to leave.
 *
 * The join code earns its place at the top of a live table rather than being
 * tucked into the lobby, because the commonest thing that happens at a real
 * table is somebody arriving late. It is printed large and the QR beside it is
 * the backend's own image — the same one the create screen shows — so a phone
 * pointed at a laptop lands on the seat picker.
 */

export interface TableTopBarProps {
  gameId: string;
  joinCode: Nullable<string>;
  tableName: string;
  isConnected: boolean;
  /**
   * The table has ended. A closed room has no connection to be waiting on, so
   * the badge says so instead of sitting on "Connecting…" forever once the
   * socket has left.
   */
  isOver?: boolean;
  className?: string;
}

export const TableTopBar: React.FC<TableTopBarProps> = ({
  gameId,
  joinCode,
  tableName,
  isConnected,
  isOver = false,
  className,
}) => (
  <header
    data-slot="table-top-bar"
    className={cn('flex shrink-0 items-center gap-3 px-4 py-3.5', className)}
  >
    <Logo className="shrink-0" />

    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold">{tableName}</span>
      <FeltBadge
        tone={isOver ? 'solid' : isConnected ? 'active' : 'muted'}
        className="mt-0.5"
      >
        {isOver ? 'Closed' : isConnected ? 'Live' : 'Connecting…'}
      </FeltBadge>
    </span>

    {joinCode && (
      <div className="border-on-media-hairline flex shrink-0 items-center gap-2.5 rounded-xl bg-black/35 px-3 py-2 md:flex-col md:gap-2 md:px-3 md:py-3">
        {/* The QR is a wide-screen affordance: the person scanning it is
            holding the other device, so it only has to exist where the table
            is the thing being looked at.

            A plain `<img>` on purpose, which is what `gameQrUrl` is built for:
            the backend serves this immutable behind its uuid with a year of
            `Cache-Control`, so routing it through the Next optimizer would add
            a hop and a second cache to re-derive a PNG that is already final. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gameQrUrl(gameId)}
          alt=""
          aria-hidden
          className="hidden size-24 rounded-lg bg-white p-1 md:block"
        />
        <span className="flex flex-col md:items-center">
          <span className="text-on-media-muted-foreground text-[0.6rem] font-bold tracking-[0.11em] whitespace-nowrap uppercase">
            Table code
          </span>
          <span className="text-sm font-extrabold tracking-[0.11em] tabular-nums">
            {joinCode}
          </span>
        </span>
      </div>
    )}

    <Button
      variant="line"
      size="icon"
      aria-label="Leave the table"
      title="Leave the table"
      className="shrink-0"
      asChild
    >
      <Link href={ROUTES.home()}>
        <LogOut />
      </Link>
    </Button>
  </header>
);
