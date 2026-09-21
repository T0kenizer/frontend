import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';

export type SettingsRowProps = React.ComponentProps<'div'> & {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
};

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  htmlFor,
  hint,
  className,
  children,
  ...props
}) => (
  <div
    data-slot="settings-row"
    className={cn(
      'border-border grid gap-2 border-t py-3.5 @lg/settings:grid-cols-[minmax(9rem,12rem)_minmax(0,1fr)] @lg/settings:gap-x-6',
      className,
    )}
    {...props}
  >
    {label ? (
      <div className="@lg/settings:pt-1.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="font-semibold">
            {label}
          </Label>
        ) : (
          <span className="text-sm leading-none font-semibold">{label}</span>
        )}
        {hint && (
          <p className="text-muted-foreground mt-1.5 text-xs leading-snug font-light">
            {hint}
          </p>
        )}
      </div>
    ) : (
      <div className="hidden @lg/settings:block" aria-hidden />
    )}
    <div className="flex min-w-0 flex-col items-start gap-2">{children}</div>
  </div>
);
