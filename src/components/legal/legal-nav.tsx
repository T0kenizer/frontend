'use client';

import { ScrollFade } from '@components/ui/scroll-fade';
import { LegalDocument } from '@constants/legal';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export type LegalNavProps = Omit<React.ComponentProps<'nav'>, 'children'> & {
  active: LegalDocument;
};

export const LegalNav: React.FC<LegalNavProps> = ({
  active,
  className,
  ...props
}) => {
  const t = useTranslations('Legal');

  return (
    <ScrollFade asChild size="sm">
      <nav
        aria-label={t('navAriaLabel')}
        className={cn(
          'flex shadow-[inset_0_-1px_0_var(--color-border)] lg:sticky lg:top-28 lg:flex-col lg:overflow-visible lg:border-l lg:shadow-none',
          className,
        )}
        {...props}
      >
        {Object.values(LegalDocument).map((document) => (
          <Link
            key={document}
            href={ROUTES.legal(document)}
            aria-current={document === active ? 'page' : undefined}
            className="text-muted-foreground hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-foreground shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors aria-[current=page]:font-semibold lg:-ml-px lg:border-b-0 lg:border-l-2 lg:px-4 lg:py-2"
          >
            {t(`documents.${document}.title`)}
          </Link>
        ))}
      </nav>
    </ScrollFade>
  );
};
