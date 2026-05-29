import { RequesterError } from '@lib/requester';
import { QueryClient, environmentManager } from '@tanstack/react-query';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 60 * 1000 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (count: number, error) => {
          if (
            error instanceof RequesterError &&
            [408, 429, 500, 502, 503, 504].includes(error.status) &&
            count < 3
          )
            return true;
          return false;
        },
      },
    },
  });

let browserQueryClient: Nullable<QueryClient> = null;

export const getQueryClient = (): QueryClient => {
  if (environmentManager.isServer()) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};
