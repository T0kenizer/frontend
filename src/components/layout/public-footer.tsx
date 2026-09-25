import { LangSwitcher } from '@components/lang/lang-switcher';
import { Logo } from '@components/layout/logo';
import { ThemeSwitcher } from '@components/theme/theme-switcher';
import { APP_NAME } from '@constants/index';
import { LandingSection } from '@constants/landing';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const LINKS = [
  { key: 'howItWorks', href: ROUTES.landing(LandingSection.HowItWorks) },
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

  return (
    <footer className={cn('border-t pt-9 pb-11', className)} {...props}>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-6 px-5 sm:px-8">
        <Logo />
        <nav className="flex flex-wrap gap-5">
          {LINKS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <p className="text-muted-foreground ml-auto text-xs">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
        <div className="flex items-center gap-2">
          <LangSwitcher size="sm" className="w-44" />
          <ThemeSwitcher compact size="sm" />
        </div>
      </div>
    </footer>
  );
};
