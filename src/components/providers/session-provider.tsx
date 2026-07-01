import { getQueryClient } from '@lib/query-client';
import { retrieveSessionServerOptions } from '@services/sessions/sessions.options';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export const SessionProvider: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(retrieveSessionServerOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
