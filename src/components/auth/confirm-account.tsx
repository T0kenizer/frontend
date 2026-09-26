'use client';

import {
  AuthHeader,
  AuthLoadError,
  AuthLoading,
  AuthMailbox,
  AuthSeal,
} from '@components/auth/auth-layout';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import {
  applyConfirmationOptions,
  requestConfirmationOptions,
  validateConfirmationTokenOptions,
} from '@services/account-confirmations/account-confirmations.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Inbox, Link2Off, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface ConfirmAccountProps {
  token: string;
}

/**
 * Lands from the confirmation email and spends the token on its own — there is
 * nothing to ask the user, so the only screens are the wait and the outcome.
 */
export const ConfirmAccount: React.FC<ConfirmAccountProps> = ({ token }) => {
  const t = useTranslations('Auth.confirmAccount');
  const { data: session } = useQuery(retrieveSessionOptions());
  const {
    data,
    isLoading,
    error: validateError,
    refetch,
    isRefetching,
  } = useQuery(validateConfirmationTokenOptions(token));
  const {
    mutate: applyConfirmation,
    isSuccess,
    isPending: isApplying,
    error: applyError,
  } = useMutation(applyConfirmationOptions());
  const {
    mutate: requestConfirmation,
    isPending: isRequesting,
    isSuccess: isRequested,
  } = useMutation(requestConfirmationOptions());
  const applied = useRef(false);

  const user = session?.user;

  useEffect(() => {
    if (!data || applied.current) return;

    applied.current = true;
    applyConfirmation({ token });
  }, [data, applyConfirmation, token]);

  const handleResend = () => {
    if (isRequesting || !user) return;

    requestConfirmation(
      { email: user.email },
      { onError: (error) => toast.error(error.data.message) },
    );
  };

  const error = validateError ?? applyError;

  // A spent link opened again by someone already confirmed is not a failure.
  if (isSuccess || (error && user?.confirmedAt))
    return (
      <>
        <div className="space-y-5">
          <AuthSeal tone="success">
            <Check strokeWidth={2.8} />
          </AuthSeal>

          <AuthHeader
            title={t('done.title')}
            description={t('done.description', {
              email: data?.email ?? user?.email ?? '',
            })}
          />
        </div>

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.dashboard()}>{t('done.action')}</Link>
        </Button>
      </>
    );

  if (isRequested && user)
    return (
      <>
        <div className="space-y-5">
          <AuthSeal>
            <Mail />
          </AuthSeal>

          <AuthHeader
            title={t('sent.title')}
            description={t('sent.description')}
          />

          <AuthMailbox>
            <Mail className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </AuthMailbox>

          <p className="text-muted-foreground flex gap-2.5 text-xs leading-relaxed">
            <Inbox className="mt-px size-3.5 shrink-0" />
            {t('sent.spam')}
          </p>
        </div>

        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href={ROUTES.dashboard()}>{t('backToDashboard')}</Link>
        </Button>
      </>
    );

  if (isLoading || isApplying || (data && !error))
    return <AuthLoading label={t('loading')} />;

  if (error && error.status >= 500)
    return (
      <AuthLoadError
        onRetry={() =>
          validateError ? refetch() : applyConfirmation({ token })
        }
        isRetrying={isRefetching || isApplying}
      />
    );

  return (
    <>
      <div className="space-y-5">
        <AuthSeal tone="danger">
          <Link2Off />
        </AuthSeal>

        <AuthHeader
          title={t('invalid.title')}
          description={t('invalid.description')}
        />
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={handleResend}
          loading={isRequesting}
          disabled={isRequesting || !user}
        >
          {t('invalid.action')}
        </Button>

        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href={ROUTES.dashboard()}>{t('backToDashboard')}</Link>
        </Button>
      </div>
    </>
  );
};
