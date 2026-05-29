import { QueryOptions } from '@tanstack/react-query';

declare global {
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type Nullish<T> = T | null | undefined;

  type QueryOptionsParams<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Fn extends (...args: any[]) => QueryOptions<any, any, any, any>,
  > = Partial<Omit<ReturnType<Fn>, 'queryKey' | 'queryFn'>>;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
