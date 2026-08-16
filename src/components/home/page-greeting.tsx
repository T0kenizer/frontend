'use client';

import { cn } from '@lib/utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
});

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getSalutation = (hours: number) =>
  hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

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
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const now = useNow();

  return (
    <div
      data-slot="page-greeting"
      className={cn('space-y-1', className)}
      {...props}
    >
      <p className="text-muted-foreground text-sm font-light">
        {user
          ? now && (
              <>
                {capitalize(DATE_FORMATTER.format(now))} ·{' '}
                {TIME_FORMATTER.format(now)}
              </>
            )
          : 'Welcome to Tokenizer'}
      </p>
      <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight text-balance">
        {user ? (
          <>
            {now ? getSalutation(now.getHours()) : 'Hello'},{' '}
            <span className="text-primary">{user.displayName}</span>{' '}
            <span aria-hidden>👋</span>
          </>
        ) : (
          <>
            The companion app for your{' '}
            <span className="text-primary">game nights</span>
          </>
        )}
      </h1>
    </div>
  );
};
