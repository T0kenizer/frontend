import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/files/files.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  CreateFileQuery,
  CreateFileResponse,
  FileStatus,
  RetrieveFileResponse,
} from '@tokenizer/shared/types';

export const FILES_QUERY_KEYS = {
  retrieve: (uuid: string) => ['files', 'retrieve', uuid] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const FILES_MUTATION_KEYS = {
  create: () => ['files', 'create'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

const SETTLING_STATUSES: FileStatus[] = [
  FileStatus.Pending,
  FileStatus.Processing,
];
const SETTLING_REFETCH_INTERVAL_MS = 2000;

export const retrieveFileOptions = (uuid: string) =>
  queryOptions<RetrieveFileResponse, RequesterError>({
    queryKey: FILES_QUERY_KEYS.retrieve(uuid),
    queryFn: () => API.retrieveFile(uuid),
    enabled: !!uuid,
    // An async upload settles server-side, so poll until it does.
    refetchInterval: (query) =>
      query.state.data && SETTLING_STATUSES.includes(query.state.data.status)
        ? SETTLING_REFETCH_INTERVAL_MS
        : false,
  });

interface CreateFileVariables {
  file: File;
  query?: CreateFileQuery;
}

export const createFileOptions = () =>
  mutationOptions<CreateFileResponse, RequesterError, CreateFileVariables>({
    mutationKey: FILES_MUTATION_KEYS.create(),
    mutationFn: (variables) => API.createFile(variables.file, variables.query),
    onSuccess: (file) => {
      // Seed the retrieve cache so a follow-up poll starts from fresh data.
      getQueryClient().setQueryData(FILES_QUERY_KEYS.retrieve(file.uuid), file);
    },
  });
