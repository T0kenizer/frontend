import { FeltEyebrow } from '@components/game/felt/felt-stage';
import {
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { cn } from '@lib/utils';

export type LandingSectionHeadingProps = Omit<
  React.ComponentProps<'div'>,
  'title'
> & {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: 'default' | 'felt';
};

export const LandingSectionHeading: React.FC<LandingSectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  tone = 'default',
  className,
  ...props
}) => (
  <div className={className} {...props}>
    <LandingRevealGroup>
      <LandingRevealItem>
        <FeltEyebrow
          className={cn(
            tone === 'felt'
              ? 'border-on-media-border bg-on-media text-on-media-foreground w-fit rounded-full border px-3.5 py-1.5 backdrop-blur-sm'
              : 'text-teal-600',
          )}
        >
          {eyebrow}
        </FeltEyebrow>
      </LandingRevealItem>
      <LandingRevealItem>
        <h2
          className={cn(
            'font-heading mt-3 max-w-lg text-3xl leading-tight font-extrabold tracking-tighter text-balance sm:text-4xl',
            tone === 'felt' && 'text-on-media-foreground',
          )}
        >
          {title}
        </h2>
      </LandingRevealItem>
      {description && (
        <LandingRevealItem>
          <p
            className={cn(
              'mt-4 max-w-prose leading-relaxed text-pretty',
              tone === 'felt'
                ? 'text-on-media-foreground/80'
                : 'text-muted-foreground',
            )}
          >
            {description}
          </p>
        </LandingRevealItem>
      )}
    </LandingRevealGroup>
  </div>
);
