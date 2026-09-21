import { cardVariants } from '@components/ui/card';
import { cn, slugify } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export const settingsSectionVariants = cva('scroll-mt-24 gap-0 py-0', {
  variants: {
    variant: {
      default: '',
      danger: 'border-destructive/35',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type SettingsSectionProps = Omit<
  React.ComponentProps<'section'>,
  'title'
> &
  VariantProps<typeof settingsSectionVariants> & {
    title: React.ReactNode;
    description?: React.ReactNode;
  };

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  variant,
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
      data-slot="settings-section"
      className={cn(
        cardVariants(),
        settingsSectionVariants({ variant }),
        className,
      )}
      {...props}
    >
      <header className="space-y-1 px-5 pt-5">
        <h2 className="font-heading text-foreground text-base leading-snug font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-[64ch] text-xs leading-relaxed font-light">
            {description}
          </p>
        )}
      </header>
      <div className="px-5 pb-4 *:first:border-t-0 [&>:first-child>:first-child]:border-t-0">
        {children}
      </div>
    </section>
  );
};
