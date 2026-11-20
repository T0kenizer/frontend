import { CancelSubscriptionSection } from '@components/settings/cancel-subscription-section';
import { InvoicesSection } from '@components/settings/invoices-list';
import { PaymentMethodSection } from '@components/settings/payment-method';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SubscriptionOverview } from '@components/settings/subscription-overview';
import { NEXT_PUBLIC_STRIPE_ENABLED } from '@lib/env';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.subscription');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => {
  if (!NEXT_PUBLIC_STRIPE_ENABLED) notFound();

  return (
    <SettingsTabContainer aria-live="polite">
      <SubscriptionOverview />
      <PaymentMethodSection />
      <InvoicesSection />
      <CancelSubscriptionSection />
    </SettingsTabContainer>
  );
};

export default Page;
