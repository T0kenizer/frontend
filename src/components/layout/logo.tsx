import TokenizerMark from '@assets/images/logo/tokenizer-mark.svg';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export type LogoProps = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href?: React.ComponentProps<typeof Link>['href'];
  collapsible?: boolean;
};

export const Logo: React.FC<LogoProps> = ({
  href = ROUTES.home(),
  collapsible = false,
  className,
  ...props
}) => (
  <Link
    href={href}
    className={cn('flex flex-row items-center gap-0.5', className)}
    {...props}
  >
    <Image
      src={TokenizerMark}
      alt="Tokenizer Logo"
      height={32}
      sizes="100%"
      className={cn(
        'h-8 w-auto shrink-0',
        collapsible &&
          'transition-transform duration-200 ease-linear group-data-[collapsible=icon]:rotate-360',
      )}
    />
    <span
      className={cn(
        'overflow-hidden text-lg font-bold',
        collapsible &&
          'transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0',
      )}
    >
      okenizer
    </span>
  </Link>
);
