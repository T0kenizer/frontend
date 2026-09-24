'use client';

import { Logo } from '@components/layout/logo';
import { Button } from '@components/ui/button';
import { LandingSection } from '@constants/landing';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

const LINKS = [
  { label: 'How it works', href: ROUTES.landing(LandingSection.HowItWorks) },
  { label: 'On the TV', href: ROUTES.landing(LandingSection.Tv) },
  { label: 'On your phone', href: ROUTES.landing(LandingSection.Phone) },
] as const;

export type PublicNavbarProps = Omit<
  React.ComponentProps<'nav'>,
  'children'
> & {
  scrolled?: boolean;
};

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  className,
  scrolled,
  ...props
}) => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return (
    <nav
      data-slot="navbar"
      data-scrolled={scrolled || undefined}
      className={cn(
        'text-on-media-foreground relative w-full transition-colors duration-200',
        'group-data-scrolled/header:bg-felt-deep/85 group-data-scrolled/header:backdrop-blur-md',
        'data-scrolled:bg-felt-deep/85 data-scrolled:backdrop-blur-md',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-5 py-4 sm:px-8">
        <Logo />
        <div className="hidden gap-5 lg:flex">
          {LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-on-media-muted-foreground hover:text-on-media-foreground text-sm font-semibold transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {session?.user ? (
            <Button size="lg" variant="felt-inverse" asChild>
              <Link href={ROUTES.dashboard()}>
                <LayoutDashboard />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="link"
                className="text-on-media-foreground hidden sm:inline-flex"
                asChild
              >
                <Link href={ROUTES.auth.signIn()}>Sign in</Link>
              </Button>
              <Button size="lg" variant="felt-inverse" asChild>
                <Link href={ROUTES.auth.signUp()}>Create an account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
