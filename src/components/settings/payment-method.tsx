'use client';

import AmexLogo from '@assets/images/cards/amex.svg';
import CartesBancairesLogo from '@assets/images/cards/cartes_bancaires.svg';
import DinersLogo from '@assets/images/cards/diners.svg';
import DiscoverLogo from '@assets/images/cards/discover.svg';
import JcbLogo from '@assets/images/cards/jcb.svg';
import MastercardLogo from '@assets/images/cards/mastercard.svg';
import UnionpayLogo from '@assets/images/cards/unionpay.svg';
import VisaLogo from '@assets/images/cards/visa.svg';
import { SettingsSection } from '@components/settings/settings-section';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Skeleton } from '@components/ui/skeleton';
import { useBillingAccount } from '@hooks/use-billing-account';
import { retrievePaymentMethodOptions } from '@services/subscriptions/subscriptions.options';
import { buildBillingPortalUrl } from '@services/subscriptions/subscriptions.utils';
import { useQuery } from '@tanstack/react-query';
import type { PaymentMethod } from '@tokenizer/shared/types';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image, { type StaticImageData } from 'next/image';

const BRAND_LOGOS: Record<string, StaticImageData> = {
  amex: AmexLogo,
  cartes_bancaires: CartesBancairesLogo,
  diners: DinersLogo,
  discover: DiscoverLogo,
  jcb: JcbLogo,
  mastercard: MastercardLogo,
  unionpay: UnionpayLogo,
  visa: VisaLogo,
};

const BrandMark: React.FC<{ brand: string }> = ({ brand }) => {
  const logo = BRAND_LOGOS[brand];

  if (logo)
    return (
      <Image src={logo} alt="" aria-hidden className="h-7.5 w-auto shrink-0" />
    );

  return (
    <span
      aria-hidden
      className="bg-night-880 flex h-7.5 w-11 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-extrabold tracking-wider text-white"
    >
      {brand.slice(0, 4).toUpperCase()}
    </span>
  );
};

// A card stays valid through the last day of its expiry month.
const isExpired = ({ expMonth, expYear }: PaymentMethod) =>
  new Date(expYear, expMonth) <= new Date();

const CardRow: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const t = useTranslations('Settings.subscription.paymentMethod');
  const expiry = `${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`;
  const expired = isExpired(method);

  return (
    <div className="flex flex-wrap items-center gap-3 py-3.5">
      <BrandMark brand={method.brand} />
      <div className="space-y-1">
        <p className="text-sm leading-none font-semibold">
          <span className="sr-only">
            {t('cardEnding', { brand: method.brand })}
          </span>
          <span aria-hidden>•••• </span>
          {method.last4}
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs leading-none font-light">
          {t('expires', { expiry })}
          {expired && <Badge variant="destructive">{t('expired')}</Badge>}
        </p>
      </div>
      <Button variant="secondary" size="sm" className="ml-auto" asChild>
        <a href={buildBillingPortalUrl()}>
          {t('update')}
          <ExternalLink data-icon="inline-end" aria-hidden />
        </a>
      </Button>
    </div>
  );
};

const CardRowSkeleton: React.FC = () => (
  <div aria-busy className="flex items-center gap-3 py-3.5">
    <Skeleton className="h-7.5 w-11 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-7 w-32" />
  </div>
);

const PaymentMethodBody: React.FC = () => {
  const t = useTranslations('Settings');
  const {
    data: method,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery(retrievePaymentMethodOptions());

  if (isError)
    return (
      <div className="flex flex-wrap items-center gap-3 py-3.5">
        <p className="text-destructive text-sm">
          {t('subscription.paymentMethod.loadError')}
        </p>
        <Button
          variant="ghost"
          size="sm"
          loading={isRefetching}
          onClick={() => refetch()}
        >
          {t('retry')}
        </Button>
      </div>
    );

  if (isPending) return <CardRowSkeleton />;

  if (!method)
    return (
      <div className="flex flex-wrap items-center gap-3 py-3.5">
        <p className="text-muted-foreground text-sm font-light">
          {t('subscription.paymentMethod.none')}
        </p>
        <Button variant="secondary" size="sm" className="ml-auto" asChild>
          <a href={buildBillingPortalUrl()}>
            {t('subscription.paymentMethod.add')}
            <ExternalLink data-icon="inline-end" aria-hidden />
          </a>
        </Button>
      </div>
    );

  return <CardRow method={method} />;
};

export const PaymentMethodSection: React.FC = () => {
  const t = useTranslations('Settings.subscription.paymentMethod');
  const { hasBillingAccount, isPending } = useBillingAccount();

  // Without a Stripe customer there is no card to show nor portal to add one.
  if (!isPending && !hasBillingAccount) return null;

  return (
    <SettingsSection title={t('title')}>
      {isPending ? <CardRowSkeleton /> : <PaymentMethodBody />}
    </SettingsSection>
  );
};
