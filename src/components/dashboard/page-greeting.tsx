'use client';

import { APP_NAME } from '@constants/index';
import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

const DATE_FORMAT = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
} as const satisfies Intl.DateTimeFormatOptions;

const TIME_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
} as const satisfies Intl.DateTimeFormatOptions;

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getPeriod = (hours: number) =>
  hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';

const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000);

const subscribeToMinute = (onStoreChange: () => void) => {
  const interval = setInterval(onStoreChange, 60_000);

  return () => clearInterval(interval);
};

const useNow = (): Nullable<Date> => {
  const minute = useSyncExternalStore(
    subscribeToMinute,
    getMinuteSnapshot,
    () => null,
  );

  return minute === null ? null : new Date(minute * 60_000);
};

export type PageGreetingProps = Omit<React.ComponentProps<'div'>, 'children'>;

export const PageGreeting: React.FC<PageGreetingProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Dashboard.greeting');
  const format = useFormatter();
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const now = useNow();
  // The provider carries the server's time zone, the clock reads the device's.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div
      data-slot="page-greeting"
      className={cn('space-y-0.5', className)}
      {...props}
    >
      <p className="text-muted-foreground text-sm">
        {user
          ? now && (
              <>
                {capitalize(format.dateTime(now, { ...DATE_FORMAT, timeZone }))}{' '}
                · {format.dateTime(now, { ...TIME_FORMAT, timeZone })}
              </>
            )
          : t('welcome', { appName: APP_NAME })}
      </p>
      <h1 className="font-heading text-foreground text-3xl font-extrabold tracking-tight text-balance">
        {user ? (
          <>
            {t.rich('salutation', {
              period: now ? getPeriod(now.getHours()) : 'none',
              name: user.displayName,
              brand: (chunks) => (
                <span className="text-gradient-brand">{chunks}</span>
              ),
            })}{' '}
            <span aria-hidden>👋</span>
          </>
        ) : (
          t.rich('tagline', {
            brand: (chunks) => (
              <span className="text-gradient-brand">{chunks}</span>
            ),
          })
        )}
      </h1>
    </div>
  );
};
