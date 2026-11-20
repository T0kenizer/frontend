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
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const createSchema = (messages: { mismatch: string; termsRequired: string }) =>
  createUserDataSchema
    .extend({
      confirmPassword: createUserDataSchema.shape.password,
      acceptTerms: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.mismatch,
      path: ['confirmPassword'],
    })
    .refine((data) => data.acceptTerms, {
      message: messages.termsRequired,
      path: ['acceptTerms'],
    });

type FormData = z.infer<ReturnType<typeof createSchema>>;

export type SignUpFormProps = Omit<React.ComponentProps<'form'>, 'onSubmit'>;

export const SignUpForm: React.FC<SignUpFormProps> = ({ ...props }) => {
  const t = useTranslations('Auth.signUp');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM));
  const schema = useMemo(
    () =>
      createSchema({
        mismatch: t('mismatch'),
        termsRequired: t('termsRequired'),
      }),
    [t],
  );
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
  const { mutate: createUser, isPending: isCreatingUser } =
    useMutation(createUserOptions());
  const { mutate: createSession, isPending: isCreatingSession } = useMutation(
    createSessionOptions(),
  );
  const isPending = isCreatingUser || isCreatingSession;
  const [username, email, password, confirmPassword, acceptTerms] = useWatch({
    control: form.control,
    name: ['username', 'email', 'password', 'confirmPassword', 'acceptTerms'],
  });
  const isIncomplete =
    !username || !email || !password || !confirmPassword || !acceptTerms;

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
              onSuccess: () =>
                router.replace(redirectUrl ?? ROUTES.dashboard()),
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
              <FieldLabel htmlFor="signup-username">{t('username')}</FieldLabel>
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
              <FieldLabel htmlFor="signup-email">{t('email')}</FieldLabel>
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
              <FieldLabel htmlFor="signup-password">{t('password')}</FieldLabel>
              <PasswordInput
                {...field}
                id="signup-password"
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
              <FieldLabel htmlFor="signup-confirm-password">
                {t('confirmPassword')}
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
                  {t('acceptTerms')}
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
          {t('submit')}
        </Button>
      </FieldGroup>
    </form>
  );
};
