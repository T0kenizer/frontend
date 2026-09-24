'use client';

import { PasswordInput } from '@components/inputs/password-input';
import { Button } from '@components/ui/button';
import { Checkbox } from '@components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import ROUTES from '@constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '@lib/form-errors';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { createSessionOptions } from '@services/sessions/sessions.options';
import { useMutation } from '@tanstack/react-query';
import { createSessionDataSchema } from '@tokenizer/shared/schemas';
import { CreateSessionData } from '@tokenizer/shared/types';
import { AtSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';

export type SignInFormProps = Omit<React.ComponentProps<'form'>, 'onSubmit'>;

export const SignInForm: React.FC<SignInFormProps> = ({ ...props }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM));
  const form = useForm({
    resolver: zodResolver(createSessionDataSchema),
    defaultValues: {
      login: '',
      password: '',
      stayConnected: false,
    },
  });
  const { mutate: createSession, isPending } = useMutation(
    createSessionOptions(),
  );

  const [login, password] = useWatch({
    control: form.control,
    name: ['login', 'password'],
  });
  const isIncomplete = !login || !password;

  const handleSubmit = (data: CreateSessionData) => {
    if (isPending) return;

    createSession(data, {
      onSuccess: () => {
        router.replace(redirectUrl ?? ROUTES.dashboard());
      },
      onError: (error) => applyServerError(form, error),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate {...props}>
      <FieldGroup>
        <Controller
          name="login"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signin-login">Email or username</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <AtSign />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="signin-login"
                  placeholder="you@example.com"
                  autoComplete="username"
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                <Link
                  href={ROUTES.auth.forgotPassword()}
                  className="text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                >
                  Forgot?
                </Link>
              </div>
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
        <Controller
          name="stayConnected"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="signin-stay-connected"
                name={field.name}
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldContent>
                <FieldLabel
                  htmlFor="signin-stay-connected"
                  className="text-muted-foreground text-xs leading-relaxed font-normal"
                >
                  Stay connected on this device.
                </FieldLabel>
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
          Sign in
        </Button>
      </FieldGroup>
    </form>
  );
};
