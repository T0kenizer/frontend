import { getQueryClient } from '@lib/query-client';
import { listOffersServerOptions } from '@services/offers/offers.options';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

/** Prefetches the offers for the pages that sell them, like `PlansProvider`. */
export const OffersProvider: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery(listOffersServerOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
