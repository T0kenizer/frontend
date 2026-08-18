'use client';

import { useHeader } from '@components/layout/header';
import { Logo } from '@components/layout/logo';
import { Button } from '@components/ui/button';
import { useSidebar } from '@components/ui/sidebar';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Sidebar } from 'lucide-react';
import Link from 'next/link';

export type NavbarProps = Omit<React.ComponentProps<'nav'>, 'children'> & {
  scrolled?: boolean;
};

export const Navbar: React.FC<NavbarProps> = ({
  className,
  scrolled,
  ...props
}) => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const { isMobile, toggleSidebar } = useSidebar();
  const { scrolled: headerScrolled } = useHeader();
  const user = session?.user;

  const isScrolled = scrolled ?? headerScrolled;

  return (
    <nav
      data-slot="navbar"
      data-scrolled={isScrolled || undefined}
      className={cn(
        'text-sidebar-foreground bg-background relative w-full',
        'after:from-background after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-linear-to-b after:to-transparent after:opacity-0 after:transition-opacity after:duration-200 after:content-[""]',
        'data-scrolled:after:opacity-100',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-7xl justify-between px-2">
        <Left>{isMobile && <Logo />}</Left>
        <Right className="flex-1">
          {isMobile ? (
            <Button size="icon-lg" variant="secondary" onClick={toggleSidebar}>
              <Sidebar />
            </Button>
          ) : (
            <>
              {user ? (
                <>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="#">
                      <Play />
                      Join
                    </Link>
                  </Button>
                  <Button size="lg" asChild>
                    <Link href="#">
                      <Plus />
                      New Game
                    </Link>
                  </Button>
                </>
              ) : (
                <Button size="lg" asChild>
                  <Link href="#">
                    <Play />
                    Join
                  </Link>
                </Button>
              )}
            </>
          )}
        </Right>
      </div>
    </nav>
  );
};

type LeftProps = React.ComponentProps<'div'>;

const Left: React.FC<LeftProps> = ({ className, ...props }) => (
  <div
    className={cn('flex items-center justify-start gap-4 py-2', className)}
    {...props}
  />
);

type RightProps = React.ComponentProps<'div'>;

const Right: React.FC<RightProps> = ({ className, ...props }) => (
  <div
    className={cn('flex items-center justify-end gap-4 py-2', className)}
    {...props}
  />
);
