'use client';

import { FeltPanel } from '@components/game/felt/felt-stage';
import { JoinIdentifyStep } from '@components/game/join/join-identify-step';
import { JoinIdentityStep } from '@components/game/join/join-identity-step';
import { JoinScannerStep } from '@components/game/join/join-scanner-step';
import { JoinSeatStep } from '@components/game/join/join-seat-step';
import { JoinStage } from '@components/game/join/join-stage';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useGameSession } from '@hooks/use-game-session';
import { joinByCodeOptions } from '@services/games/games.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface JoinGameProps {
  /**
   * The table to join, when the visitor already named one — a link, or a QR
   * they scanned somewhere other than this screen. Undefined means the flow
   * starts at the identification step.
   */
  gameUuid?: string;
}

/**
 * The whole way in, in three steps: identify the table, pick a seat, settle the
 * name on it.
 *
 * Four routes lead here and they converge immediately, which is the point:
 *
 * 1. A link carrying the uuid, which lands on the seat picker;
 * 2. A QR scanned by the phone's own camera app, which is that same link;
 * 3. The six digits read aloud, resolved to a uuid and then identical to (1);
 * 4. A QR scanned from inside this screen, where only the uuid is taken out of the
 *    payload — again identical to (1).
 *
 * So there is exactly one thing a room is identified by past this line, and it
 * is the session uuid. The code is spent the moment it resolves and is never
 * looked at again; the seat and the name are settled against the uuid alone.
 *
 * Resolving a code navigates rather than setting state, so the uuid ends up in
 * the URL: a visitor who reloads mid-flow — or hits back out of the camera —
 * returns to their table instead of to an empty code box.
 */
export const JoinGame: React.FC<JoinGameProps> = ({ gameUuid }) => {
  const router = useRouter();
  const [isScanning, setIsScanning] = React.useState(false);
  const [seatIndex, setSeatIndex] = React.useState<Nullable<number>>(null);

  // Who the player is stays a server decision: the join call reads the session
  // cookie if there is one. Gating on the query means a signed-in visitor is
  // never seated before their cookie could be read, which would seat them as a
  // guest.
  const { data: session, isSuccess } = useQuery(retrieveSessionOptions());
  const defaultDisplayName =
    session?.user.displayName ?? session?.user.username;

  const game = useGameSession({ gameId: gameUuid, enabled: isSuccess });
  const { mutateAsync: joinByCode } = useMutation(joinByCodeOptions());

  const goToTable = React.useCallback(
    (uuid: string) => router.push(ROUTES.game.join(uuid)),
    [router],
  );

  const handleSubmitCode = async (code: string) => {
    const { gameUuid: resolved } = await joinByCode(code);
    goToTable(resolved);
  };

  const handleScanned = React.useCallback(
    (uuid: string) => {
      setIsScanning(false);
      goToTable(uuid);
    },
    [goToTable],
  );

  /** Step one — no table named yet. */
  if (!gameUuid) {
    return (
      <JoinStage step="identify">
        {isScanning ? (
          <JoinScannerStep
            onScanned={handleScanned}
            onBack={() => setIsScanning(false)}
          />
        ) : (
          <JoinIdentifyStep
            onSubmitCode={handleSubmitCode}
            onOpenScanner={() => setIsScanning(true)}
          />
        )}
      </JoinStage>
    );
  }

  const step = seatIndex === null ? 'seat' : 'identity';

  if (game.isLoading || !isSuccess) {
    return (
      <JoinStage step={step}>
        <FeltPanel className="flex items-center justify-center gap-2.5 py-12 text-sm">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Looking up the table…
        </FeltPanel>
      </JoinStage>
    );
  }

  // A uuid that does not resolve is the same dead end whether it came from a
  // stale link or a QR for a table that has since closed, so it gets the one
  // way out that always works: name another table.
  if (game.error || !game.snapshot) {
    return (
      <JoinStage step={step}>
        <FeltPanel className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-sm font-semibold">
            {game.error?.message ?? 'That table is no longer available.'}
          </p>
          <Button
            variant="line"
            onClick={() => router.push(ROUTES.game.join())}
          >
            Enter a code instead
          </Button>
        </FeltPanel>
      </JoinStage>
    );
  }

  const snapshot = game.snapshot;

  /** Step three — a seat is picked, only the name is left. */
  if (seatIndex !== null) {
    return (
      <JoinStage step="identity">
        <JoinIdentityStep
          snapshot={snapshot}
          seatIndex={seatIndex}
          defaultDisplayName={defaultDisplayName}
          onBack={() => setSeatIndex(null)}
          onSit={async (data) => {
            await game.join({ seatIndex, ...data });
            router.push(ROUTES.game(snapshot.id));
          }}
        />
      </JoinStage>
    );
  }

  /** Step two — the table is known, the chair is not. */
  return (
    <JoinStage step="seat">
      <JoinSeatStep
        snapshot={snapshot}
        onPickSeat={setSeatIndex}
        onBack={() => router.push(ROUTES.game.join())}
      />
    </JoinStage>
  );
};
