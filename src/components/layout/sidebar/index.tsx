'use client';

import TokenizerLogo from '@assets/images/logo/tokenizer-logo.svg';
import { SidebarMain } from '@components/layout/sidebar/main';
import { SidebarUserMenu } from '@components/layout/sidebar/user-menu';
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
        <Link href={ROUTES.home()}>
          <Image
            src={TokenizerLogo}
            alt="Tokenizer Logo"
            height={32}
            sizes="100%"
            className="h-8 w-auto"
          />
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
      <SidebarFooter>{user && <SidebarUserMenu user={user} />}</SidebarFooter>
    </UISidebar>
  );
};
