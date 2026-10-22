import { FeltEyebrow } from '@components/game/felt/felt-stage';
import {
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';

export type PricingIntroProps = React.ComponentProps<'section'>;

export const PricingIntro: React.FC<PricingIntroProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Pricing.intro');

  return (
    <section
      className={cn(
        'felt-surface text-on-media-foreground overflow-hidden pt-36 pb-48 text-center',
        className,
      )}
      {...props}
    >
      <LandingRevealGroup
        immediate
        stagger={0.12}
        delay={0.1}
        className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 sm:px-8"
      >
        <LandingRevealItem>
          <FeltEyebrow className="border-on-media-border bg-on-media text-on-media-foreground w-fit rounded-full border px-3.5 py-1.5 backdrop-blur-sm">
            {t('eyebrow')}
          </FeltEyebrow>
        </LandingRevealItem>
        <LandingRevealItem>
          <h1 className="font-heading mt-5 max-w-[16ch] text-4xl leading-none font-extrabold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
        </LandingRevealItem>
        <LandingRevealItem>
          <p className="text-on-media-foreground/85 mt-5 max-w-md text-lg leading-relaxed text-pretty">
            {t('description')}
          </p>
        </LandingRevealItem>
      </LandingRevealGroup>
    </section>
  );
};
