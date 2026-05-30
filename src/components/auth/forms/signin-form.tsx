'use client';

import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { Input } from '@components/ui/input';
import { PasswordInput } from '@components/ui/input/password-input';
import ROUTES from '@constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSessionOptions } from '@services/sessions/sessions.options';
import { useMutation } from '@tanstack/react-query';
import { createSessionDataSchema } from '@tokenizer/shared/schemas';
import { CreateSessionData } from '@tokenizer/shared/types';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

export const SignInForm: React.FC = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(createSessionDataSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });
  const { mutate: createSession, isPending } = useMutation(
    createSessionOptions(),
  );

  const handleSubmit = (data: CreateSessionData) => {
    if (isPending) return;

    createSession(data, {
      onSuccess: () => {
        router.replace(ROUTES.home());
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="login"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signin-login">Email or Username</FieldLabel>
              <Input
                {...field}
                id="signin-login"
                autoComplete="username"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signin-password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="signin-password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          Sign In
        </Button>
      </FieldGroup>
    </form>
  );
};
