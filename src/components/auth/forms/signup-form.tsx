'use client';

import { EmailInput } from '@components/inputs/email-input';
import { PasswordInput } from '@components/inputs/password-input';
import { UsernameInput } from '@components/inputs/username-input';
import { PasswordStrength } from '@components/password-strength';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import ROUTES from '@constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { createSessionOptions } from '@services/sessions/sessions.options';
import { createUserOptions } from '@services/users/users.options';
import { useMutation } from '@tanstack/react-query';
import { createUserDataSchema } from '@tokenizer/shared/schemas';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const schema = createUserDataSchema
  .extend({
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.acceptTerms, {
    message: 'You must accept the terms to create an account',
    path: ['acceptTerms'],
  });

type FormData = z.infer<typeof schema>;

export type SignUpFormProps = Omit<React.ComponentProps<'form'>, 'onSubmit'>;

export const SignUpForm: React.FC<SignUpFormProps> = ({ ...props }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM));
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });
  const { mutate: createUser, isPending: isCreatingUser } =
    useMutation(createUserOptions());
  const { mutate: createSession, isPending: isCreatingSession } = useMutation(
    createSessionOptions(),
  );
  const isPending = isCreatingUser || isCreatingSession;
  // The terms box counts as a field: unticked, there is nothing to send.
  const [username, email, password, acceptTerms] = useWatch({
    control: form.control,
    name: ['username', 'email', 'password', 'acceptTerms'],
  });
  const isIncomplete = !username || !email || !password || !acceptTerms;

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
            {
              onSuccess: () => router.replace(redirectUrl ?? ROUTES.home()),
              onError: (error) => applyServerError(form, error),
            },
          );
        },
        onError: (error) => applyServerError(form, error),
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate {...props}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-username">Username</FieldLabel>
              <UsernameInput
                {...field}
                id="signup-username"
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
              <EmailInput
                {...field}
                id="signup-email"
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
              <PasswordStrength value={password} meterOnly />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="signup-terms"
                name={field.name}
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel
                  htmlFor="signup-terms"
                  className="text-muted-foreground text-xs leading-relaxed font-normal"
                >
                  I accept the terms of service and the privacy policy.
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
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
          Create my account
        </Button>
      </FieldGroup>
    </form>
  );
};
