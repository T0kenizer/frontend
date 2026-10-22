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
import { requestDeletionOptions } from '@services/account-deletions/account-deletions.options';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export type DeleteAccountDialogProps = AlertDialogProps;

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  children,
  ...props
}) => {
  const t = useTranslations('Settings.security.deleteAccount');
  const [open, setOpen] = useState(false);
  const { mutate: requestDeletion, isPending } = useMutation(
    requestDeletionOptions(),
  );

  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isPending) return;

    requestDeletion(undefined, {
      onSuccess: () => {
        setOpen(false);
        toast.success(t('sent'));
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
            {t('dialogDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('cancel')}
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
