import { cn } from '@lib/utils';
import * as React from 'react';

import { Button } from '@components/ui/button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

// Pages are held in local state rather than in the URL, so the controls are
// buttons and not links.
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'button'>;

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      size={size}
      className={cn(className)}
    >
      <button
        type="button"
        aria-current={isActive ? 'page' : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  );
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('pl-1.5!', className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('pr-1.5!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

type OffsetPaginationProps = Omit<
  React.ComponentProps<typeof Pagination>,
  'children'
> & {
  offset: number;
  limit: number;
  total: number;
  onOffsetChange: (offset: number) => void;
  /** Disables both controls, e.g. while the next page is loading. */
  disabled?: boolean;
};

/** Previous / next controls of an offset-paginated list, hidden on one page. */
function OffsetPagination({
  offset,
  limit,
  total,
  onOffsetChange,
  disabled = false,
  className,
  ...props
}: OffsetPaginationProps) {
  if (total <= limit) return null;

  const last = Math.min(offset + limit, total);

  return (
    <Pagination className={cn('justify-end pt-3', className)} {...props}>
      <PaginationContent>
        <PaginationItem>
          <p className="text-muted-foreground mr-2 text-xs tabular-nums">
            {offset + 1}–{last} of {total}
          </p>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            disabled={disabled || offset === 0}
            onClick={() => onOffsetChange(Math.max(offset - limit, 0))}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            disabled={disabled || last >= total}
            onClick={() => onOffsetChange(offset + limit)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  OffsetPagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
