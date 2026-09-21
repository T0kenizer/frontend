'use client';

import { Tabs, TabsList, TabsThumb, TabsTrigger } from '@components/ui/tabs';
import ROUTES from '@constants/routes';
import { useAuthMode } from '@hooks/use-auth-mode';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { cn } from '@lib/utils';
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
  const mode = useAuthMode();
  const searchParams = useSearchParams();
  const redirectUrl =
    sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM)) ?? undefined;

  return (
    <Tabs value={mode} className={cn('w-full', className)} {...props}>
      <TabsList variant="pill" aria-label="Authentication mode">
        <TabsThumb />
        <TabsTrigger value="signin" asChild>
          <Link href={ROUTES.auth.signIn(redirectUrl)}>Sign In</Link>
        </TabsTrigger>
        <TabsTrigger value="signup" asChild>
          <Link href={ROUTES.auth.signUp(redirectUrl)}>Sign Up</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
