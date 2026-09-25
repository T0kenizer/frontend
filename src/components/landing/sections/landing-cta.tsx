import { LandingJoinCode } from '@components/landing/landing-join-code';
import { LandingReveal } from '@components/landing/landing-reveal';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export type LandingCtaProps = React.ComponentProps<'section'>;

export const LandingCta: React.FC<LandingCtaProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Landing.cta');

  return (
    <section className={cn('py-24', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <LandingReveal
          offset={40}
          className="felt-surface text-on-media-foreground flex flex-col gap-10 overflow-hidden rounded-4xl px-7 py-11 md:px-14 md:py-16 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="font-heading max-w-md text-3xl leading-tight font-extrabold tracking-tighter text-balance sm:text-4xl">
              {t('title')}
            </h2>
            <p className="text-on-media-foreground/80 mt-3.5 max-w-md leading-relaxed">
              {t('description')}
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-80">
            <Button size="xl" className="w-full" asChild>
              <Link href={ROUTES.auth.signUp()}>{t('action')}</Link>
            </Button>
            <LandingJoinCode label={t('codeLabel')} className="max-w-none" />
          </div>
        </LandingReveal>
      </div>
    </section>
  );
};
