'use client';

import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import {
  applyConfirmationOptions,
  validateConfirmationTokenOptions,
} from '@services/account-confirmations/account-confirmations.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export interface ConfirmAccountProps {
  token: string;
}

export const ConfirmAccount: React.FC<ConfirmAccountProps> = ({ token }) => {
  const { data, isLoading, isError } = useQuery(
    validateConfirmationTokenOptions(token),
  );
  const {
    mutate: applyConfirmation,
    isSuccess,
    error: applyError,
  } = useMutation(applyConfirmationOptions());
  const applied = useRef(false);

  useEffect(() => {
    if (!data || applied.current) return;

    applied.current = true;
    applyConfirmation({ token });
  }, [data, applyConfirmation, token]);

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">Your email address is confirmed.</p>
        <p className="text-muted-foreground text-sm">
          {data?.email} is now verified. You can start using your account.
        </p>
        <Button className="self-start" asChild>
          <Link href={ROUTES.dashboard()}>Go to the app</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) return null;

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          This link is invalid or has expired.
        </p>
        <p className="text-muted-foreground text-sm">
          Please request a new confirmation link.
        </p>
        <Link
          href={ROUTES.auth.resendConfirmation()}
          className="text-primary text-sm hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (applyError) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">
          We could not confirm your email address.
        </p>
        <p className="text-muted-foreground text-sm">
          {applyError.data.message}
        </p>
        <Link
          href={ROUTES.auth.resendConfirmation()}
          className="text-primary text-sm hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Confirming {data.email}&hellip;
    </p>
  );
};
