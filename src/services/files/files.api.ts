import requester from '@lib/requester';
import {
  CreateFileQuery,
  CreateFileResponse,
  RetrieveFileResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/files';

export const createFile = async (file: File, query: CreateFileQuery = {}) => {
  const data = new FormData();
  data.append('file', file);

  return requester().post<CreateFileResponse>(BASE_URL, data, {
    headers: { 'Content-Type': undefined },
    params: query,
  });
};

export const retrieveFile = async (uuid: string) =>
  requester().get<RetrieveFileResponse>(`${BASE_URL}/${uuid}`);
