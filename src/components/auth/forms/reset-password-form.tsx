'use client';

import { PasswordInput } from '@components/inputs/password-input';
import { PasswordStrength } from '@components/password-strength';
import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { applyResetOptions } from '@services/password-resets/password-resets.options';
import { useMutation } from '@tanstack/react-query';
import { applyResetDataSchema } from '@tokenizer/shared/schemas';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const schema = applyResetDataSchema
  .extend({
    confirmPassword: applyResetDataSchema.shape.password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export type ResetPasswordFormProps = Omit<
  React.ComponentProps<'form'>,
  'onSubmit'
> & {
  token: string;
  onReset: () => void;
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onReset,
  ...props
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const { mutate: applyReset, isPending } = useMutation(applyResetOptions());
  const [password, confirmPassword] = useWatch({
    control: form.control,
    name: ['password', 'confirmPassword'],
  });
  const isIncomplete = !password || !confirmPassword;

  const handleSubmit = (data: FormData) => {
    if (isPending) return;

    applyReset(
      { token, password: data.password },
      {
        onSuccess: onReset,
        onError: (error) => applyServerError(form, error),
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate {...props}>
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
                placeholder="••••••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              <PasswordStrength value={password} />
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
                placeholder="••••••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          type="submit"
          size="lg"
          loading={isPending}
          disabled={isPending || isIncomplete}
          className="mt-1 h-11 w-full text-[0.9375rem]"
        >
          Reset password
        </Button>
      </FieldGroup>
    </form>
  );
};
