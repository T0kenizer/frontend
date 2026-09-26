'use client';

import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { listUserSessionsOptions } from '@services/users/users.options';
import { useQuery } from '@tanstack/react-query';
import { DeviceType, UserSession } from '@tokenizer/shared/types';
import {
  Monitor,
  MonitorSmartphone,
  Smartphone,
  Tablet,
  type LucideIcon,
} from 'lucide-react';
import { useFormatter, useLocale } from 'next-intl';
import { useMemo } from 'react';

const DEVICE_ICONS: Record<DeviceType, LucideIcon> = {
  [DeviceType.Desktop]: Monitor,
  [DeviceType.Mobile]: Smartphone,
  [DeviceType.Tablet]: Tablet,
  [DeviceType.Unknown]: MonitorSmartphone,
};

const SessionRow: React.FC<{ session: UserSession }> = ({ session }) => {
  const format = useFormatter();
  const locale = useLocale();
  const countries = useMemo(
    () => new Intl.DisplayNames([locale], { type: 'region' }),
    [locale],
  );

  const Icon = DEVICE_ICONS[session.device.type];
  const { browser, os } = session.device;
  const title =
    browser && os ? `${browser} on ${os}` : (browser ?? os ?? 'Unknown device');

  const { location } = session;
  const place = [
    location?.city,
    location?.country && countries.of(location.country),
  ]
    .filter(Boolean)
    .join(', ');

  const lastSeenAt = new Date(session.lastSeenAt);
  const createdAt = new Date(session.createdAt);

  return (
    <li className="border-border flex items-start gap-3 border-t py-3.5 first:border-t-0">
      <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm leading-none font-semibold">{title}</span>
          {session.current && <Badge variant="success">This device</Badge>}
        </div>
        <p className="text-muted-foreground text-xs leading-snug font-light">
          {[place || 'Unknown location', session.ip]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="text-muted-foreground text-xs leading-snug font-light">
          {session.current
            ? 'Active now'
            : `Active ${format.relativeTime(lastSeenAt)}`}
          {' · '}
          <time dateTime={createdAt.toISOString()}>
            Signed in {format.dateTime(createdAt, { dateStyle: 'medium' })}
          </time>
        </p>
      </div>
    </li>
  );
};

export const SessionsList: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const {
    data: sessions,
    isPending,
    isError,
  } = useQuery(listUserSessionsOptions(session?.user.uuid));

  if (isError)
    return (
      <p className="text-destructive py-3.5 text-sm">
        Your sessions could not be loaded.
      </p>
    );

  if (isPending)
    return (
      <ul aria-busy>
        {[0, 1].map((index) => (
          <li
            key={index}
            className="border-border flex items-center gap-3 border-t py-3.5 first:border-t-0"
          >
            <Skeleton className="size-9 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <ul>
      {sessions.map((session) => (
        <SessionRow key={session.id} session={session} />
      ))}
    </ul>
  );
};
