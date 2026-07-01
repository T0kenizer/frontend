import { Sidebar } from '@components/layout/sidebar';
import ReactQueryProvider from '@components/providers/react-query-provider';
import { SessionProvider } from '@components/providers/session-provider';
import { ThemeProvider } from '@components/providers/theme-provider';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { TooltipProvider } from '@components/ui/tooltip';
import { APP_NAME } from '@constants/index';
import '@styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <html lang="en" className={inter.variable} suppressHydrationWarning>
    <body className="bg-background relative flex h-dvh w-dvw flex-row gap-0 overflow-x-hidden overflow-y-auto antialiased">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ReactQueryProvider>
          <SessionProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Sidebar />
                <SidebarInset>{children}</SidebarInset>
              </SidebarProvider>
            </TooltipProvider>
          </SessionProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
