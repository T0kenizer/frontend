'use client';

import { Logo } from '@components/layout/logo';
import { UserMenu, useUserAvatar } from '@components/layout/user-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { LandingSection } from '@constants/landing';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const LINKS = [
  { key: 'howItWorks', href: ROUTES.landing(LandingSection.HowItWorks) },
  { key: 'tv', href: ROUTES.landing(LandingSection.Tv) },
  { key: 'phone', href: ROUTES.landing(LandingSection.Phone) },
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
  const t = useTranslations('Navbar');
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;
  const avatar = useUserAvatar(user);

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
          {LINKS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              className="text-on-media-muted-foreground hover:text-on-media-foreground text-sm font-semibold transition-colors"
            >
              {t(key)}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {user ? (
            <UserMenu user={user} side="bottom" align="end">
              <Button size="lg" variant="line" className="pl-1.5">
                <Avatar size="sm">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                  <AvatarFallback />
                </Avatar>
                <span className="max-w-32 truncate">{user.displayName}</span>
                <ChevronDown className="opacity-70 transition-transform group-aria-expanded/button:rotate-180" />
              </Button>
            </UserMenu>
          ) : (
            <>
              <Button
                size="lg"
                variant="link"
                className="text-on-media-foreground hidden sm:inline-flex"
                asChild
              >
                <Link href={ROUTES.auth.signIn()}>{t('signIn')}</Link>
              </Button>
              <Button size="lg" variant="felt-inverse" asChild>
                <Link href={ROUTES.auth.signUp()}>{t('signUp')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
