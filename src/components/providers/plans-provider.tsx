import { getQueryClient } from '@lib/query-client';
import { listPlansServerOptions } from '@services/plans/plans.options';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { connection } from 'next/server';

export const PlansProvider: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  // Request time only: at build time the backend is not reachable, or runs
  // the previous release.
  await connection();

  const queryClient = getQueryClient();

  await queryClient.fetchQuery(listPlansServerOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
