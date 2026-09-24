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
import { cn } from '@lib/utils';
import Image from 'next/image';

const PHOTOS = [
  {
    src: 'https://www.placecats.com/900/1200',
    alt: 'Friends laughing around the table',
    className: 'col-span-3 row-span-2',
    sizes: '35vw',
  },
  {
    src: 'https://www.placecats.com/800/600',
    alt: 'A close-up of a stack of chips',
    className: 'col-span-2',
    sizes: '25vw',
  },
  {
    src: 'https://www.placecats.com/800/600',
    alt: 'The host in front of the TV',
    className: 'col-span-2',
    sizes: '25vw',
  },
  {
    src: 'https://www.placecats.com/1600/600',
    alt: 'The table from above, phones lying on the felt',
    className: 'col-span-4',
    sizes: '50vw',
  },
] as const;

export type LandingGalleryProps = React.ComponentProps<'section'>;

export const LandingGallery: React.FC<LandingGalleryProps> = ({
  className,
  ...props
}) => (
  <section
    className={cn('felt-surface py-25 md:pb-27.5', className)}
    {...props}
  >
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <LandingSectionHeading
        tone="felt"
        eyebrow="Game nights, not bookkeeping"
        title="Everyone at the table, no one stuck at the bank."
        description="The host gets to play too. Tokenizer takes care of the rest."
      />

      <LandingReveal className="md:hidden">
        <Carousel
          opts={{ align: 'start' }}
          className="text-on-media-foreground mt-12"
        >
          <CarouselContent>
            {PHOTOS.map(({ src, alt }) => (
              <CarouselItem key={alt} className="basis-4/5">
                <figure className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src={src}
                    alt={alt}
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
        {PHOTOS.map(({ src, alt, className, sizes }) => (
          <LandingRevealItem
            key={alt}
            className={cn('relative overflow-hidden rounded-2xl', className)}
          >
            <figure className="absolute inset-0">
              <Image
                src={src}
                alt={alt}
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
