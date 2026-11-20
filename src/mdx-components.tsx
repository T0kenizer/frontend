import { Separator } from '@components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { cn } from '@lib/utils';
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

/**
 * How Markdown renders across the app, picked up by `@next/mdx`.
 *
 * The legal documents are the only Markdown today, so this is their typography:
 * long-form reading on a card, headings in the display face, tables in the
 * app's own table. Documents start at `##`, the page hero already holds the
 * `h1`.
 *
 * Props are typed by hand: `@types/mdx` reads the global `JSX` namespace, which
 * React 19 no longer declares, so `MDXComponents` alone types them as errors.
 */
const components = {
  h2: ({ className, ...props }: React.ComponentProps<'h2'>) => (
    <h2
      className={cn(
        'font-heading mt-12 scroll-mt-28 text-2xl leading-tight font-extrabold tracking-tight text-balance first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.ComponentProps<'h3'>) => (
    <h3
      className={cn(
        'font-heading mt-8 scroll-mt-28 text-lg leading-snug font-bold tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.ComponentProps<'p'>) => (
    <p
      className={cn('mt-4 leading-relaxed text-pretty first:mt-0', className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<'ul'>) => (
    <ul
      className={cn(
        'marker:text-muted-foreground mt-4 list-disc space-y-2 pl-6',
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentProps<'ol'>) => (
    <ol
      className={cn(
        'marker:text-muted-foreground mt-4 list-decimal space-y-2 pl-6',
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentProps<'li'>) => (
    <li className={cn('pl-1 leading-relaxed', className)} {...props} />
  ),
  a: ({ className, href = '', ...props }: React.ComponentProps<'a'>) => {
    const linkClassName = cn(
      'text-primary font-semibold break-words underline-offset-4 hover:underline',
      className,
    );

    return href.startsWith('/') ? (
      <Link href={href} className={linkClassName} {...props} />
    ) : (
      <a href={href} className={linkClassName} {...props} />
    );
  },
  strong: ({ className, ...props }: React.ComponentProps<'strong'>) => (
    <strong className={cn('font-semibold', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className={cn(
        'border-primary text-muted-foreground mt-6 border-l-2 pl-4',
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.ComponentProps<'code'>) => (
    <code
      className={cn(
        'bg-muted rounded px-1.5 py-0.5 font-mono text-[0.875em]',
        className,
      )}
      {...props}
    />
  ),
  hr: () => <Separator className="my-10" />,
  table: (props: React.ComponentProps<'table'>) => (
    <div className="mt-6 overflow-hidden rounded-xl border">
      <Table {...props} />
    </div>
  ),
  thead: (props: React.ComponentProps<'thead'>) => <TableHeader {...props} />,
  tbody: (props: React.ComponentProps<'tbody'>) => <TableBody {...props} />,
  tr: ({ className, ...props }: React.ComponentProps<'tr'>) => (
    <TableRow className={cn('hover:bg-transparent', className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<'th'>) => (
    <TableHead
      className={cn(
        'bg-muted/50 text-muted-foreground h-auto px-4 py-3 text-xs font-bold tracking-widest uppercase',
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<'td'>) => (
    <TableCell
      className={cn(
        'min-w-40 px-4 py-3 align-top leading-relaxed whitespace-normal',
        className,
      )}
      {...props}
    />
  ),
} satisfies MDXComponents;

export const useMDXComponents = (): MDXComponents => components;
