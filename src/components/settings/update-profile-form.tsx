'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardFooter } from '@components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { Input } from '@components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileOptions } from '@services/profile/profile.options';
import { useMutation } from '@tanstack/react-query';
import { updateProfileSchema } from '@tokenizer/shared/schemas';
import { SerializedUser } from '@tokenizer/shared/types';
import { Controller, useForm } from 'react-hook-form';
import { ProfileAvatar } from './profile-avatar';

interface UpdateProfileFormProps {
  user: SerializedUser;
}

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({
  user,
}) => {
  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username ?? '',
      displayName: user.displayName ?? '',
      email: user.email ?? '',
    },
  });
  const { mutate: updateProfile, isPending } = useMutation(
    updateProfileOptions(),
  );

  const handleSubmit = (data: {
    username?: string;
    displayName?: string | null;
    email?: string;
  }) => {
    if (isPending) return;
    updateProfile(data);
  };

  return (
    <Card>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="mb-4">
          <ProfileAvatar src={user.avatarUrl} displayName={user.displayName} />
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-username">Username</FieldLabel>
                  <Input
                    {...field}
                    id="settings-username"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="displayName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-displayName">
                    Display Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="settings-displayName"
                    value={field.value ?? ''}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="settings-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
