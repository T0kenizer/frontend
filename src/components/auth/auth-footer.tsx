'use client';

import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import ROUTES from '@constants/routes';
import { AuthMode, useAuthMode } from '@hooks/use-auth-mode';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { cn } from '@lib/utils';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const COPY = {
  signin: {
    prompt: 'No account yet?',
    label: 'Create an account',
    href: ROUTES.auth.signUp,
  },
  signup: {
    prompt: 'Already have an account?',
    label: 'Sign in',
    href: ROUTES.auth.signIn,
  },
} as const satisfies Record<
  AuthMode,
  { prompt: string; label: string; href: (redirectUrl?: string) => string }
>;

export type AuthFooterProps = Omit<React.ComponentProps<'div'>, 'children'>;

export const AuthFooter: React.FC<AuthFooterProps> = ({
  className,
  ...props
}) => {
  const mode = useAuthMode();
  const searchParams = useSearchParams();
  const redirectUrl =
    sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM)) ?? undefined;
  const { prompt, label, href } = COPY[mode];

  return (
    <div
      data-slot="auth-footer"
      className={cn('space-y-6', className)}
      {...props}
    >
      <p className="text-muted-foreground text-center text-xs">
        {prompt}{' '}
        <Link
          href={href(redirectUrl)}
          className="text-primary font-bold hover:underline"
        >
          {label}
        </Link>
      </p>

      <Separator />

      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-xs">
          Someone gave you a table code?
        </p>
        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href="#">
            <Play />
            Join without an account
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground/80 text-center text-[0.6875rem] leading-relaxed">
        Secured by Tokenizer. No payment details are ever required to play.
      </p>
    </div>
  );
};
