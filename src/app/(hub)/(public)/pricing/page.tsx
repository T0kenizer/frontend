import { Main } from '@components/layout/main';
import { PricingCompare } from '@components/pricing/sections/pricing-compare';
import { PricingCta } from '@components/pricing/sections/pricing-cta';
import { PricingIntro } from '@components/pricing/sections/pricing-intro';
import { PricingPlans } from '@components/pricing/sections/pricing-plans';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Pricing');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
};

const Page: React.FC = () => (
  <Main>
    <PricingIntro />
    <PricingPlans />
    <PricingCompare />
    <PricingCta />
  </Main>
);

export default Page;
