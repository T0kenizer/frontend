'use client';

import { Tabs, TabsProps, type TabsItem } from '@components/layout/tabs';
import ROUTES from '@constants/routes';
import { Settings2, Shield, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

const items: TabsItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    renderIcon: () => <User />,
    href: ROUTES.settings.profile(),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    renderIcon: () => <Settings2 />,
    href: ROUTES.settings.preferences(),
  },
  {
    id: 'security',
    label: 'Security',
    renderIcon: () => <Shield />,
    href: ROUTES.settings.security(),
  },
];

export type SettingsTabsProps = Omit<TabsProps, 'activeId' | 'items'>;

export const SettingsTabs: React.FC<SettingsTabsProps> = (props) => {
  const pathname = usePathname();

  const activeId =
    items.find((item) => pathname.startsWith(item.href))?.id ?? items[0].id;

  return <Tabs activeId={activeId} items={items} {...props} />;
};
