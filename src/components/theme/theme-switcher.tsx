'use client';

import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { DEFAULT_THEME, Theme } from '@constants/themes';
import { useMounted } from '@hooks/use-mounted';
import { cn } from '@lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

interface ThemeOption {
  value: Theme;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: Theme.Light, icon: Sun },
  { value: Theme.Dark, icon: Moon },
  { value: Theme.System, icon: Monitor },
];

export type ThemeSwitcherProps = Omit<
  React.ComponentProps<typeof ToggleGroup>,
  'type' | 'value' | 'defaultValue' | 'onValueChange' | 'variant' | 'children'
> & {
  compact?: boolean;
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  compact = false,
  size,
  className,
  ...props
}) => {
  const t = useTranslations('ThemeSwitcher');
  const { theme, setTheme } = useTheme();

  const mounted = useMounted();

  return (
    <ToggleGroup
      type="single"
      variant="track"
      size={size}
      value={mounted ? (theme ?? DEFAULT_THEME) : ''}
      onValueChange={(value) => value && setTheme(value)}
      aria-label={t('label')}
      className={cn('w-fit', className)}
      {...props}
    >
      {THEME_OPTIONS.map(({ value, icon: Icon }) => {
        const label = t(value);
        const item = (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={compact ? label : undefined}
            className={cn('flex-1', compact && 'px-0')}
          >
            <Icon />
            {!compact && label}
          </ToggleGroupItem>
        );

        return compact ? (
          <Tooltip key={value}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ) : (
          item
        );
      })}
    </ToggleGroup>
  );
};

export default ThemeSwitcher;
