'use client';

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import ROUTES from '@constants/routes';
import { useBillingAccount } from '@hooks/use-billing-account';
import { usePlan, usePlans } from '@hooks/use-plan';
import { cn } from '@lib/utils';
import { formatPrice, planOf } from '@services/plans/plans.utils';
import {
  listInvoicesOptions,
  resumeSubscriptionOptions,
  retrieveSubscriptionOptions,
} from '@services/subscriptions/subscriptions.options';
import { buildBillingPortalUrl } from '@services/subscriptions/subscriptions.utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Feature,
  Offer,
  Plan,
  type Subscription,
  SubscriptionStatus,
  type UserPlan,
} from '@tokenizer/shared/types';
import { cva } from 'class-variance-authority';
import { AlertTriangle, CalendarClock, ExternalLink } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';

const planCardVariants = cva(
  'relative flex min-h-28 flex-wrap items-center gap-x-5 gap-y-4 overflow-hidden rounded-xl px-5 py-5',
  {
    variants: {
      plan: {
        [Plan.Free]: 'bg-card text-card-foreground border',
        [Plan.Premium]:
          'bg-linear-150 from-teal-700 to-teal-800 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_88%_-18%,oklch(1_0_0/.16),transparent_46%)]',
        [Plan.Founder]:
          'bg-linear-150 from-[oklch(0.36_0.08_172)] to-[oklch(0.22_0.05_200)] text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_88%_-18%,oklch(1_0_0/.16),transparent_46%)]',
      },
    },
    defaultVariants: {
      plan: Plan.Free,
    },
  },
);

// Pills sit on the teal card, so the soft theme tokens are traded for washes
// that read on it.
const ON_CARD = {
  ok: 'bg-on-media text-on-media-foreground',
  warn: 'bg-warning text-warning-foreground',
  bad: 'bg-destructive text-white',
} as const;

const STATUS_TONES: Record<SubscriptionStatus, keyof typeof ON_CARD> = {
  [SubscriptionStatus.Active]: 'ok',
  [SubscriptionStatus.Trialing]: 'ok',
  [SubscriptionStatus.PastDue]: 'warn',
  [SubscriptionStatus.Unpaid]: 'bad',
  [SubscriptionStatus.Paused]: 'warn',
  [SubscriptionStatus.Canceled]: 'ok',
  [SubscriptionStatus.Incomplete]: 'warn',
  [SubscriptionStatus.IncompleteExpired]: 'ok',
};

const PAYMENT_ISSUE_STATUSES: readonly SubscriptionStatus[] = [
  SubscriptionStatus.PastDue,
  SubscriptionStatus.Unpaid,
];

const AlertActions: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="col-start-2 mt-2.5 flex flex-wrap gap-2">{children}</div>
);

const PortalButton: React.FC<
  Omit<React.ComponentProps<typeof Button>, 'asChild'>
> = ({ children, ...props }) => {
  const t = useTranslations('Settings.subscription.plan');

  return (
    <Button {...props} asChild>
      <a href={buildBillingPortalUrl()}>
        {children ?? t('manage')}
        <ExternalLink data-icon="inline-end" aria-hidden />
      </a>
    </Button>
  );
};

const PlanCardSkeleton: React.FC = () => {
  const t = useTranslations('Settings.subscription.plan');

  return (
    <div
      aria-busy
      aria-label={t('loading')}
      className={cn(planCardVariants(), 'bg-card border')}
    >
      <div className="space-y-2.5">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3 w-60" />
      </div>
      <Skeleton className="ml-auto h-9 w-40 rounded-lg" />
    </div>
  );
};

interface PlanCardProps {
  plan: UserPlan;
  pill?: React.ReactNode;
  details: React.ReactNode;
  actions?: React.ReactNode;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  pill,
  details,
  actions,
}) => {
  const t = useTranslations('Plans');
  const tPlan = useTranslations('Settings.subscription.plan');
  const isFree = plan === Plan.Free;

  return (
    <div data-plan={plan} className={planCardVariants({ plan })}>
      <div className="relative min-w-0 space-y-1">
        <p
          className={cn(
            'text-[0.65rem] font-bold tracking-[0.12em] uppercase',
            isFree ? 'text-muted-foreground' : 'opacity-75',
          )}
        >
          {tPlan('current')}
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="font-heading text-2xl font-extrabold tracking-tight">
            {t(plan)}
          </p>
          {pill}
        </div>
        <p
          className={cn(
            'text-xs leading-relaxed',
            isFree ? 'text-muted-foreground font-light' : 'opacity-85',
          )}
        >
          {details}
        </p>
      </div>
      {actions && (
        <div className="relative ml-auto flex flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
};

const FreePlanCard: React.FC = () => {
  const t = useTranslations('Settings.subscription.free');
  const plans = usePlans();
  const { hasBillingAccount } = useBillingAccount();
  const { maxSeats } = plans[Plan.Free].features[Feature.CreateGame];

  return (
    <PlanCard
      plan={Plan.Free}
      details={
        hasBillingAccount
          ? t('ended', { maxSeats })
          : t('details', { maxSeats })
      }
      actions={
        <>
          {hasBillingAccount && <PortalButton variant="secondary" />}
          <Button variant="primary" asChild>
            <Link href={ROUTES.pricing()}>
              {hasBillingAccount ? t('comeBack') : t('upgrade')}
            </Link>
          </Button>
        </>
      }
    />
  );
};

// A paid plan granted outside Stripe, by an admin: nothing is billed for it.
const GrantedPlanCard: React.FC<{ plan: UserPlan }> = ({ plan }) => {
  const t = useTranslations('Settings.subscription');
  const plans = usePlans();
  const { maxSeats } = plans[plan].features[Feature.CreateGame];

  return <PlanCard plan={plan} details={t('granted', { maxSeats })} />;
};

const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({
  subscription,
}) => {
  const t = useTranslations('Settings.subscription');
  const format = useFormatter();
  const locale = useLocale();
  const plans = usePlans();

  const formatDate = (date: Date) =>
    format.dateTime(date, { dateStyle: 'long' });

  const cancelAt = subscription.cancelAt && new Date(subscription.cancelAt);

  if (subscription.offer === Offer.FounderLifetime) {
    const since = formatDate(new Date(subscription.createdAt));

    return (
      <PlanCard
        plan={Plan.Founder}
        pill={
          cancelAt ? (
            <Badge
              variant="outline"
              size="sm"
              className={cn('border-transparent', ON_CARD.warn)}
            >
              {t('plan.ends', {
                date: format.dateTime(cancelAt, { dateStyle: 'medium' }),
              })}
            </Badge>
          ) : (
            <Badge variant="gold" size="sm">
              {t('founder.lifetime')}
            </Badge>
          )
        }
        details={
          cancelAt
            ? t('founder.detailsEnding', { since, end: formatDate(cancelAt) })
            : t('founder.details', { since })
        }
        actions={<PortalButton variant="line" />}
      />
    );
  }

  const { price } = subscription;
  const pill = cancelAt
    ? {
        label: t('plan.ends', {
          date: format.dateTime(cancelAt, { dateStyle: 'medium' }),
        }),
        tone: 'warn' as const,
      }
    : {
        label: t(`plan.status.${subscription.status}`),
        tone: STATUS_TONES[subscription.status],
      };

  const amount = t('plan.price', {
    amount: formatPrice(price, locale),
    interval: price.interval ?? 'once',
  });
  const details = cancelAt
    ? t('plan.endsOn', { price: amount, date: formatDate(cancelAt) })
    : t('plan.renews', {
        price: amount,
        date: formatDate(new Date(subscription.currentPeriodEnd)),
      });

  return (
    <PlanCard
      plan={planOf(plans, subscription.offer) ?? Plan.Premium}
      pill={
        <Badge
          variant="outline"
          size="sm"
          className={cn('border-transparent', ON_CARD[pill.tone])}
        >
          {pill.label}
        </Badge>
      }
      details={details}
      actions={<PortalButton variant="line" />}
    />
  );
};

const ResumeButton: React.FC = () => {
  const t = useTranslations('Settings.subscription.resume');
  const { mutate: resumeSubscription, isPending } = useMutation(
    resumeSubscriptionOptions(),
  );

  const handleResume = () => {
    if (isPending) return;

    resumeSubscription(undefined, {
      onSuccess: () => toast.success(t('success')),
      onError: (error) => toast.error(error.data.message),
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={isPending}
      onClick={handleResume}
    >
      {t('action')}
    </Button>
  );
};

const CancellationNotice: React.FC<{ cancelAt: Date }> = ({ cancelAt }) => {
  const t = useTranslations('Settings.subscription.cancellationNotice');
  const format = useFormatter();

  return (
    <Alert variant="warning">
      <CalendarClock aria-hidden />
      <AlertTitle>
        {t('title', {
          date: format.dateTime(cancelAt, { dateStyle: 'long' }),
        })}
      </AlertTitle>
      <AlertDescription>{t('description')}</AlertDescription>
      <AlertActions>
        <ResumeButton />
      </AlertActions>
    </Alert>
  );
};

const PaymentIssueNotice: React.FC = () => {
  const t = useTranslations('Settings.subscription.paymentIssue');
  const { data: invoices } = useQuery(listInvoicesOptions());
  const openInvoice = invoices?.items.find(
    ({ status, hostedUrl }) => status === 'open' && hostedUrl,
  );

  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden />
      <AlertTitle>{t('title')}</AlertTitle>
      <AlertDescription>{t('description')}</AlertDescription>
      <AlertActions>
        {openInvoice?.hostedUrl ? (
          <Button variant="danger" size="sm" asChild>
            <a href={openInvoice.hostedUrl} target="_blank" rel="noreferrer">
              {t('pay')}
              <ExternalLink data-icon="inline-end" aria-hidden />
            </a>
          </Button>
        ) : (
          <PortalButton variant="danger" size="sm">
            {t('updateCard')}
          </PortalButton>
        )}
      </AlertActions>
    </Alert>
  );
};

export const SubscriptionOverview: React.FC = () => {
  const t = useTranslations('Settings');
  const {
    data: subscription,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery(retrieveSubscriptionOptions());
  const { isPending: isAccountPending } = useBillingAccount();
  const plan = usePlan();

  if (isError)
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden />
        <AlertTitle>{t('subscription.plan.loadError')}</AlertTitle>
        <AlertDescription>
          {t('subscription.plan.loadErrorHint')}
        </AlertDescription>
        <AlertActions>
          <Button
            variant="secondary"
            size="sm"
            loading={isRefetching}
            onClick={() => refetch()}
          >
            {t('retry')}
          </Button>
        </AlertActions>
      </Alert>
    );

  // A free plan words itself after the invoices, wait for them too.
  if (isPending || (!subscription && isAccountPending))
    return <PlanCardSkeleton />;

  // The plan stored on the user is what grants features, a subscription only
  // bills for one.
  if (!subscription)
    return plan === Plan.Free || plan === Plan.Anonymous ? (
      <FreePlanCard />
    ) : (
      <GrantedPlanCard plan={plan} />
    );

  const cancelAt = subscription.cancelAt && new Date(subscription.cancelAt);

  return (
    <>
      <SubscriptionCard subscription={subscription} />
      {PAYMENT_ISSUE_STATUSES.includes(subscription.status) && (
        <PaymentIssueNotice />
      )}
      {cancelAt && <CancellationNotice cancelAt={cancelAt} />}
    </>
  );
};
