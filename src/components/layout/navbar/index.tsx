'use client';

import TokenizerLogo from '@assets/images/logo/tokenizer-logo.svg';
import { UserMenu } from '@components/layout/navbar/user-menu';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

export type NavbarProps = React.ComponentProps<'nav'>;

export const Navbar: React.FC<NavbarProps> = ({ className, ...props }) => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <nav
      className={cn(
        'bg-navbar text-navbar-foreground h-fit w-full border-b backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-7xl flex-row items-center gap-4 px-4">
        <Link href={ROUTES.home()}>
          <Image
            src={TokenizerLogo}
            alt="Tokenizer Logo"
            height={32}
            sizes="100vw"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex flex-1 flex-row items-center justify-end gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <div className="flex flex-row items-center gap-2">
                <Button variant="ghost" size="lg" asChild>
                  <Link href={ROUTES.auth.signIn()}>Sign In</Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href={ROUTES.auth.signUp()}>Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
