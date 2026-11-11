'use client';

import { Badge } from '@components/ui/badge';
import { cn } from '@lib/utils';
import { Plan, type UserPlan } from '@tokenizer/shared/types';
import { useTranslations } from 'next-intl';

interface PlanBadgeStyle {
  variant: React.ComponentProps<typeof Badge>['variant'];
  className?: string;
}

const PLAN_BADGE_STYLES: Record<UserPlan, PlanBadgeStyle> = {
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
  const { variant, className: planClassName } = PLAN_BADGE_STYLES[plan];

  return (
    <Badge
      data-plan={plan}
      variant={variant}
      size={size}
      className={cn(planClassName, className)}
      {...props}
    >
      {t(plan)}
    </Badge>
  );
};
