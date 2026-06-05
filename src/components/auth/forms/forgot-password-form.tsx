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
import { requestResetOptions } from '@services/password-resets/password-resets.options';
import { useMutation } from '@tanstack/react-query';
import { requestResetSchema } from '@tokenizer/shared/schemas';
import { RequestResetData } from '@tokenizer/shared/types';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export const ForgotPasswordForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });
  const { mutate: requestReset, isPending } = useMutation(requestResetOptions());

  const handleSubmit = (data: RequestResetData) => {
    if (isPending) return;
    requestReset(data, { onSettled: () => setSubmitted(true) });
  };

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for this email, you will receive a password reset
        link shortly.
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          Send reset link
        </Button>
      </FieldGroup>
    </form>
  );
};
