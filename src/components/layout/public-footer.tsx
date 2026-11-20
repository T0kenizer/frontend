import { LangSwitcher } from '@components/lang/lang-switcher';
import { Logo } from '@components/layout/logo';
import { ThemeSwitcher } from '@components/theme/theme-switcher';
import { APP_NAME, CONTACT_EMAIL } from '@constants/index';
import { LandingSection } from '@constants/landing';
import { LegalDocument } from '@constants/legal';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { MailIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const LINKS = [
  { key: 'howItWorks', href: ROUTES.landing(LandingSection.HowItWorks) },
  { key: 'pricing', href: ROUTES.pricing() },
  { key: 'signIn', href: ROUTES.auth.signIn() },
] as const;

export type PublicFooterProps = Omit<
  React.ComponentProps<'footer'>,
  'children'
>;

export const PublicFooter: React.FC<PublicFooterProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Footer');
  const tLegal = useTranslations('Legal.documents');

  return (
    <footer className={cn('border-t pt-9 pb-11', className)} {...props}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            {LINKS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 transition-colors hover:underline"
              >
                {t(key)}
              </Link>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={`${t('contact')}: ${CONTACT_EMAIL}`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium break-all underline-offset-4 transition-colors hover:underline"
            >
              <MailIcon className="size-4 shrink-0" aria-hidden />
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>
        <div className="flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} {APP_NAME}
            </p>
            <nav
              aria-label={t('legal')}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {Object.values(LegalDocument).map((document) => (
                <Link
                  key={document}
                  href={ROUTES.legal(document)}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
                >
                  {tLegal(`${document}.title`)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher size="sm" className="w-full sm:w-44" />
            <ThemeSwitcher compact size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
};
