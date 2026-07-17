'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import ROUTES from '@constants/routes';
import { confirmDeletionOptions } from '@services/profile/profile.options';
import { SESSIONS_QUERY_KEYS } from '@services/sessions/sessions.options';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface DeleteAccountConfirmProps {
  token: string;
}

export const DeleteAccountConfirm: React.FC<DeleteAccountConfirmProps> = ({
  token,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: confirmDeletion, isPending } = useMutation(
    confirmDeletionOptions(),
  );

  const handleConfirm = () => {
    if (isPending) return;
    confirmDeletion(token, {
      onSuccess: () => {
        queryClient.setQueryData(SESSIONS_QUERY_KEYS.retrieve('current'), null);
        router.push(ROUTES.auth.signIn());
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Account Deletion</CardTitle>
          <CardDescription>
            This action is permanent and cannot be undone. All your data will be
            deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click the button below to permanently delete your account.
          </p>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.settings())}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            Delete permanently
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
