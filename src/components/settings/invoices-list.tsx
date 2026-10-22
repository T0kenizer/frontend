'use client';

import { SettingsSection } from '@components/settings/settings-section';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  createDataTableColumnHelper,
  DataTable,
} from '@components/ui/data-table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@components/ui/empty';
import { OffsetPagination } from '@components/ui/pagination';
import { Skeleton } from '@components/ui/skeleton';
import { useBillingAccount } from '@hooks/use-billing-account';
import { formatPrice } from '@services/plans/plans.utils';
import {
  listInvoicesOptions,
  retrieveSubscriptionOptions,
} from '@services/subscriptions/subscriptions.options';
import { buildBillingPortalUrl } from '@services/subscriptions/subscriptions.utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LIST_INVOICES_DEFAULT_LIMIT } from '@tokenizer/shared/constants/subscriptions.constants';
import type { Invoice, InvoiceStatus } from '@tokenizer/shared/types';
import { Download, ExternalLink, ReceiptText } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const STATUS_VARIANTS: Record<
  InvoiceStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  draft: 'outline',
  open: 'warning',
  paid: 'success',
  uncollectible: 'destructive',
  void: 'outline',
};

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({
  status,
}) => {
  const t = useTranslations('Settings.subscription.invoices.status');

  return <Badge variant={STATUS_VARIANTS[status]}>{t(status)}</Badge>;
};

const InvoiceDate: React.FC<{ createdAt: Invoice['createdAt'] }> = ({
  createdAt,
}) => {
  const format = useFormatter();
  const date = new Date(createdAt);

  return (
    <time dateTime={date.toISOString()}>
      {format.dateTime(date, { dateStyle: 'medium' })}
    </time>
  );
};

const InvoiceAmount: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const locale = useLocale();

  return formatPrice(
    {
      amount: invoice.amount,
      currency: invoice.currency,
      interval: null,
    },
    locale,
  );
};

const InvoiceActions: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const t = useTranslations('Settings.subscription.invoices');
  const isDue = invoice.status === 'open';

  return (
    <div className="flex justify-end gap-1">
      {invoice.hostedUrl && (
        <Button variant={isDue ? 'primary' : 'ghost'} size="xs" asChild>
          <a href={invoice.hostedUrl} target="_blank" rel="noreferrer">
            {isDue ? t('pay') : t('view')}
            <ExternalLink data-icon="inline-end" aria-hidden />
          </a>
        </Button>
      )}
      {invoice.pdfUrl && (
        <Button variant="ghost" size="xs" asChild>
          <a
            href={invoice.pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t('download', { number: invoice.number ?? '' })}
          >
            <Download aria-hidden />
            PDF
          </a>
        </Button>
      )}
    </div>
  );
};

const column = createDataTableColumnHelper<Invoice>();

const useInvoiceColumns = () => {
  const t = useTranslations('Settings.subscription.invoices.columns');

  return useMemo(
    () =>
      column.columns([
        column.accessor('createdAt', {
          header: t('date'),
          cell: ({ getValue }) => <InvoiceDate createdAt={getValue()} />,
          meta: { skeleton: <Skeleton className="h-3.5 w-24" /> },
        }),
        column.accessor('number', {
          header: t('number'),
          cell: ({ getValue }) => getValue() ?? '—',
          meta: {
            cellClassName: 'text-muted-foreground font-light',
            skeleton: <Skeleton className="h-3.5 w-28" />,
          },
        }),
        column.accessor('amount', {
          header: t('amount'),
          cell: ({ row }) => <InvoiceAmount invoice={row.original} />,
          meta: {
            cellClassName: 'tabular-nums',
            skeleton: <Skeleton className="h-3.5 w-12" />,
          },
        }),
        column.accessor('status', {
          header: t('status'),
          cell: ({ getValue }) => <InvoiceStatusBadge status={getValue()} />,
          meta: { skeleton: <Skeleton className="h-5 w-12 rounded-full" /> },
        }),
        column.display({
          id: 'actions',
          header: () => <span className="sr-only">{t('actions')}</span>,
          cell: ({ row }) => <InvoiceActions invoice={row.original} />,
          meta: {
            cellClassName: 'text-right',
            skeleton: <Skeleton className="ml-auto h-6 w-24" />,
          },
        }),
      ]),
    [t],
  );
};

const InvoicesEmpty: React.FC = () => {
  const t = useTranslations('Settings.subscription.invoices');
  const { data: subscription } = useQuery(retrieveSubscriptionOptions());

  return (
    <Empty className="pt-6 pb-2">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptText />
        </EmptyMedia>
        <EmptyTitle className="font-semibold">{t('emptyTitle')}</EmptyTitle>
        <EmptyDescription className="text-xs font-light">
          {subscription ? t('emptySubscribed') : t('empty')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export const InvoicesList: React.FC = () => {
  const t = useTranslations('Settings');
  const columns = useInvoiceColumns();
  const [offset, setOffset] = useState(0);
  const {
    data: invoices,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
    isRefetching,
  } = useQuery({
    ...listInvoicesOptions({ offset }),
    placeholderData: keepPreviousData,
  });

  if (isError)
    return (
      <div className="flex flex-wrap items-center gap-3 py-3.5">
        <p className="text-destructive text-sm">
          {t('subscription.invoices.loadError')}
        </p>
        <Button
          variant="ghost"
          size="sm"
          loading={isRefetching}
          onClick={() => refetch()}
        >
          {t('retry')}
        </Button>
      </div>
    );

  if (!isPending && !invoices.total) return <InvoicesEmpty />;

  return (
    <>
      <DataTable
        columns={columns}
        data={invoices?.items}
        getRowId={(invoice) => invoice.id}
        loading={isPending}
        aria-label={isPending ? t('subscription.invoices.loading') : undefined}
        className="mt-3"
      />
      {invoices && (
        <OffsetPagination
          offset={offset}
          limit={LIST_INVOICES_DEFAULT_LIMIT}
          total={invoices.total}
          onOffsetChange={setOffset}
          disabled={isPlaceholderData}
        />
      )}
    </>
  );
};

export const InvoicesSection: React.FC = () => {
  const t = useTranslations('Settings.subscription.invoices');
  const { hasBillingAccount } = useBillingAccount();

  return (
    <SettingsSection
      title={t('title')}
      description={t('description')}
      action={
        hasBillingAccount && (
          <Button variant="secondary" size="sm" asChild>
            <a href={buildBillingPortalUrl()}>
              {t('viewInStripe')}
              <ExternalLink data-icon="inline-end" aria-hidden />
            </a>
          </Button>
        )
      }
    >
      <InvoicesList />
    </SettingsSection>
  );
};
