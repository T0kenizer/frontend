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
import {
  BarChart2,
  CircleDot,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';

export type SidebarProps = Omit<UISidebarProps, 'children' | 'collapsible'>;

export const Sidebar: React.FC<SidebarProps> = ({ ...props }) => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <UISidebar {...props} collapsible="icon">
      <SidebarHeader>
        <Logo href={ROUTES.dashboard()} collapsible />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain
          items={[
            {
              items: [
                {
                  label: 'Dashboard',
                  href: ROUTES.dashboard(),
                  renderIcon: () => <LayoutDashboard />,
                  isActive: (pathname) => pathname === ROUTES.dashboard(),
                },
              ],
            },
            {
              label: 'Game',
              items: [
                {
                  label: 'Games',
                  href: ROUTES.dashboard(),
                  renderIcon: () => <CircleDot />,
                  isLocked: true,
                },
                {
                  label: 'Statistics',
                  href: ROUTES.dashboard(),
                  renderIcon: () => <BarChart2 />,
                  isLocked: true,
                },
              ],
            },
            {
              label: 'Account',
              items: [
                {
                  label: 'Profile',
                  href: ROUTES.profile(),
                  renderIcon: () => <User />,
                  isLocked: true,
                },
                {
                  label: 'Preferences',
                  href: ROUTES.settings.preferences(),
                  renderIcon: () => <Settings />,
                  isActive: (pathname) =>
                    pathname.startsWith(ROUTES.settings()),
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
