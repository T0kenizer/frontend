import { CancelSubscriptionSection } from '@components/settings/cancel-subscription-section';
import { InvoicesSection } from '@components/settings/invoices-list';
import { PaymentMethodSection } from '@components/settings/payment-method';
import { SettingsTabContainer } from '@components/settings/setting-tab-container';
import { SubscriptionOverview } from '@components/settings/subscription-overview';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Settings.subscription');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => (
  <SettingsTabContainer aria-live="polite">
    <SubscriptionOverview />
    <PaymentMethodSection />
    <InvoicesSection />
    <CancelSubscriptionSection />
  </SettingsTabContainer>
);

export default Page;
