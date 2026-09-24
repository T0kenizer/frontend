'use client';

import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { cn } from '@lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const GoogleMark: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
    <path
      fill="#4285F4"
      d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"
    />
    <path
      fill="#34A853"
      d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.6 23.5 12 23.5z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z"
    />
    <path
      fill="#EA4335"
      d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.9 15.1.8 12 .8 7.6.8 3.7 3.3 1.8 6.9l3.8 3c.9-2.8 3.4-4.7 6.4-4.7z"
    />
  </svg>
);

export type GoogleAuthButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'asChild' | 'variant' | 'children'
> & {
  children?: React.ReactNode;
};

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  className,
  children = 'Continue with Google',
  ...props
}) => {
  const searchParams = useSearchParams();
  const redirectUrl =
    sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM)) ?? undefined;

  return (
    <Button
      variant="secondary"
      className={cn('h-10 w-full', className)}
      asChild
      {...props}
    >
      <Link href={ROUTES.auth.googleOAuth(redirectUrl ?? ROUTES.dashboard())}>
        <GoogleMark />
        {children}
      </Link>
    </Button>
  );
};
