import { Logo } from '@components/layout/logo';
import { Main, MainProps } from '@components/layout/main';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export type AuthMainProps = MainProps;

export const AuthMain: React.FC<AuthMainProps> = ({ className, ...props }) => (
  <Main
    data-slot="auth-main"
    className={cn(
      'grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[1.08fr_minmax(26.875rem,32.5rem)]',
      className,
    )}
    {...props}
  />
);

export type AuthLeftContainerProps = React.ComponentProps<'aside'>;

export const AuthLeftContainer: React.FC<AuthLeftContainerProps> = ({
  className,
  ...props
}) => (
  <aside
    data-slot="auth-left"
    className={cn(
      'felt-surface hidden flex-col overflow-hidden p-12 lg:flex',
      className,
    )}
    {...props}
  />
);

export type AuthRightContainerProps = React.ComponentProps<'div'>;

export const AuthRightContainer: React.FC<AuthRightContainerProps> = ({
  className,
  children,
  ...props
}) => {
  const t = useTranslations('Auth');

  return (
    <div
      data-slot="auth-right"
      className={cn(
        'bg-card flex min-h-0 flex-col overflow-y-auto px-5 py-6 sm:px-8',
        className,
      )}
      {...props}
    >
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Logo className="lg:hidden" />
        <Link
          href={ROUTES.landing()}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t('home')}
        </Link>
      </div>

      <div className="m-auto w-full max-w-94 space-y-7 py-9">{children}</div>
    </div>
  );
};

export type AuthHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> & {
  title: React.ReactNode;
  description?: React.ReactNode;
};

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  description,
  className,
  ...props
}) => (
  <header
    data-slot="auth-header"
    className={cn('space-y-2', className)}
    {...props}
  >
    <h1 className="font-heading text-[1.6875rem] leading-tight font-extrabold tracking-[-0.04em] text-balance">
      {title}
    </h1>
    {description && (
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    )}
  </header>
);

export type AuthBackLinkProps = React.ComponentProps<typeof Link>;

/**
 * The way out of a screen that is a detour rather than a mode. Recovery uses
 * it; sign-in and sign-up have the tabs instead.
 */
export const AuthBackLink: React.FC<AuthBackLinkProps> = ({
  className,
  children,
  ...props
}) => (
  <Link
    data-slot="auth-back-link"
    className={cn(
      'text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors',
      className,
    )}
    {...props}
  >
    <ArrowLeft className="size-3.5" />
    {children}
  </Link>
);

export type AuthStepsProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** 1-based position of the step on show. */
  current: number;
  total: number;
  label: string;
};

/**
 * The rail that tells a multi-screen flow how far along it is. Recovery spans
 * three screens with a trip to an inbox in the middle, so without it the mail
 * screen reads as the end rather than the middle.
 */
export const AuthSteps: React.FC<AuthStepsProps> = ({
  current,
  total,
  label,
  className,
  ...props
}) => (
  <div
    data-slot="auth-steps"
    role="progressbar"
    aria-label={label}
    aria-valuemin={1}
    aria-valuemax={total}
    aria-valuenow={current}
    className={cn('flex items-center gap-1.5', className)}
    {...props}
  >
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={cn(
          'bg-surface-sunk h-[3px] flex-1 rounded-full transition-colors',
          index < current && 'bg-primary',
        )}
      />
    ))}
  </div>
);

export type AuthSealProps = React.ComponentProps<'div'> & {
  tone?: 'primary' | 'success' | 'danger';
};

/** The tinted disc that gives a screen with no form something to lead with. */
export const AuthSeal: React.FC<AuthSealProps> = ({
  tone = 'primary',
  className,
  ...props
}) => (
  <div
    data-slot="auth-seal"
    aria-hidden
    className={cn(
      "grid size-14 place-items-center rounded-full [&_svg:not([class*='size-'])]:size-6",
      {
        primary: 'bg-primary-soft text-primary',
        success: 'bg-success-soft text-success-soft-foreground',
        danger: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
      }[tone],
      className,
    )}
    {...props}
  />
);

export type AuthMailboxProps = React.ComponentProps<'div'>;

/**
 * The address a screen is talking about, quoted back so a typo is caught here
 * rather than after a wait on mail that was never going to arrive.
 */
export const AuthMailbox: React.FC<AuthMailboxProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="auth-mailbox"
    className={cn(
      'bg-surface-2 border-border flex min-w-0 items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-semibold',
      className,
    )}
    {...props}
  />
);

export type AuthLoadingProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Read out to assistive tech while the placeholder is on screen. */
  label: string;
};

/**
 * Stands in for a seal-led screen while its link is being checked, shaped like
 * what replaces it so the panel does not jump when the answer lands.
 */
export const AuthLoading: React.FC<AuthLoadingProps> = ({
  label,
  className,
  ...props
}) => (
  <div
    data-slot="auth-loading"
    role="status"
    aria-busy
    className={cn('space-y-7', className)}
    {...props}
  >
    <span className="sr-only">{label}</span>
    <div className="space-y-5">
      <Skeleton className="size-14 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
    <Skeleton className="h-11 w-full rounded-lg" />
  </div>
);

export type AuthLoadErrorProps = {
  onRetry: () => void;
  isRetrying?: boolean;
};

/**
 * The link could not be checked at all — the server or the network failed,
 * which says nothing about the link itself, so the way out is to try again
 * rather than to ask for a new one.
 */
export const AuthLoadError: React.FC<AuthLoadErrorProps> = ({
  onRetry,
  isRetrying,
}) => {
  const t = useTranslations('Auth.loadError');

  return (
    <>
      <div className="space-y-5">
        <AuthSeal tone="danger">
          <TriangleAlert />
        </AuthSeal>

        <AuthHeader title={t('title')} description={t('description')} />
      </div>

      <Button
        size="lg"
        className="h-11 w-full text-[0.9375rem]"
        onClick={onRetry}
        loading={isRetrying}
        disabled={isRetrying}
      >
        {t('retry')}
      </Button>
    </>
  );
};
