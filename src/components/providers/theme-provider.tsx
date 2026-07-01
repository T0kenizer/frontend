'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const ThemeProvider: React.FC<
  React.ComponentProps<typeof NextThemesProvider>
> = ({ children, ...props }) => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
);

export default ThemeProvider;
