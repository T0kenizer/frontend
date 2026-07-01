import { AxiosRequestConfig } from 'axios';

export type Requester = () => {
  get: Request;
  post: RequestWithData;
  put: RequestWithData;
  delete: Request;
  patch: RequestWithData;
};

export type Request = <T = unknown>(
  url: string,
  options?: AxiosRequestConfig,
) => Promise<T>;
export type RequestWithData = <T = unknown>(
  url: string,
  data?: unknown,
  options?: AxiosRequestConfig,
) => Promise<T>;

export type ErrorData = {
  statusCode: number;
  message: string;
  error: string;
};
