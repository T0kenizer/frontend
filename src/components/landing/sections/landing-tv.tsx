import {
  LandingFeaturePoints,
  type LandingFeaturePoint,
} from '@components/landing/landing-feature-points';
import { LandingReveal } from '@components/landing/landing-reveal';
import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import { TvFrame } from '@components/ui/device-frame';
import { LandingSection } from '@constants/landing';
import { cn } from '@lib/utils';
import { CircleDot, QrCode, Timer } from 'lucide-react';
import Image from 'next/image';

const ROOM_PHOTO = 'https://www.placecats.com/1600/1200';
const TV_SHOT = 'https://www.placecats.com/1920/1080';

const POINTS: readonly LandingFeaturePoint[] = [
  {
    icon: Timer,
    title: 'Timed blinds',
    description: 'The next level shows up with its countdown.',
  },
  {
    icon: CircleDot,
    title: 'The pot, live',
    description: 'Every bet lands on the table the moment it is made.',
  },
  {
    icon: QrCode,
    title: 'The QR code, always on screen',
    description: 'Latecomers join the table without stopping the hand.',
  },
];

export type LandingTvProps = React.ComponentProps<'section'>;

export const LandingTv: React.FC<LandingTvProps> = ({
  className,
  ...props
}) => (
  <section
    id={LandingSection.Tv}
    className={cn('scroll-mt-16 pt-5 pb-18 md:pb-28', className)}
    {...props}
  >
    <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
      <div className="relative mb-6 lg:mb-8">
        <LandingReveal className="relative aspect-4/3 overflow-hidden rounded-2xl">
          <Image
            src={ROOM_PHOTO}
            alt="A living room with the table showing on the wall-mounted TV"
            fill
            sizes="(min-width: 64rem) 50vw, 100vw"
            className="object-cover"
          />
        </LandingReveal>
        <LandingReveal
          delay={0.3}
          offset={40}
          className="absolute right-3 -bottom-6 w-3/5 lg:-right-6.5 lg:-bottom-8.5"
        >
          <TvFrame>
            <Image
              src={TV_SHOT}
              alt="The full-screen TV view of a table"
              fill
              sizes="(min-width: 64rem) 30vw, 60vw"
              className="object-cover"
            />
          </TvFrame>
        </LandingReveal>
      </div>

      <div>
        <LandingSectionHeading
          eyebrow="On the TV"
          title="The whole table, on the big screen."
          description="Cast the game to the living-room screen: the pot, the stacks and the next blind level are readable from the couch."
        />
        <LandingFeaturePoints points={POINTS} className="mt-7.5" />
      </div>
    </div>
  </section>
);
