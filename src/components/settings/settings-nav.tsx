'use client';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { ScrollFade } from '@components/ui/scroll-fade';
import { Separator } from '@components/ui/separator';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { useSignOut } from '@services/sessions/sessions.hooks';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { cva } from 'class-variance-authority';
import {
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Settings2,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const settingsNavVariants = cva(
  'flex gap-1 border-b pb-1 lg:sticky lg:top-8 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0',
);

export const settingsNavItemVariants = cva(
  'ring-sidebar-ring flex h-9 shrink-0 items-center justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 data-active:font-semibold data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-active data-active:text-sidebar-active-foreground data-active:hover:bg-sidebar-active data-active:hover:text-sidebar-active-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type SettingsNavItemId =
  | 'profile'
  | 'preferences'
  | 'security'
  | 'subscription';

export interface SettingsNavItem {
  id: SettingsNavItemId;
  label: string;
  renderIcon: () => React.ReactNode;
  href: string;
  isLocked?: boolean;
  isExternal?: boolean;
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
    isLocked: true,
    isExternal: true,
  },
];

export type SettingsNavProps = Omit<React.ComponentProps<'nav'>, 'children'>;

export const SettingsNav: React.FC<SettingsNavProps> = ({
  className,
  ...props
}) => {
  const pathname = usePathname();
  const { signOut: handleSignOut, isPending: isSigningOut } = useSignOut();
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const activeId: SettingsNavItemId =
    items.find((item) => !item.isLocked && pathname.startsWith(item.href))
      ?.id ?? items[0].id;

  const attentionCounts: Partial<Record<SettingsNavItemId, number>> = {
    profile: user && !user.confirmedAt ? 1 : 0,
  };

  return (
    <ScrollFade asChild>
      <nav
        data-slot="settings-nav"
        aria-label="Settings sections"
        className={cn(settingsNavVariants(), className)}
        {...props}
      >
        {items.map((item) => {
          if (item.isLocked) {
            return (
              <span
                key={item.id}
                data-slot="settings-nav-item"
                data-disabled
                aria-disabled
                className={settingsNavItemVariants()}
              >
                {item.renderIcon()}
                {item.label}
                {item.isExternal && <ExternalLink className="size-3.5!" />}
                <Lock className="ml-auto size-3.5!" />
              </span>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                data-slot="settings-nav-item"
                className={settingsNavItemVariants()}
              >
                {item.renderIcon()}
                {item.label}
                <ExternalLink className="size-3.5!" />
              </a>
            );
          }

          const isActive = item.id === activeId;
          const attentionCount = attentionCounts[item.id] ?? 0;

          return (
            <Link
              key={item.id}
              href={item.href}
              data-slot="settings-nav-item"
              data-active={isActive || undefined}
              aria-current={isActive ? 'page' : undefined}
              className={settingsNavItemVariants()}
            >
              {item.renderIcon()}
              {item.label}
              {attentionCount > 0 && (
                <Badge
                  variant="notification"
                  size="sm"
                  className="ml-auto"
                  aria-label={`${attentionCount} item${attentionCount > 1 ? 's' : ''} needing attention`}
                >
                  {attentionCount}
                </Badge>
              )}
            </Link>
          );
        })}
        <Separator className="hidden lg:block" />
        <Button
          variant="ghost"
          onClick={handleSignOut}
          loading={isSigningOut}
          className={settingsNavItemVariants()}
        >
          <LogOut />
          Sign out
        </Button>
      </nav>
    </ScrollFade>
  );
};
