'use client';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { requestConfirmationOptions } from '@services/account-confirmations/account-confirmations.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/** Renders nothing once the address is confirmed. */
export const EmailConfirmationNotice: React.FC = () => {
  const t = useTranslations('Settings.profile.emailConfirmation');
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;
  const { mutate: requestConfirmation, isPending } = useMutation(
    requestConfirmationOptions(),
  );

  const handleResend = () => {
    if (isPending || !user) return;

    requestConfirmation(
      { email: user.email },
      {
        onSuccess: () => toast.success(t('sent')),
        onError: (error) => toast.error(error.data.message),
      },
    );
  };

  if (!user || user.confirmedAt) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge variant="warning">
        <Clock aria-hidden />
        {t('pending')}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={isPending}
        onClick={handleResend}
      >
        {t('resend')}
      </Button>
    </div>
  );
};
