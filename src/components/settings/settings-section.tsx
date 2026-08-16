import { cn, slugify } from '@lib/utils';

export type SettingsSectionProps = Omit<
  React.ComponentProps<'section'>,
  'title'
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
};

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  id,
  className,
  children,
  ...props
}) => {
  const sectionId =
    id ?? (typeof title === 'string' ? slugify(title) : undefined);

  return (
    <section
      id={sectionId}
      className={cn('max-w-2xl scroll-mt-24 space-y-4', className)}
      {...props}
    >
      <div className="space-y-1">
        <h2 className="font-heading text-foreground text-lg leading-snug font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm font-light">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
};
