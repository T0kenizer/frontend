'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { requestDeletionOptions } from '@services/profile/profile.options';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export const DeleteAccountSection: React.FC = () => {
  const [requested, setRequested] = useState(false);
  const { mutate: requestDeletion, isPending } = useMutation(
    requestDeletionOptions(),
  );

  const handleClick = () => {
    if (isPending) return;
    requestDeletion(undefined, {
      onSuccess: () => setRequested(true),
    });
  };

  if (requested) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            A confirmation email has been sent. Check your inbox to confirm
            account deletion.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-4">
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={handleClick}
        >
          Delete my account
        </Button>
      </CardContent>
    </Card>
  );
};
