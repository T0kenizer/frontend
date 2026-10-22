'use client';

import { LandingSectionHeading } from '@components/landing/landing-section-heading';
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableColumnDef,
} from '@components/ui/data-table';
import { type PricingOffer, usePricingOffers } from '@hooks/use-pricing';
import { cn } from '@lib/utils';
import { Plan } from '@tokenizer/shared/types';
import { useTranslations } from 'next-intl';

type Value = boolean | string | number;

type RowKey = 'tables' | 'seats' | 'poker' | 'sandbox' | 'billing';

type CompareRow = { key: RowKey; value: (offer: PricingOffer) => Value };

const column = createDataTableColumnHelper<CompareRow>();

export type PricingCompareProps = React.ComponentProps<'section'>;

export const PricingCompare: React.FC<PricingCompareProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Pricing.compare');
  const offers = usePricingOffers();

  const rows: CompareRow[] = [
    { key: 'tables', value: (o) => o.canCreate && o.canJoin },
    { key: 'seats', value: (o) => o.maxSeats },
    { key: 'poker', value: (o) => o.poker },
    { key: 'sandbox', value: (o) => o.sandbox },
    {
      key: 'billing',
      value: (o) =>
        t('billingValue', {
          interval: o.price ? (o.price.interval ?? 'once') : 'none',
        }),
    },
  ];

  const renderValue = (value: Value) => {
    if (value === true)
      return <span className="font-extrabold text-teal-600">✓</span>;
    if (value === false)
      return (
        <span className="text-muted-foreground" aria-label={t('no')}>
          —
        </span>
      );
    return value;
  };

  const columns: DataTableColumnDef<CompareRow>[] = [
    column.display({
      id: 'feature',
      header: '',
      cell: ({ row }) => t(`rows.${row.original.key}`),
      meta: {
        headerClassName: 'px-5 py-4',
        cellClassName: 'px-5 py-4 whitespace-normal',
      },
    }),
    ...offers.map((offer) =>
      column.display({
        id: offer.plan,
        header: t(`plans.${offer.plan}`),
        cell: ({ row }) => renderValue(row.original.value(offer)),
        meta: {
          headerClassName: cn(
            'text-muted-foreground w-[18%] px-5 py-4 text-center text-xs font-bold tracking-widest uppercase',
            offer.plan === Plan.Premium && 'text-primary',
          ),
          cellClassName: cn(
            'px-5 py-4 text-center',
            offer.plan === Plan.Premium && 'bg-primary-soft font-bold',
          ),
        },
      }),
    ),
  ];

  return (
    <section className={cn('pt-24 pb-10', className)} {...props}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <LandingSectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        <div className="bg-card mt-8 overflow-hidden rounded-2xl border">
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.key}
            rowClassName="hover:bg-transparent"
            className="min-w-140"
          />
        </div>
      </div>
    </section>
  );
};
