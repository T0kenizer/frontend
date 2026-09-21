import { Logo } from '@components/layout/logo';
import { cn } from '@lib/utils';
import { ArrowLeft } from 'lucide-react';

/**
 * The steps a visitor walks, in order. The scanner is a detour inside the
 * first.
 */
export const JOIN_STEPS = ['identify', 'seat', 'identity'] as const;

export type JoinStep = (typeof JOIN_STEPS)[number];

export type JoinStageProps = React.ComponentProps<'div'> & {
  /** Which of {@link JOIN_STEPS} the visitor is on. */
  step: JoinStep;
};

/**
 * The frame every join screen sits in: the mark, the progress rail, and a
 * column that centres the panel on a phone held one-handed.
 *
 * It owns no state — the step only drives how much of the rail is lit, so the
 * flow can be read at a glance from anywhere in it.
 */
export const JoinStage: React.FC<JoinStageProps> = ({
  step,
  className,
  children,
  ...props
}) => {
  const current = JOIN_STEPS.indexOf(step) + 1;

  return (
    <div
      data-slot="join-stage"
      className={cn(
        'mx-auto flex w-full max-w-xl flex-1 flex-col overflow-y-auto px-5 pt-6 pb-11',
        className,
      )}
      {...props}
    >
      <Logo className="shrink-0 self-center" />

      <div
        role="progressbar"
        aria-label="Join progress"
        aria-valuemin={1}
        aria-valuemax={JOIN_STEPS.length}
        aria-valuenow={current}
        className="mt-6 flex shrink-0 items-center gap-1.5"
      >
        {JOIN_STEPS.map((name, index) => (
          <span
            key={name}
            className={cn(
              'bg-on-media-film h-[3px] flex-1 rounded-full transition-colors',
              index < current && 'bg-warning',
            )}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-center py-7">{children}</div>

      <p className="text-on-media-muted-foreground shrink-0 text-center text-xs">
        No account needed to play a night.
      </p>
    </div>
  );
};

export type JoinPanelProps = React.ComponentProps<'section'>;

/** The glass card a step's content lives on. */
export const JoinPanel: React.FC<JoinPanelProps> = ({
  className,
  ...props
}) => (
  <section
    data-slot="join-panel"
    className={cn('felt-panel rounded-3xl px-6 py-7', className)}
    {...props}
  />
);

export type JoinHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> & {
  /** The small caps line above the title — which room, which seat. */
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export const JoinHeader: React.FC<JoinHeaderProps> = ({
  eyebrow,
  title,
  description,
  className,
  ...props
}) => (
  <header data-slot="join-header" className={cn('mb-6', className)} {...props}>
    <p className="text-on-media-muted-foreground text-[0.65rem] font-bold tracking-[0.14em] uppercase">
      {eyebrow}
    </p>
    <h1 className="font-heading mt-2 text-[1.625rem] leading-tight font-extrabold tracking-[-0.04em] text-balance">
      {title}
    </h1>
    {description && (
      <p className="text-on-media-muted-foreground mt-2 text-sm leading-relaxed">
        {description}
      </p>
    )}
  </header>
);

export type JoinBackButtonProps = React.ComponentProps<'button'>;

/** The way out of a step, back to the one before it. */
export const JoinBackButton: React.FC<JoinBackButtonProps> = ({
  className,
  children,
  ...props
}) => (
  <button
    type="button"
    data-slot="join-back"
    className={cn(
      'text-on-media-muted-foreground hover:text-on-media-foreground mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
      className,
    )}
    {...props}
  >
    <ArrowLeft className="size-3.5" />
    {children}
  </button>
);
