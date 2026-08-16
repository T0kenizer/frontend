'use client';

import { Tabs, TabsProps, type TabsItem } from '@components/layout/tabs';
import ROUTES from '@constants/routes';
import { CreditCard, Settings2, Shield, User } from 'lucide-react';
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
    disabled: true,
  },
  {
    id: 'security',
    label: 'Security',
    renderIcon: () => <Shield />,
    href: ROUTES.settings.security(),
  },
  {
    id: 'billing',
    label: 'Billing',
    renderIcon: () => <CreditCard />,
    href: ROUTES.settings.billing(),
    disabled: true,
  },
];

type SettingsTabsProps = Omit<TabsProps, 'activeId' | 'items'>;

export const SettingsTabs: React.FC<SettingsTabsProps> = (props) => {
  const pathname = usePathname();

  const activeId =
    items.find((item) => !item.disabled && pathname.startsWith(item.href))
      ?.id ?? items[0].id;

  return <Tabs activeId={activeId} items={items} {...props} />;
};
