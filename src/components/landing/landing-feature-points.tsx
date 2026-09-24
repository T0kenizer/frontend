import {
  LandingRevealGroup,
  LandingRevealItem,
  type LandingRevealGroupProps,
} from '@components/landing/landing-reveal';
import { cn } from '@lib/utils';
import type { LucideIcon } from 'lucide-react';

export type LandingFeaturePoint = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type LandingFeaturePointsProps = Omit<
  LandingRevealGroupProps,
  'as' | 'children'
> & {
  points: readonly LandingFeaturePoint[];
};

export const LandingFeaturePoints: React.FC<LandingFeaturePointsProps> = ({
  points,
  className,
  ...props
}) => (
  <LandingRevealGroup
    as="ul"
    className={cn('grid gap-4.5', className)}
    {...props}
  >
    {points.map(({ icon: Icon, title, description }) => (
      <LandingRevealItem
        as="li"
        key={title}
        offset={16}
        className="flex items-start gap-3.5"
      >
        <span className="bg-primary-soft text-primary grid size-9 shrink-0 place-items-center rounded-md">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <span>
          <span className="block font-bold tracking-tight">{title}</span>
          <span className="text-muted-foreground mt-0.5 block text-sm leading-relaxed">
            {description}
          </span>
        </span>
      </LandingRevealItem>
    ))}
  </LandingRevealGroup>
);
