'use client';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const THEMES = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
] as const;

const emptySubscribe = () => () => {};

/** True once mounted on the client, false during SSR/first render. */
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export type ThemeSwitcherProps = React.ComponentProps<'div'>;

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  ...props
}) => {
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch: the selected theme is only known client-side.
  const mounted = useMounted();

  return (
    <div className={cn('inline-flex gap-1.5', className)} {...props}>
      {THEMES.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant={mounted && theme === value ? 'default' : 'outline'}
          onClick={() => setTheme(value)}
          aria-pressed={mounted && theme === value}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
