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
  applyDeletionOptions,
  validateDeletionTokenOptions,
} from '@services/account-deletions/account-deletions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Database, Link2Off, LogOut, Mail, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';

const CONSEQUENCES = [
  { icon: Database, key: 'data' },
  { icon: LogOut, key: 'signOut' },
] as const;

export interface DeleteAccountConfirmationProps {
  token: string;
}

/**
 * The last stop before an irreversible action. The emailed link proves who is
 * asking; this screen is there so the click is still a decision.
 */
export const DeleteAccountConfirmation: React.FC<
  DeleteAccountConfirmationProps
> = ({ token }) => {
  const t = useTranslations('Auth.deleteAccount');
  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    validateDeletionTokenOptions(token),
  );
  const {
    mutate: applyDeletion,
    isPending,
    isSuccess,
  } = useMutation(applyDeletionOptions());

  const handleConfirm = () => {
    if (isPending) return;

    applyDeletion(
      { token },
      { onError: (error) => toast.error(error.data.message) },
    );
  };

  if (isSuccess)
    return (
      <>
        <div className="space-y-5">
          <AuthSeal tone="success">
            <Check strokeWidth={2.8} />
          </AuthSeal>

          <AuthHeader
            title={t('done.title')}
            description={t('done.description')}
          />
        </div>

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.landing()}>{t('done.action')}</Link>
        </Button>
      </>
    );

  if (isLoading) return <AuthLoading label={t('loading')} />;

  if (error && error.status >= 500)
    return <AuthLoadError onRetry={refetch} isRetrying={isRefetching} />;

  if (error || !data)
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

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.settings.security()}>{t('invalid.action')}</Link>
        </Button>
      </>
    );

  return (
    <>
      <div className="space-y-5">
        <AuthSeal tone="danger">
          <Trash2 />
        </AuthSeal>

        <AuthHeader title={t('title')} description={t('description')} />

        <AuthMailbox>
          <Mail className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate">{data.email}</span>
        </AuthMailbox>

        <ul className="text-muted-foreground grid gap-2.5 text-xs leading-relaxed">
          {CONSEQUENCES.map(({ icon: Icon, key }) => (
            <li key={key} className="flex gap-2.5">
              <Icon className="mt-px size-3.5 shrink-0" />
              {t(`consequences.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <Button
          variant="danger"
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={handleConfirm}
          loading={isPending}
        >
          {t('confirm')}
        </Button>

        <Button
          variant="secondary"
          className="h-10 w-full"
          disabled={isPending}
          asChild
        >
          <Link href={ROUTES.settings.security()}>{t('cancel')}</Link>
        </Button>
      </div>
    </>
  );
};
