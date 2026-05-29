import { ErrorData } from '@/types/requester';

const DEFAULT_ERROR_DATA: ErrorData = {
  statusCode: 500,
  message: 'An unknown error occurred',
  error: 'Unknown Error',
};

export default class RequesterError<
  E extends ErrorData = ErrorData,
> extends Error {
  public readonly status: number;
  public readonly data: E;

  constructor(data: Partial<E> = {}) {
    const _data = {
      ...DEFAULT_ERROR_DATA,
      ...data,
    } as E;

    super(_data.message);

    this.name = _data.error;
    this.status = _data.statusCode;
    this.data = _data;
  }
}
