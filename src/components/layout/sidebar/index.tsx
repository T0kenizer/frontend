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
import { useTranslations } from 'next-intl';

export type SidebarProps = Omit<
  UISidebarProps,
  'children' | 'collapsible' | 'mobileTitle' | 'mobileDescription'
>;

export const Sidebar: React.FC<SidebarProps> = ({ ...props }) => {
  const t = useTranslations('Sidebar');
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <UISidebar
      {...props}
      collapsible="icon"
      mobileTitle={t('title')}
      mobileDescription={t('description')}
    >
      <SidebarHeader>
        <Logo href={ROUTES.dashboard()} collapsible />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain
          items={[
            {
              items: [
                {
                  label: t('items.dashboard'),
                  href: ROUTES.dashboard(),
                  renderIcon: () => <LayoutDashboard />,
                  isActive: (pathname) => pathname === ROUTES.dashboard(),
                },
              ],
            },
            {
              label: t('sections.game'),
              items: [
                {
                  label: t('items.games'),
                  href: ROUTES.dashboard(),
                  renderIcon: () => <CircleDot />,
                  isLocked: true,
                },
                {
                  label: t('items.statistics'),
                  href: ROUTES.dashboard(),
                  renderIcon: () => <BarChart2 />,
                  isLocked: true,
                },
              ],
            },
            {
              label: t('sections.account'),
              items: [
                {
                  label: t('items.profile'),
                  href: ROUTES.profile(),
                  renderIcon: () => <User />,
                  isLocked: true,
                },
                {
                  label: t('items.preferences'),
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
