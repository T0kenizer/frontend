'use client';

import { Badge } from '@components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@components/ui/toggle-group';
import { useBillingInterval, useYearlySavings } from '@hooks/use-pricing';
import { cn } from '@lib/utils';
import { BillingInterval } from '@tokenizer/shared/types';
import { useTranslations } from 'next-intl';

const ITEM_CLASS_NAME =
  'h-auto gap-2 rounded-full px-4.5 py-2.5 font-bold data-[state=on]:shadow-[0_3px_0_rgb(0_0_0/0.2)]';

export type PricingBillingToggleProps = { className?: string };

/** Switches the pricing page between monthly and yearly Premium prices. */
export const PricingBillingToggle: React.FC<PricingBillingToggleProps> = ({
  className,
}) => {
  const t = useTranslations('Pricing.billing');
  const [interval, setBillingInterval] = useBillingInterval();
  const monthsFree = useYearlySavings();

  if (monthsFree === null) return null;

  return (
    <ToggleGroup
      type="single"
      variant="felt"
      spacing={1}
      value={interval}
      onValueChange={(value) =>
        value && setBillingInterval(value as BillingInterval)
      }
      aria-label={t('label')}
      className={cn('rounded-full', className)}
    >
      <ToggleGroupItem
        value={BillingInterval.Month}
        className={ITEM_CLASS_NAME}
      >
        {t('month')}
      </ToggleGroupItem>
      <ToggleGroupItem value={BillingInterval.Year} className={ITEM_CLASS_NAME}>
        {t('year')}
        {monthsFree >= 1 && (
          <Badge variant="gold" className="font-extrabold">
            {t('savings', { count: monthsFree })}
          </Badge>
        )}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
