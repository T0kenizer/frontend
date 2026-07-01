'use client';

import { getQueryClient } from '@lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const ReactQueryProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <QueryClientProvider client={getQueryClient()}>
    {children}
    <ReactQueryDevtools />
  </QueryClientProvider>
);

export default ReactQueryProvider;
