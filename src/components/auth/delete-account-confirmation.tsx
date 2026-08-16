'use client';

import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import {
  applyDeletionOptions,
  validateDeletionTokenOptions,
} from '@services/account-deletions/account-deletions.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface DeleteAccountConfirmationProps {
  token: string;
}

export const DeleteAccountConfirmation: React.FC<
  DeleteAccountConfirmationProps
> = ({ token }) => {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery(
    validateDeletionTokenOptions(token),
  );
  const { mutate: applyDeletion, isPending } = useMutation(
    applyDeletionOptions(),
  );

  const handleConfirm = () => {
    if (isPending) return;

    applyDeletion(
      { token },
      {
        onSuccess: () => {
          toast.success('Your account has been deleted');
          router.replace(ROUTES.home());
        },
        onError: (error) => toast.error(error.data.message),
      },
    );
  };

  if (isLoading) return null;

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          This link is invalid or has expired.
        </p>
        <p className="text-muted-foreground text-sm">
          You can request a new one from your security settings.
        </p>
        <Link
          href={ROUTES.settings.security()}
          className="text-primary text-sm hover:underline"
        >
          Go to security settings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">
        You are about to permanently delete the account associated with{' '}
        {data.email}.
      </p>
      <p className="text-muted-foreground text-sm">
        This action is irreversible: your account and all associated data will
        be permanently deleted, and you will be signed out.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={isPending} asChild>
          <Link href={ROUTES.settings.security()}>Cancel</Link>
        </Button>
        <Button variant="danger" disabled={isPending} onClick={handleConfirm}>
          Delete my account
        </Button>
      </div>
    </div>
  );
};
