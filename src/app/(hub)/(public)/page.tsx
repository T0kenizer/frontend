import { LandingCta } from '@components/landing/sections/landing-cta';
import { LandingGallery } from '@components/landing/sections/landing-gallery';
import { LandingHero } from '@components/landing/sections/landing-hero';
import { LandingHowItWorks } from '@components/landing/sections/landing-how-it-works';
import { LandingPhone } from '@components/landing/sections/landing-phone';
import { LandingTv } from '@components/landing/sections/landing-tv';
import { Main } from '@components/layout/main';

const Page: React.FC = () => (
  <Main>
    <LandingHero />
    <LandingHowItWorks />
    <LandingTv />
    <LandingPhone />
    <LandingGallery />
    <LandingCta />
  </Main>
);

export default Page;
