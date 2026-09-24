import { Logo } from '@components/layout/logo';
import { APP_NAME } from '@constants/index';
import { LandingSection } from '@constants/landing';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import Link from 'next/link';

const LINKS = [
  { label: 'How it works', href: ROUTES.landing(LandingSection.HowItWorks) },
  { label: 'Sign in', href: ROUTES.auth.signIn() },
] as const;

export type PublicFooterProps = Omit<
  React.ComponentProps<'footer'>,
  'children'
>;

export const PublicFooter: React.FC<PublicFooterProps> = ({
  className,
  ...props
}) => (
  <footer className={cn('border-t pt-9 pb-11', className)} {...props}>
    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-6 px-5 sm:px-8">
      <Logo />
      <nav className="flex flex-wrap gap-5">
        {LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-muted-foreground ml-auto text-xs">
        © {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  </footer>
);
