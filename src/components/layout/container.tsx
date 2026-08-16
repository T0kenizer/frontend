import { cn } from '@lib/utils';

export type ContainerProps = React.ComponentProps<'div'>;

export const Container: React.FC<ContainerProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'mx-auto min-h-full w-full max-w-7xl space-y-8 p-8',
      className,
    )}
    {...props}
  />
);
