import { getQueryClient } from '@lib/query-client';
import { listPlansServerOptions } from '@services/plans/plans.options';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export const PlansProvider: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery(listPlansServerOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
