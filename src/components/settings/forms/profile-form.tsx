'use client';

import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { Input } from '@components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { partialUpdateUserOptions } from '@services/users/users.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userInputSchema } from '@tokenizer/shared/schemas';
import { PartialUpdateUserData } from '@tokenizer/shared/types';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = userInputSchema.pick({
  username: true,
  displayName: true,
  email: true,
});

type FormData = z.infer<typeof schema>;

export const ProfileForm: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      username: user?.username ?? '',
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
    },
    resetOptions: { keepDirtyValues: true },
  });
  const { mutate: partialUpdateUser, isPending } = useMutation(
    partialUpdateUserOptions(),
  );

  const handleSubmit = (data: FormData) => {
    if (isPending || !user) return;

    // Partial update: only the fields the user actually touched are sent.
    const { dirtyFields } = form.formState;
    const payload: PartialUpdateUserData = {};

    if (dirtyFields.username) payload.username = data.username;
    if (dirtyFields.displayName) payload.displayName = data.displayName;
    if (dirtyFields.email) payload.email = data.email;

    if (Object.keys(payload).length === 0) return;

    partialUpdateUser(
      { uuid: user.uuid, data: payload },
      {
        onSuccess: () => {
          toast.success(
            payload.email !== undefined
              ? 'Profile updated — check your inbox to confirm your new email address'
              : 'Profile updated',
          );
        },
        onError: (error) => applyServerError(form, error),
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-username">Username</FieldLabel>
              <Input
                {...field}
                id="profile-username"
                autoComplete="username"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="displayName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-display-name">
                Display name
              </FieldLabel>
              <Input
                {...field}
                id="profile-display-name"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                {...field}
                id="profile-email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          type="submit"
          disabled={isPending || !form.formState.isDirty}
          className="w-full"
        >
          Save changes
        </Button>
      </FieldGroup>
    </form>
  );
};
