'use client';

import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { createGameOptions } from '@services/games/games.options';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Scaffold of the game creation screen: creates a session with the server
 * default preset and lands on its room. A config form (seats, blinds, action
 * catalog…) replaces the single button later.
 */
export const CreateGame: React.FC = () => {
  const router = useRouter();

  const { mutate: createGame, isPending } = useMutation(createGameOptions());

  const handleCreate = () =>
    createGame(
      {},
      {
        // Creating a game seats the owner, so the result is a join result:
        // the token is stored by the mutation, the uuid is the route.
        onSuccess: (result) => router.push(ROUTES.game(result.snapshot.id)),
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-lg font-semibold">New game</h1>
      <Button onClick={handleCreate} disabled={isPending}>
        {isPending ? 'Creating…' : 'Create a game'}
      </Button>
    </div>
  );
};
