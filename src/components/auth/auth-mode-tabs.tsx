'use client';

import { useAuthMode } from '@components/auth/auth-mode-context';
import { Tabs, TabsList, TabsThumb, TabsTrigger } from '@components/ui/tabs';
import ROUTES from '@constants/routes';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export type AuthModeTabsProps = Omit<
  React.ComponentProps<typeof Tabs>,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
>;

export const AuthModeTabs: React.FC<AuthModeTabsProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Auth.modeTabs');
  const mode = useAuthMode();
  const searchParams = useSearchParams();
  const redirectUrl =
    sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM)) ?? undefined;

  return (
    <Tabs value={mode} className={cn('w-full', className)} {...props}>
      <TabsList variant="pill" aria-label={t('label')}>
        <TabsThumb />
        <TabsTrigger value="signin" asChild>
          <Link href={ROUTES.auth.signIn(redirectUrl)}>{t('signIn')}</Link>
        </TabsTrigger>
        <TabsTrigger value="signup" asChild>
          <Link href={ROUTES.auth.signUp(redirectUrl)}>{t('signUp')}</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
