import {
  LandingFeaturePoints,
  type LandingFeaturePoint,
} from '@components/landing/landing-feature-points';
import { LandingReveal } from '@components/landing/landing-reveal';
import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import { PhoneFrame } from '@components/ui/device-frame';
import { LandingSection } from '@constants/landing';
import { cn } from '@lib/utils';
import { ChartNoAxesColumn, Plus, Vibrate } from 'lucide-react';
import Image from 'next/image';

const HAND_PHOTO = 'https://www.placecats.com/1200/1500';
const PHONE_SHOT = 'https://www.placecats.com/390/844';

const POINTS: readonly LandingFeaturePoint[] = [
  {
    icon: Plus,
    title: 'Call, raise, fold',
    description: "The game's actions, and only those.",
  },
  {
    icon: Vibrate,
    title: "It buzzes when it's your turn",
    description: 'Put your phone down and talk to the others.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'The tally at the end',
    description: 'Who owes what to whom, worked out before anyone leaves.',
  },
];

export type LandingPhoneProps = React.ComponentProps<'section'>;

export const LandingPhone: React.FC<LandingPhoneProps> = ({
  className,
  ...props
}) => (
  <section
    id={LandingSection.Phone}
    className={cn('scroll-mt-16 pt-10 pb-18 md:pb-28', className)}
    {...props}
  >
    <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
      <div>
        <LandingSectionHeading
          eyebrow="On your phone"
          title="Your stack, in your pocket."
          description="Every player sees their balance and bets with a tap. No more chips sliding around, no more “wait, how much did you put in?”."
        />
        <LandingFeaturePoints points={POINTS} className="mt-7.5" />
      </div>

      <div className="relative order-first mb-8 flex items-center sm:mb-0 lg:order-none">
        <LandingReveal className="relative aspect-4/5 w-full min-w-0 flex-1 overflow-hidden rounded-2xl">
          <Image
            src={HAND_PHOTO}
            alt="A hand holding a phone above a pile of chips"
            fill
            sizes="(min-width: 64rem) 35vw, 80vw"
            className="object-cover"
          />
        </LandingReveal>
        <LandingReveal
          delay={0.3}
          offset={40}
          className="absolute right-3 -bottom-8 z-10 shrink-0 sm:static sm:-ml-22.5"
        >
          <PhoneFrame size="lg">
            <Image
              src={PHONE_SHOT}
              alt="A player's stack and actions on their phone"
              fill
              sizes="(min-width: 40rem) 15rem, 8rem"
              className="object-cover object-top"
            />
          </PhoneFrame>
        </LandingReveal>
      </div>
    </div>
  </section>
);
