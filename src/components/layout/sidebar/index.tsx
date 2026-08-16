'use client';

import { Logo } from '@components/layout/logo';
import { SidebarFooter } from '@components/layout/sidebar/footer';
import { SidebarMain } from '@components/layout/sidebar/main';
import {
  SidebarContent,
  SidebarHeader,
  Sidebar as UISidebar,
  SidebarProps as UISidebarProps,
} from '@components/ui/sidebar';
import ROUTES from '@constants/routes';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, CircleDot, Home } from 'lucide-react';

export type SidebarProps = Omit<UISidebarProps, 'children' | 'collapsible'>;

export const Sidebar: React.FC<SidebarProps> = ({ ...props }) => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <UISidebar {...props} collapsible="icon">
      <SidebarHeader>
        <Logo collapsible />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain
          items={[
            {
              items: [
                {
                  label: 'Home',
                  href: ROUTES.home(),
                  renderIcon: () => <Home />,
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
                  renderIcon: () => <CircleDot />,
                  isLocked: true,
                },
                {
                  label: 'Statistics',
                  href: ROUTES.home(),
                  renderIcon: () => <BarChart2 />,
                  isLocked: true,
                },
              ],
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter user={user} />
    </UISidebar>
  );
};
