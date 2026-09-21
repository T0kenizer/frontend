'use client';

import { Badge } from '@components/ui/badge';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { cva } from 'class-variance-authority';
import { CreditCard, Lock, Settings2, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const settingsNavVariants = cva(
  'flex gap-1 overflow-x-auto border-b pb-1 lg:sticky lg:top-8 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0',
);

export const settingsNavItemVariants = cva(
  'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-active data-active:text-sidebar-active-foreground data-active:hover:bg-sidebar-active data-active:hover:text-sidebar-active-foreground flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 data-active:font-semibold data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
);

export interface SettingsNavItem {
  id: string;
  label: string;
  renderIcon: () => React.ReactNode;
  href: string;
  disabled?: boolean;
}

const items: SettingsNavItem[] = [
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
    id: 'subscription',
    label: 'Subscription',
    renderIcon: () => <CreditCard />,
    href: ROUTES.settings.subscription(),
    disabled: true,
  },
];

export type SettingsNavProps = Omit<React.ComponentProps<'nav'>, 'children'>;

export const SettingsNav: React.FC<SettingsNavProps> = ({
  className,
  ...props
}) => {
  const pathname = usePathname();
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const activeId =
    items.find((item) => !item.disabled && pathname.startsWith(item.href))
      ?.id ?? items[0].id;

  const attention: Record<string, number> = {
    profile: user && !user.confirmedAt ? 1 : 0,
  };

  return (
    <nav
      data-slot="settings-nav"
      aria-label="Settings sections"
      className={cn(settingsNavVariants(), className)}
      {...props}
    >
      {items.map((item) => {
        const itemClassName = settingsNavItemVariants();

        if (item.disabled)
          return (
            <span
              key={item.id}
              data-slot="settings-nav-item"
              aria-disabled
              data-disabled
              className={itemClassName}
            >
              {item.renderIcon()}
              {item.label}
              <Lock className="ml-auto size-3.5!" />
            </span>
          );

        const isActive = item.id === activeId;
        const count = attention[item.id] ?? 0;

        return (
          <Link
            key={item.id}
            href={item.href}
            data-slot="settings-nav-item"
            aria-current={isActive ? 'page' : undefined}
            data-active={isActive || undefined}
            className={itemClassName}
          >
            {item.renderIcon()}
            {item.label}
            {count > 0 && (
              <Badge
                variant="notification"
                size="sm"
                className="ml-auto"
                aria-label={`${count} item${count > 1 ? 's' : ''} needing attention`}
              >
                {count}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
