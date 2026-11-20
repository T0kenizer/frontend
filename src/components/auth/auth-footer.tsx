'use client';

import { type AuthMode, useAuthMode } from '@components/auth/auth-mode-context';
import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import { APP_NAME } from '@constants/index';
import ROUTES from '@constants/routes';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { cn } from '@lib/utils';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const COPY = {
  signin: {
    prompt: 'signIn.switchPrompt',
    label: 'signIn.switchAction',
    href: ROUTES.auth.signUp,
  },
  signup: {
    prompt: 'signUp.switchPrompt',
    label: 'signUp.switchAction',
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
  const t = useTranslations('Auth');
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
        {t(prompt)}{' '}
        <Link
          href={href(redirectUrl)}
          className="text-primary font-bold hover:underline"
        >
          {t(label)}
        </Link>
      </p>

      <Separator />

      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-xs">{t('guestJoin.prompt')}</p>
        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href="#">
            <Play />
            {t('guestJoin.action')}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground/80 text-center text-[0.6875rem] leading-relaxed">
        {t('securedBy', { appName: APP_NAME })}
      </p>
    </div>
  );
};
