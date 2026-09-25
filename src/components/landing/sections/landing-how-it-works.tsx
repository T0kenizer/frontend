import {
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import { Card } from '@components/ui/card';
import { BrowserFrame, PhoneFrame } from '@components/ui/device-frame';
import { LandingSection } from '@constants/landing';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const DESKTOP_SHOT = 'https://www.placecats.com/1280/800';
const MOBILE_SHOT = 'https://www.placecats.com/390/844';

type Shot = { device: 'browser' | 'phone'; src: string; alt: string };

/** Only what is not copy: the wording of each step lives in the messages. */
const STEPS = [
  { key: 'setup', device: 'browser', src: DESKTOP_SHOT },
  { key: 'scan', device: 'phone', src: MOBILE_SHOT },
  { key: 'play', device: 'browser', src: DESKTOP_SHOT },
] as const satisfies readonly {
  key: 'setup' | 'scan' | 'play';
  device: Shot['device'];
  src: string;
}[];

const StepShot: React.FC<Shot> = ({ device, src, alt }) =>
  device === 'browser' ? (
    <div className="bg-surface-sunk grid h-62.5 place-items-center overflow-hidden rounded-2xl">
      <BrowserFrame dots="colored" className="mt-4.5 h-5/6 w-11/12">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 64rem) 25vw, 90vw"
          className="object-cover object-top"
        />
      </BrowserFrame>
    </div>
  ) : (
    <div className="felt-surface grid h-62.5 place-items-center overflow-hidden rounded-2xl">
      <PhoneFrame>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="7rem"
          className="object-cover object-top"
        />
      </PhoneFrame>
    </div>
  );

export type LandingHowItWorksProps = React.ComponentProps<'section'>;

export const LandingHowItWorks: React.FC<LandingHowItWorksProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Landing.howItWorks');

  return (
    <section
      id={LandingSection.HowItWorks}
      className={cn('scroll-mt-16 py-18 md:py-28', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <LandingSectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <LandingRevealGroup
          as="ol"
          stagger={0.15}
          className="mt-13 grid gap-5.5 lg:grid-cols-3"
        >
          {STEPS.map(({ key, device, src }, index) => (
            <LandingRevealItem as="li" key={key} offset={32}>
              <Card size="lg" className="h-full gap-0 p-3.5 pb-6.5">
                <StepShot
                  device={device}
                  src={src}
                  alt={t(`steps.${key}.shotAlt`)}
                />
                <div className="px-3 pt-6">
                  <span className="bg-primary-soft text-primary grid size-7.5 place-items-center rounded-full text-xs font-extrabold">
                    {index + 1}
                  </span>
                  <h3 className="font-heading mt-3.5 text-xl font-extrabold tracking-tight">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              </Card>
            </LandingRevealItem>
          ))}
        </LandingRevealGroup>
      </div>
    </section>
  );
};
