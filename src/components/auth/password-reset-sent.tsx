'use client';

import {
  AuthHeader,
  AuthMailbox,
  AuthSeal,
  AuthSteps,
} from '@components/auth/auth-layout';
import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import { PASSWORD_RESET_TTL_LABEL } from '@constants/password-resets';
import ROUTES from '@constants/routes';
import { requestResetOptions } from '@services/password-resets/password-resets.options';
import { useMutation } from '@tanstack/react-query';
import { Clock, Inbox, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Long enough to let a slow mail server deliver before we offer to try again. */
const RESEND_COOLDOWN_SECONDS = 30;

const TIPS = [
  { icon: Clock, text: `The link expires in ${PASSWORD_RESET_TTL_LABEL}.` },
  { icon: Inbox, text: 'Nothing after a minute? Look in your spam folder.' },
  {
    icon: Lock,
    text: 'Your current password keeps working until you set a new one.',
  },
] as const;

export interface PasswordResetSentProps {
  email: string;
  onChangeEmail: () => void;
}

/**
 * The wait between asking for a link and clicking it. There is nothing to do
 * here, which is exactly why the screen has to say how long the link lasts,
 * where to look for it and how to get back out — otherwise the flow reads as
 * having ended.
 *
 * Quoting the address back says nothing about whether an account exists for it,
 * which is why the heading stays conditional.
 */
export const PasswordResetSent: React.FC<PasswordResetSentProps> = ({
  email,
  onChangeEmail,
}) => {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const { mutate: requestReset, isPending } = useMutation(
    requestResetOptions(),
  );

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (isPending || cooldown > 0) return;

    // A resend replaces the previous token rather than adding one, so the worst
    // case is the older link going dead — no reason to surface a failure here.
    requestReset(
      { email },
      { onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS) },
    );
  };

  return (
    <>
      <AuthSteps current={2} total={3} label="Password reset" />

      <div className="space-y-5">
        <AuthSeal>
          <Mail />
        </AuthSeal>

        <AuthHeader
          title="Check your mail"
          description="If an account exists for this address, a link to choose a new password is on its way to:"
        />

        <AuthMailbox>
          <Mail className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate">{email}</span>
          <Button
            variant="ghost"
            size="xs"
            className="text-primary ml-auto"
            onClick={onChangeEmail}
          >
            Change
          </Button>
        </AuthMailbox>

        <ul className="text-muted-foreground grid gap-2.5 text-xs leading-relaxed">
          {TIPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-2.5">
              <Icon className="mt-px size-3.5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-5">
        <p className="text-muted-foreground text-center text-xs">
          Still nothing?{' '}
          <Button
            variant="link"
            size="xs"
            className="h-auto px-0 text-xs font-bold"
            onClick={handleResend}
            loading={isPending}
            disabled={isPending || cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend the link'}
          </Button>
        </p>

        <Separator />

        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href={ROUTES.auth.signIn()}>Back to sign in</Link>
        </Button>
      </div>
    </>
  );
};
