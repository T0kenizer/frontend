'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogProps,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { requestDeletionOptions } from '@services/account-deletions/account-deletions.options';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export type DeleteAccountDialogProps = AlertDialogProps;

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  children,
  ...props
}) => {
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
        toast.success(
          'Confirmation email sent — open the link it contains to finish deleting your account',
        );
      },
      onError: (error) => toast.error(error.data.message),
    });
  };

  return (
    <AlertDialog {...props} open={open} onOpenChange={setOpen}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible: your account and all associated data
            will be permanently deleted. To confirm, we will send a link to your
            email address — nothing is deleted until you open it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="danger"
            disabled={isPending}
            onClick={handleConfirm}
          >
            Send confirmation email
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
