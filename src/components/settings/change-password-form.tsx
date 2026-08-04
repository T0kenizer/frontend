'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { PasswordInput } from '@components/ui/input/password-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordOptions } from '@services/profile/profile.options';
import { useMutation } from '@tanstack/react-query';
import { changePasswordSchema } from '@tokenizer/shared/schemas';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = changePasswordSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

interface ChangePasswordFormProps {
  hasPassword: boolean;
  hasGoogleId: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  hasPassword,
  hasGoogleId,
}) => {
  const [success, setSuccess] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: hasPassword ? '' : undefined,
      newPassword: '',
      confirmPassword: '',
    },
  });
  const { mutate: changePassword, isPending } = useMutation(
    changePasswordOptions(),
  );

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (isPending) return;

    const { confirmPassword: _, ...rest } = data;
    const payload = hasPassword ? rest : { newPassword: rest.newPassword };

    changePassword(payload, {
      onSuccess: () => {
        form.reset();
        setSuccess(true);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {hasPassword ? 'Change password' : 'Set a password'}
        </CardTitle>
        {!hasPassword && hasGoogleId && (
          <CardDescription>
            Your account uses Google sign-in. Set a password to also sign in
            with email.
          </CardDescription>
        )}
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="mb-4">
          <FieldGroup>
            {hasPassword && (
              <Controller
                name="currentPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-current-password">
                      Current Password
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id="settings-current-password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-new-password">
                    New Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="settings-new-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="settings-confirm-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          {success && (
            <p className="text-muted-foreground mt-2 text-sm">
              Password updated successfully.
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {hasPassword ? 'Update password' : 'Set password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
