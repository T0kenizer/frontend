import { cn } from '@lib/utils';

export type MainProps = React.ComponentProps<'main'>;

export const Main: React.FC<MainProps> = ({ className, ...props }) => (
  <main
    className={cn('relative isolate flex-1 space-y-8 p-8', className)}
    {...props}
  />
);
