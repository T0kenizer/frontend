import ChipsCluster4Shadow from '@assets/images/chips-cluster-4-shadow.png';
import { FeltEyebrow } from '@components/game/felt/felt-stage';
import { LandingJoinCode } from '@components/landing/landing-join-code';
import {
  LandingDrawnUnderline,
  LandingReveal,
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { Button } from '@components/ui/button';
import { LandingSection } from '@constants/landing';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const HERO_PHOTO = 'https://www.placecats.com/1600/1200';

export type LandingHeroProps = React.ComponentProps<'section'>;

export const LandingHero: React.FC<LandingHeroProps> = ({
  className,
  ...props
}) => (
  <section
    className={cn(
      'felt-surface text-on-media-foreground flex min-h-svh items-center overflow-hidden',
      className,
    )}
    {...props}
  >
    <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-16">
      <LandingRevealGroup immediate stagger={0.12} delay={0.1}>
        <LandingRevealItem>
          <FeltEyebrow className="border-on-media-border bg-on-media text-on-media-foreground w-fit rounded-full border px-3.5 py-1.5 backdrop-blur-sm">
            Your game night&apos;s bank
          </FeltEyebrow>
        </LandingRevealItem>
        <LandingRevealItem>
          <h1 className="font-heading mt-5 max-w-xl text-5xl leading-none font-extrabold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
            You play. We{' '}
            <em className="relative whitespace-nowrap not-italic">
              count
              <LandingDrawnUnderline
                delay={0.8}
                className="from-primary to-warning absolute inset-x-0 bottom-1 h-1.5 rounded-full bg-linear-to-r sm:h-2"
              />
            </em>{' '}
            the chips.
          </h1>
        </LandingRevealItem>
        <LandingRevealItem>
          <p className="text-on-media-foreground/85 mt-5 max-w-md text-lg leading-relaxed">
            Buy-ins, rebuys, blinds and pots: Tokenizer keeps the bank on the
            living-room TV, and everyone bets from their phone.
          </p>
        </LandingRevealItem>
        <LandingRevealItem className="mt-8 flex flex-wrap gap-3">
          <Button size="xl" asChild>
            <Link href={ROUTES.auth.signUp()}>Open my first table</Link>
          </Button>
          <Button size="xl" variant="line" className="backdrop-blur-sm" asChild>
            <Link href={ROUTES.landing(LandingSection.HowItWorks)}>
              See how it works
            </Link>
          </Button>
        </LandingRevealItem>
        <LandingRevealItem>
          <LandingJoinCode className="mt-6" />
        </LandingRevealItem>
      </LandingRevealGroup>

      <div className="relative">
        <LandingReveal immediate delay={0.3} offset={32}>
          <Image
            src={HERO_PHOTO}
            alt="Friends around a poker table, the game showing on the TV"
            width={1600}
            height={1200}
            priority
            sizes="(min-width: 64rem) 50vw, 100vw"
            className="h-auto w-full rounded-2xl shadow-2xl"
          />
        </LandingReveal>
        <LandingReveal
          immediate
          delay={0.75}
          offset={-24}
          className="pointer-events-none absolute -right-3 -bottom-8 w-28 sm:-right-6 sm:-bottom-10 sm:w-44"
        >
          <Image src={ChipsCluster4Shadow} alt="" priority className="w-full" />
        </LandingReveal>
      </div>
    </div>
  </section>
);
