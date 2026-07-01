import { ErrorData } from '@/types/requester';
import { INTERNAL_API_URL, NEXT_PUBLIC_API_URL } from '@lib/env';
import { getQueryClient } from '@lib/query-client';
import RequesterError from '@lib/requester/error';
import { SESSIONS_QUERY_KEYS } from '@services/sessions/sessions.options';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const isServer = typeof window === 'undefined';

const client: AxiosInstance = axios.create({
  baseURL: isServer ? INTERNAL_API_URL : NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
});

client.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  console.debug(
    `Request made with ${request.method?.toUpperCase()} method to ${request.baseURL}${request.url}`,
  );

  return request;
});

client.interceptors.response.use(
  async (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401 && !isServer) {
        getQueryClient().removeQueries({
          queryKey: SESSIONS_QUERY_KEYS.retrieve('current'),
        });
      }

      const data = error.response.data as Optional<ErrorData>;
      throw new RequesterError({
        statusCode: data?.statusCode ?? error.response.status,
        error: data?.error ?? error.response.statusText,
        message: data?.message || undefined,
      });
    }

    let axiosError = new RequesterError();

    switch (error.code) {
      case 'ECONNABORTED':
        axiosError = new RequesterError({
          statusCode: 408,
          error: 'Request Time-out',
          message: 'Request timeout – please check your internet connection',
        });
        break;
      case 'ERR_CANCELED':
        axiosError = new RequesterError({
          statusCode: 499,
          error: 'Request Cancelled',
          message: 'The request was cancelled',
        });
        break;
      case 'ERR_NETWORK':
      case 'NETWORK_ERROR':
        axiosError = new RequesterError({
          statusCode: 503,
          error: 'Network Error',
          message: 'Network error – please check your internet connection',
        });
        break;
      default:
        axiosError = new RequesterError({
          statusCode: 500,
          error: 'Unknown Error',
          message: error.message || 'An unknown error occurred',
        });
    }

    console.error(`Axios error with code ${error.code}:`, axiosError);
    throw axiosError;
  },
);

export default client;
