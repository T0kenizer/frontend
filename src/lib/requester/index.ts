import * as Types from '@/types/requester';
import { AxiosRequestConfig } from 'axios';
import client from './client';
import RequesterError from './error';

const BASE_OPTIONS: AxiosRequestConfig = {
  withCredentials: true,
};

const requester: Types.Requester = () => {
  const get: Types.Request = async <T>(
    url: string,
    options: AxiosRequestConfig = {},
  ) =>
    (
      await client.get<T>(url, {
        ...BASE_OPTIONS,
        ...options,
      })
    ).data;

  const post: Types.RequestWithData = async <T>(
    url: string,
    data: unknown,
    options: AxiosRequestConfig = {},
  ) =>
    (
      await client.post<T>(url, data, {
        ...BASE_OPTIONS,
        ...options,
      })
    ).data;

  const put: Types.RequestWithData = async <T>(
    url: string,
    data: unknown,
    options: AxiosRequestConfig = {},
  ) =>
    (
      await client.put<T>(url, data, {
        ...BASE_OPTIONS,
        ...options,
      })
    ).data;

  const del: Types.Request = async <T>(
    url: string,
    options: AxiosRequestConfig = {},
  ) =>
    (
      await client.delete<T>(url, {
        ...BASE_OPTIONS,
        ...options,
      })
    ).data;

  const patch: Types.RequestWithData = async <T>(
    url: string,
    data: unknown,
    options: AxiosRequestConfig = {},
  ) =>
    (
      await client.patch<T>(url, data, {
        ...BASE_OPTIONS,
        ...options,
      })
    ).data;

  return { get, post, put, delete: del, patch };
};

export { client, RequesterError };
export default requester;
