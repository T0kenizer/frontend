'use client';

import TokenizerLogo from '@assets/images/logo/tokenizer-mark.svg';
import { SidebarMain } from '@components/layout/sidebar/main';
import { SidebarUserMenu } from '@components/layout/sidebar/user-menu';
import { Button } from '@components/ui/button';
import { Card, CardDescription, CardTitle } from '@components/ui/card';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar as UISidebar,
  SidebarProps as UISidebarProps,
} from '@components/ui/sidebar';
import ROUTES from '@constants/routes';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, CircleDot, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export type SidebarProps = Omit<UISidebarProps, 'children' | 'collapsible'>;

export const Sidebar: React.FC<SidebarProps> = ({ ...props }) => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <UISidebar {...props} collapsible="icon">
      <SidebarHeader>
        <Link
          href={ROUTES.home()}
          className="flex flex-row items-center gap-0.5"
        >
          <Image
            src={TokenizerLogo}
            alt="Tokenizer Logo"
            height={32}
            sizes="100%"
            className="h-8 w-auto shrink-0 transition-transform duration-200 ease-linear group-data-[collapsible=icon]:rotate-360"
          />
          <span className="overflow-hidden text-lg font-bold transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            okenizer
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain
          items={[
            {
              items: [
                {
                  label: 'Home',
                  href: ROUTES.home(),
                  renderIcon: (isActive) => <Home />,
                  isActive: (pathname) => pathname === ROUTES.home(),
                },
              ],
            },
            {
              label: 'Game',
              items: [
                {
                  label: 'Games',
                  href: ROUTES.home(),
                  renderIcon: (isActive) => <CircleDot />,
                  isLocked: true,
                },
                {
                  label: 'Statistics',
                  href: ROUTES.home(),
                  renderIcon: (isActive) => <BarChart2 />,
                  isLocked: true,
                },
              ],
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter className="space-y-2">
        <Card className="gap-1 p-2">
          <CardTitle className="text-sm">Join the table</CardTitle>
          <CardDescription className="text-xs">
            Sign Up to host your games and invite your friends.
          </CardDescription>
        </Card>
        {user ? (
          <SidebarUserMenu user={user} />
        ) : (
          <>
            <Button asChild>
              <Link href={ROUTES.auth.signUp()}>Sign Up</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.auth.signIn()}>Sign In</Link>
            </Button>
          </>
        )}
      </SidebarFooter>
    </UISidebar>
  );
};
