'use client';

import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { PasswordInput } from '@components/ui/input/password-input';
import ROUTES from '@constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateToken } from '@services/password-resets/password-resets.api';
import { applyResetOptions } from '@services/password-resets/password-resets.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { applyResetSchema } from '@tokenizer/shared/schemas';
import { ApplyResetData } from '@tokenizer/shared/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
}) => {
  const router = useRouter();

  const { isLoading, isError } = useQuery({
    queryKey: ['password-resets', 'validate', token],
    queryFn: () => validateToken(token),
    retry: false,
  });

  const form = useForm<ApplyResetData>({
    resolver: zodResolver(applyResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const { mutate: applyReset, isPending } = useMutation(applyResetOptions());

  const handleSubmit = (data: ApplyResetData) => {
    if (isPending) return;
    applyReset(
      { token, password: data.password },
      { onSuccess: () => router.replace(ROUTES.auth.signIn()) },
    );
  };

  if (isLoading) return null;

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          This link is invalid or has expired.
        </p>
        <p className="text-muted-foreground text-sm">
          Please request a new one.
        </p>
        <Link
          href={ROUTES.auth.forgotPassword()}
          className="text-primary text-sm hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-password">New password</FieldLabel>
              <PasswordInput
                {...field}
                id="reset-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-confirm-password">
                Confirm new password
              </FieldLabel>
              <PasswordInput
                {...field}
                id="reset-confirm-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          Reset password
        </Button>
      </FieldGroup>
    </form>
  );
};
