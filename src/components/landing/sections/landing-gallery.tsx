import {
  LandingReveal,
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@components/ui/carousel';
import { APP_NAME } from '@constants/index';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const PHOTOS = [
  {
    key: 'friends',
    src: 'https://www.placecats.com/900/1200',
    className: 'col-span-3 row-span-2',
    sizes: '35vw',
  },
  {
    key: 'chips',
    src: 'https://www.placecats.com/800/600',
    className: 'col-span-2',
    sizes: '25vw',
  },
  {
    key: 'host',
    src: 'https://www.placecats.com/800/600',
    className: 'col-span-2',
    sizes: '25vw',
  },
  {
    key: 'table',
    src: 'https://www.placecats.com/1600/600',
    className: 'col-span-4',
    sizes: '50vw',
  },
] as const;

export type LandingGalleryProps = React.ComponentProps<'section'>;

export const LandingGallery: React.FC<LandingGalleryProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Landing.gallery');

  return (
    <section
      className={cn('felt-surface py-25 md:pb-27.5', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <LandingSectionHeading
          tone="felt"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description', { appName: APP_NAME })}
        />

        <LandingReveal className="md:hidden">
          <Carousel
            opts={{ align: 'start' }}
            className="text-on-media-foreground mt-12"
          >
            <CarouselContent>
              {PHOTOS.map(({ key, src }) => (
                <CarouselItem key={key} className="basis-4/5">
                  <figure className="relative aspect-4/3 overflow-hidden rounded-2xl">
                    <Image
                      src={src}
                      alt={t(`photos.${key}`)}
                      fill
                      sizes="80vw"
                      className="object-cover"
                    />
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselDots className="mt-5" />
          </Carousel>
        </LandingReveal>

        <LandingRevealGroup
          stagger={0.12}
          className="mt-12 hidden h-134 grid-cols-7 grid-rows-2 gap-4 md:grid"
        >
          {PHOTOS.map(({ key, src, className, sizes }) => (
            <LandingRevealItem
              key={key}
              className={cn('relative overflow-hidden rounded-2xl', className)}
            >
              <figure className="absolute inset-0">
                <Image
                  src={src}
                  alt={t(`photos.${key}`)}
                  fill
                  sizes={sizes}
                  className="object-cover"
                />
              </figure>
            </LandingRevealItem>
          ))}
        </LandingRevealGroup>
      </div>
    </section>
  );
};
