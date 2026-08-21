'use client';

import { Button } from '@components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import ROUTES from '@constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinByCodeOptions } from '@services/games/games.options';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const joinGameDataSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Enter the 6-character code')
    .transform((value) => value.toUpperCase()),
});

type JoinGameData = z.infer<typeof joinGameDataSchema>;

/** Resolves a shared 6-character join code and lands on the room. */
export const JoinGame: React.FC = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(joinGameDataSchema),
    defaultValues: { code: '' },
  });

  const { mutate: joinByCode, isPending } = useMutation(joinByCodeOptions());

  const handleSubmit = (data: JoinGameData) => {
    if (isPending) return;

    joinByCode(data.code, {
      onSuccess: (snapshot) => router.push(ROUTES.game(snapshot.id)),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-lg font-semibold">Join a game</h1>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full max-w-xs"
      >
        <FieldGroup>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="join-code">Game code</FieldLabel>
                <Input
                  {...field}
                  id="join-code"
                  placeholder="ABC123"
                  autoComplete="off"
                  autoCapitalize="characters"
                  maxLength={6}
                  className="text-center font-mono tracking-widest uppercase"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Joining…' : 'Join'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};
