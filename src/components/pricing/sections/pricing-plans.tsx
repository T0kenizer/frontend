'use client';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Chip } from '@components/ui/chip';
import ROUTES from '@constants/routes';
import { type PricingOffer, usePricingOffers } from '@hooks/use-pricing';
import { cn } from '@lib/utils';
import { formatPrice } from '@services/plans/plans.utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { Plan } from '@tokenizer/shared/types';
import { Check, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export const FOUNDER_NOTE_ID = 'founder-note';

const PLAN_STYLES: Record<
  PricingOffer['plan'],
  {
    card: string;
    check: string;
    muted: string;
    badge?: React.ComponentProps<typeof Badge>['variant'];
    action: React.ComponentProps<typeof Button>['variant'];
  }
> = {
  [Plan.Free]: {
    card: 'bg-card border',
    check: 'text-teal-600',
    muted: 'text-muted-foreground',
    action: 'secondary',
  },
  [Plan.Premium]: {
    card: 'bg-card border-primary border-2 shadow-[0_30px_60px_-26px_var(--primary-glow-strong)] lg:-translate-y-3.5',
    check: 'text-primary',
    muted: 'text-muted-foreground',
    badge: 'default',
    action: 'primary',
  },
  [Plan.Founder]: {
    card: 'felt-surface text-on-media-foreground',
    check: 'text-gold',
    muted: 'text-on-media-foreground/80',
    badge: 'gold',
    action: 'felt-inverse',
  },
};

const PlanAction: React.FC<{ offer: PricingOffer; className?: string }> = ({
  offer: { plan, offer, isCurrent },
  className,
}) => {
  const t = useTranslations('Pricing.plans');
  const { data: session } = useQuery(retrieveSessionOptions());
  const isAuthenticated = !!session?.user;
  const variant = PLAN_STYLES[plan].action;

  if (isCurrent) {
    return (
      <Button size="xl" variant={variant} className={className} disabled>
        {t('current')}
      </Button>
    );
  }

  if (!offer) {
    return (
      <Button size="xl" variant={variant} className={className} asChild>
        <Link href={ROUTES.home(isAuthenticated)}>{t(`${plan}.action`)}</Link>
      </Button>
    );
  }

  // A plain link: the checkout route redirects out to Stripe (or to sign-in).
  return (
    <Button size="xl" variant={variant} className={className} asChild>
      <a href={ROUTES.subscription(offer)}>{t(`${plan}.action`)}</a>
    </Button>
  );
};

const PlanCard: React.FC<{ offer: PricingOffer }> = ({ offer }) => {
  const t = useTranslations('Pricing.plans');
  const locale = useLocale();
  const { plan, price, maxSeats, sandbox } = offer;
  const styles = PLAN_STYLES[plan];

  const features: React.ReactNode[] = [
    plan === Plan.Free ? t('features.createGame') : null,
    plan === Plan.Free ? t('features.joinGame') : null,
    plan === Plan.Premium ? t('features.allFree') : null,
    t.rich('features.maxSeats', {
      count: maxSeats,
      b: (chunks) => <b className="font-bold">{chunks}</b>,
    }),
    sandbox
      ? t.rich('features.sandbox', {
          b: (chunks) => <b className="font-bold">{chunks}</b>,
        })
      : t('features.poker'),
    plan === Plan.Premium ? t('features.createAndJoin') : null,
    plan === Plan.Founder
      ? t.rich('features.oneTime', {
          b: (chunks) => <b className="font-bold">{chunks}</b>,
        })
      : null,
    plan === Plan.Founder ? t('features.founderStatus') : null,
  ].filter(Boolean);

  return (
    <article
      id={`plan-${plan.toLowerCase()}`}
      data-plan={plan}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl px-7 pt-7.5 pb-7 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.28)]',
        styles.card,
      )}
    >
      {plan === Plan.Founder && (
        <Chip
          denomination="1k"
          size={48}
          alt=""
          aria-hidden
          className="absolute top-5.5 right-5.5 -rotate-14"
        />
      )}
      <div className="flex min-h-6.5 items-center gap-2.5">
        <h2 className="text-lg font-extrabold tracking-tight">
          {t(`${plan}.name`)}
        </h2>
        {plan !== Plan.Free && (
          <Badge
            variant={styles.badge}
            className="font-extrabold tracking-widest uppercase"
          >
            {t(`${plan}.badge`)}
          </Badge>
        )}
      </div>
      <p
        className={cn(
          'mt-2 min-h-[2.6em] text-sm leading-normal text-pretty',
          styles.muted,
        )}
      >
        {plan === Plan.Founder
          ? t.rich(`${plan}.tagline`, {
              ast: (chunks) => (
                <a
                  href={`#${FOUNDER_NOTE_ID}`}
                  aria-describedby={FOUNDER_NOTE_ID}
                  className="text-gold hover:text-on-media-foreground ml-px font-extrabold"
                >
                  {chunks}
                </a>
              ),
            })
          : t(`${plan}.tagline`)}
      </p>
      <div className="mt-5.5 flex flex-wrap items-baseline gap-1.5">
        <span className="text-5xl leading-none font-extrabold tracking-tighter tabular-nums">
          {formatPrice(price, locale)}
        </span>
        {price && (
          <span className={cn('text-sm font-semibold', styles.muted)}>
            {t('interval', { interval: price.interval ?? 'once' })}
          </span>
        )}
      </div>
      <p className={cn('mt-2 min-h-[1.4em] text-xs', styles.muted)}>
        {t(`${plan}.note`)}
      </p>
      <PlanAction offer={offer} className="mt-6 w-full" />
      <ul
        className={cn(
          'mt-6 grid gap-3 border-t pt-5.5',
          plan === Plan.Founder && 'border-on-media-border',
        )}
      >
        {features.map((feature, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-snug">
            <Check
              className={cn('mt-px size-4.5 shrink-0', styles.check)}
              strokeWidth={2.4}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};

const REASSURANCES = [
  { key: 'guests', icon: Smartphone },
  { key: 'stripe', icon: ShieldCheck },
  { key: 'cancel', icon: RotateCcw },
] as const;

export type PricingPlansProps = React.ComponentProps<'section'>;

export const PricingPlans: React.FC<PricingPlansProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Pricing');
  const offers = usePricingOffers();
  const hasFounder = offers.some(({ plan }) => plan === Plan.Founder);

  return (
    <section className={cn('relative z-1', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div
          className={cn(
            '-mt-32 grid gap-5.5 lg:items-stretch',
            'mx-auto max-w-lg lg:max-w-none',
            offers.length === 3 && 'lg:grid-cols-3',
            offers.length === 2 && 'lg:mx-auto lg:max-w-3xl lg:grid-cols-2',
          )}
        >
          {offers.map((offer) => (
            <PlanCard key={offer.plan} offer={offer} />
          ))}
        </div>

        <ul className="text-muted-foreground mt-11 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm">
          {REASSURANCES.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-2">
              <Icon className="size-4 text-teal-600" aria-hidden />
              {t(`reassurance.${key}`)}
            </li>
          ))}
        </ul>

        {hasFounder && (
          <p
            id={FOUNDER_NOTE_ID}
            className="text-muted-foreground target:text-foreground mx-auto mt-5.5 max-w-[72ch] text-center text-xs leading-relaxed"
          >
            {t('plans.FOUNDER.footnote')}
          </p>
        )}
      </div>
    </section>
  );
};
