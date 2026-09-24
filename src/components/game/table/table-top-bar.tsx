'use client';

import { FeltBadge } from '@components/game/felt/felt-stage';
import { Logo } from '@components/layout/logo';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useHomeRoute } from '@hooks/use-home-route';
import { cn } from '@lib/utils';
import { gameQrUrl } from '@services/games/games.api';
import { LogOut, Monitor } from 'lucide-react';
import Link from 'next/link';

export interface TableTopBarProps {
  gameId: string;
  joinCode: Nullable<string>;
  tableName: string;
  isConnected: boolean;
  isOver?: boolean;
  spectatorMode?: boolean;
  className?: string;
}

export const TableTopBar: React.FC<TableTopBarProps> = ({
  gameId,
  joinCode,
  tableName,
  isConnected,
  isOver = false,
  spectatorMode = false,
  className,
}) => {
  const homeRoute = useHomeRoute();

  return (
    <header
      data-slot="table-top-bar"
      className={cn(
        'flex shrink-0 items-start justify-between gap-3 px-4 py-3.5',
        className,
      )}
    >
      {/* A fixed-height row, so the spectator's taller code card grows the bar
          downwards without moving the logo or the name. */}
      <div className="flex h-13 min-w-0 flex-1 items-center gap-3">
        <Logo href={homeRoute} className="shrink-0" />

        <span
          className={cn(
            'min-w-0 flex-1',
            spectatorMode ? 'block' : 'hidden md:block',
          )}
        >
          <span className="block truncate text-sm font-bold">{tableName}</span>
          {!isConnected ? (
            <FeltBadge tone={isOver ? 'solid' : 'muted'} className="mt-0.5">
              {isOver ? 'Closed' : 'Connecting…'}
            </FeltBadge>
          ) : null}
        </span>
      </div>

      <div className="flex min-h-13 shrink-0 flex-row items-center gap-3">
        {joinCode && (
          <div
            className={cn(
              'border-on-media-hairline flex shrink-0 items-center gap-2.5 rounded-xl bg-black/35 px-3 py-2',
              spectatorMode && 'flex-col gap-2 py-3',
            )}
          >
            {spectatorMode && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={gameQrUrl(gameId)}
                alt=""
                aria-hidden
                className="size-24 rounded-lg bg-white p-1"
              />
            )}
            <span
              className={cn('flex flex-col', spectatorMode && 'items-center')}
            >
              <span className="text-on-media-muted-foreground text-[0.6rem] font-bold tracking-[0.11em] whitespace-nowrap uppercase">
                Table code
              </span>
              <span className="text-sm font-extrabold tracking-[0.11em] tabular-nums">
                {joinCode}
              </span>
            </span>
          </div>
        )}
        {!spectatorMode && (
          <>
            <Button
              variant="line"
              size="icon"
              aria-label="Open the spectator view"
              title="Open the spectator view"
              className="hidden shrink-0 md:flex"
              asChild
            >
              <Link href={ROUTES.game.spectator(gameId)} target="_blank">
                <Monitor />
              </Link>
            </Button>
            <Button
              variant="line"
              size="icon"
              aria-label="Leave the table"
              title="Leave the table"
              className="shrink-0"
              asChild
            >
              <Link href={homeRoute}>
                <LogOut />
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
