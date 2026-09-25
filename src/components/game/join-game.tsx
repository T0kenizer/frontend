'use client';

import { FeltPanel } from '@components/game/felt/felt-stage';
import { JoinIdentifyStep } from '@components/game/join/join-identify-step';
import { JoinIdentityStep } from '@components/game/join/join-identity-step';
import { JoinScannerStep } from '@components/game/join/join-scanner-step';
import {
  JoinSeatStep,
  type PickedSeat,
} from '@components/game/join/join-seat-step';
import { JoinStage } from '@components/game/join/join-stage';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useGameSession } from '@hooks/use-game-session';
import { usePlayerToken } from '@hooks/use-player-token';
import { joinByCodeOptions } from '@services/games/games.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';

export interface JoinGameProps {
  gameUuid?: string;
}

export const JoinGame: React.FC<JoinGameProps> = ({ gameUuid }) => {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [picked, setPicked] = useState<Nullable<PickedSeat>>(null);

  const token = usePlayerToken(gameUuid);
  const isSeated = gameUuid !== undefined && token !== null;

  useLayoutEffect(() => {
    if (isSeated && gameUuid) router.replace(ROUTES.game(gameUuid));
  }, [isSeated, gameUuid, router]);

  const { data: session, isSuccess } = useQuery(retrieveSessionOptions());

  const game = useGameSession({ gameId: gameUuid, enabled: isSuccess });
  const { mutateAsync: joinByCode } = useMutation(joinByCodeOptions());

  const goToTable = useCallback(
    (uuid: string) => router.push(ROUTES.game.join(uuid)),
    [router],
  );

  const handleSubmitCode = async (code: string) => {
    const { gameUuid: resolved } = await joinByCode(code);
    goToTable(resolved);
  };

  const handleScanned = useCallback(
    (uuid: string) => {
      setIsScanning(false);
      goToTable(uuid);
    },
    [goToTable],
  );

  if (isSeated) {
    return (
      <JoinStage step="seat">
        <FeltPanel className="flex items-center justify-center gap-2.5 py-12 text-sm">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Taking you to your table…
        </FeltPanel>
      </JoinStage>
    );
  }

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

  const step = picked === null ? 'seat' : 'identity';

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

  if (picked !== null) {
    return (
      <JoinStage step="identity">
        <JoinIdentityStep
          snapshot={snapshot}
          seatIndex={picked.seatIndex}
          isNewSeat={picked.kind === 'new'}
          defaultDisplayName={session?.user?.displayName}
          defaultAvatarUrl={session?.user?.avatarUrl}
          onBack={() => setPicked(null)}
          onSit={async ({ avatar, ...data }) => {
            await game.join(
              picked.kind === 'new'
                ? { openExtraSeat: true, ...data }
                : { seatIndex: picked.seatIndex, ...data },
            );
            if (avatar) {
              try {
                await game.setSeatAvatar(avatar);
              } catch {
                toast.error(
                  'You are seated, but the avatar did not go through',
                );
              }
            }
            router.push(ROUTES.game(snapshot.id));
          }}
        />
      </JoinStage>
    );
  }

  return (
    <JoinStage step="seat">
      <JoinSeatStep
        snapshot={snapshot}
        onPickSeat={setPicked}
        onBack={() => router.push(ROUTES.game.join())}
      />
    </JoinStage>
  );
};
