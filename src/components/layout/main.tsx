import { cn } from '@lib/utils';

export type MainProps = React.ComponentProps<'main'>;

export const Main: React.FC<MainProps> = ({ className, ...props }) => (
  <main
    className={cn('@container relative isolate flex-1', className)}
    {...props}
  />
);
