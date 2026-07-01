import { cn } from '@lib/utils';

export type HeaderProps = React.ComponentProps<'header'>;

export const Header: React.FC<HeaderProps> = ({ className, ...props }) => (
  <header className={cn('sticky top-0 z-10', className)} {...props} />
);

export type MainProps = React.ComponentProps<'main'>;

export const Main: React.FC<MainProps> = ({ className, ...props }) => (
  <main className={cn('relative isolate flex-1 p-8', className)} {...props} />
);
