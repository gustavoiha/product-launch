import { get, post, put } from 'aws-amplify/api';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ApiRequestOptions {
  apiName: string;
  path: string;
  body?: JsonValue;
  queryParams?: Record<string, string>;
}

interface JsonResponseBody {
  json: () => Promise<unknown>;
}

interface ApiResponse {
  body: JsonResponseBody;
}

const parseJson = async <T>(response: ApiResponse): Promise<T> => {
  const data = (await response.body.json()) as T;
  return data;
};

export const getJson = async <T>(options: ApiRequestOptions): Promise<T> => {
  const operation = get({
    apiName: options.apiName,
    path: options.path,
    options: {
      queryParams: options.queryParams
    }
  });
  const response = await operation.response;
  return parseJson<T>(response);
};

export const postJson = async <T>(options: ApiRequestOptions): Promise<T> => {
  const operation = post({
    apiName: options.apiName,
    path: options.path,
    options: {
      body: options.body
    }
  });
  const response = await operation.response;
  return parseJson<T>(response);
};

export const putJson = async <T>(options: ApiRequestOptions): Promise<T> => {
  const operation = put({
    apiName: options.apiName,
    path: options.path,
    options: {
      body: options.body
    }
  });
  const response = await operation.response;
  return parseJson<T>(response);
};
