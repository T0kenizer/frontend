'use client';

import { Badge } from '@components/ui/badge';
import { cn } from '@lib/utils';
import { Plan, type UserPlan } from '@tokenizer/shared/types';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PlanBadgeStyle {
  variant: React.ComponentProps<typeof Badge>['variant'];
  className?: string;
  icon?: LucideIcon;
}

const PLAN_BADGE_STYLES: Record<UserPlan, PlanBadgeStyle> = {
  // Follows the text around it, so it reads on a navbar as well as on a card.
  [Plan.Free]: {
    variant: 'outline',
    className: 'border-current/30 text-current',
  },
  [Plan.Premium]: { variant: 'default' },
  [Plan.Founder]: { variant: 'gold' },
};

export type PlanBadgeProps = Omit<
  React.ComponentProps<typeof Badge>,
  'variant' | 'children'
> & {
  plan: UserPlan;
};

export const PlanBadge: React.FC<PlanBadgeProps> = ({
  plan,
  size = 'sm',
  className,
  ...props
}) => {
  const t = useTranslations('Plans');
  const {
    variant,
    icon: Icon,
    className: planClassName,
  } = PLAN_BADGE_STYLES[plan];

  return (
    <Badge
      data-plan={plan}
      variant={variant}
      size={size}
      className={cn(planClassName, className)}
      {...props}
    >
      {Icon && <Icon data-icon="inline-start" aria-hidden />}
      {t(plan)}
    </Badge>
  );
};
