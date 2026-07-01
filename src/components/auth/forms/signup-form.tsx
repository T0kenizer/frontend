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
import { createUserOptions } from '@services/users/users.options';
import { useMutation } from '@tanstack/react-query';
import { createUserDataSchema } from '@tokenizer/shared/schemas';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = createUserDataSchema
  .extend({
    confirmPassword: createUserDataSchema.shape.password,
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  })
  .refine((data) => data.acceptTerms, {
    message: 'You must accept the terms and conditions',
  });

type FormData = z.infer<typeof schema>;

export const SignUpForm: React.FC = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });
  const { mutate: createUser, isPending: isCreatingUser } =
    useMutation(createUserOptions());
  const { mutate: createSession, isPending: isCreatingSession } = useMutation(
    createSessionOptions(),
  );
  const isPending = isCreatingUser || isCreatingSession;

  const handleSubmit = (data: FormData) => {
    if (isPending) return;

    createUser(
      {
        username: data.username,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          createSession(
            { login: data.email, password: data.password },
            { onSuccess: () => router.replace(ROUTES.home()) },
          );
        },
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
              <FieldLabel htmlFor="signup-username">Username</FieldLabel>
              <Input
                {...field}
                id="signup-username"
                autoComplete="username"
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
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                {...field}
                id="signup-email"
                autoComplete="email"
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
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="signup-password"
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
              <FieldLabel htmlFor="signup-confirm-password">
                Confirm Password
              </FieldLabel>
              <PasswordInput
                {...field}
                id="signup-confirm-password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          Sign Up
        </Button> 
      </FieldGroup>
    </form>
  );
};
