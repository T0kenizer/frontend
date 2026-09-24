import {
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import { Card } from '@components/ui/card';
import { BrowserFrame, PhoneFrame } from '@components/ui/device-frame';
import { LandingSection } from '@constants/landing';
import { cn } from '@lib/utils';
import Image from 'next/image';

const DESKTOP_SHOT = 'https://www.placecats.com/1280/800';
const MOBILE_SHOT = 'https://www.placecats.com/390/844';

type Shot = { device: 'browser' | 'phone'; src: string; alt: string };

const STEPS: readonly {
  title: string;
  description: string;
  shot: Shot;
}[] = [
  {
    title: 'Set up your table',
    description:
      'Name the seats, set the buy-in and the blinds. Your settings are remembered for next time.',
    shot: {
      device: 'browser',
      src: DESKTOP_SHOT,
      alt: 'The new game screen',
    },
  },
  {
    title: 'Your friends scan in',
    description:
      'A QR code on the TV, a seat to pick, and everyone gets their buy-in. No account needed to play.',
    shot: {
      device: 'phone',
      src: MOBILE_SHOT,
      alt: 'Picking a seat on a phone',
    },
  },
  {
    title: 'Just play',
    description:
      'Bets are recorded, the pot adds itself up, the blinds go up on time. At the end of the night, the tally is ready.',
    shot: {
      device: 'browser',
      src: DESKTOP_SHOT,
      alt: 'A table in progress',
    },
  },
];

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
}) => (
  <section
    id={LandingSection.HowItWorks}
    className={cn('scroll-mt-16 py-18 md:py-28', className)}
    {...props}
  >
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <LandingSectionHeading
        eyebrow="How it works"
        title="Three minutes from the couch to the first deal."
      />

      <LandingRevealGroup
        as="ol"
        stagger={0.15}
        className="mt-13 grid gap-5.5 lg:grid-cols-3"
      >
        {STEPS.map(({ title, description, shot }, index) => (
          <LandingRevealItem as="li" key={title} offset={32}>
            <Card size="lg" className="h-full gap-0 p-3.5 pb-6.5">
              <StepShot {...shot} />
              <div className="px-3 pt-6">
                <span className="bg-primary-soft text-primary grid size-7.5 place-items-center rounded-full text-xs font-extrabold">
                  {index + 1}
                </span>
                <h3 className="font-heading mt-3.5 text-xl font-extrabold tracking-tight">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </Card>
          </LandingRevealItem>
        ))}
      </LandingRevealGroup>
    </div>
  </section>
);
