'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  type AlertDialogProps,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { cancelSubscriptionOptions } from '@services/subscriptions/subscriptions.options';
import { useMutation } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export type CancelSubscriptionDialogProps = AlertDialogProps & {
  currentPeriodEnd: Date;
};

export const CancelSubscriptionDialog: React.FC<
  CancelSubscriptionDialogProps
> = ({ currentPeriodEnd, children, ...props }) => {
  const t = useTranslations('Settings.subscription.cancel');
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const { mutate: cancelSubscription, isPending } = useMutation(
    cancelSubscriptionOptions(),
  );

  const endDate = format.dateTime(currentPeriodEnd, { dateStyle: 'long' });

  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isPending) return;

    cancelSubscription(undefined, {
      onSuccess: () => {
        setOpen(false);
        toast.success(t('success', { date: endDate }));
      },
      onError: (error) => toast.error(error.data.message),
    });
  };

  return (
    <AlertDialog {...props} open={open} onOpenChange={setOpen}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogDescription', { date: endDate })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('keep')}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="danger"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
