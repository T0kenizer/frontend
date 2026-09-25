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
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const HAND_PHOTO = 'https://www.placecats.com/1200/1500';
const PHONE_SHOT = 'https://www.placecats.com/390/844';

const POINTS = [
  { key: 'actions', icon: Plus },
  { key: 'turn', icon: Vibrate },
  { key: 'tally', icon: ChartNoAxesColumn },
] as const;

export type LandingPhoneProps = React.ComponentProps<'section'>;

export const LandingPhone: React.FC<LandingPhoneProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Landing.phone');

  const points: LandingFeaturePoint[] = POINTS.map(({ key, icon }) => ({
    icon,
    title: t(`points.${key}.title`),
    description: t(`points.${key}.description`),
  }));

  return (
    <section
      id={LandingSection.Phone}
      className={cn('scroll-mt-16 pt-10 pb-18 md:pb-28', className)}
      {...props}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <LandingSectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
          <LandingFeaturePoints points={points} className="mt-7.5" />
        </div>

        <div className="relative order-first mb-8 flex items-center sm:mb-0 lg:order-none">
          <LandingReveal className="relative aspect-4/5 w-full min-w-0 flex-1 overflow-hidden rounded-2xl">
            <Image
              src={HAND_PHOTO}
              alt={t('handAlt')}
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
                alt={t('screenAlt')}
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
};
