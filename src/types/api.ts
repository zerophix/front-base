/**
 * API 相关类型定义
 */

import { IApiResponse, IPaginationParams } from './common';

// 重新导出通用类型
export type { IApiResponse, IPaginationParams };

/**
 * HTTP 方法
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * 请求配置
 */
export interface IRequestConfig {
  url: string;
  method: HttpMethod;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

/**
 * API 错误
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 请求拦截器
 */
export type RequestInterceptor = (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;

/**
 * 响应拦截器
 */
export type ResponseInterceptor<T = any> = (response: IApiResponse<T>) => IApiResponse<T> | Promise<IApiResponse<T>>;

/**
 * 错误拦截器
 */
export type ErrorInterceptor = (error: ApiError) => Promise<never> | ApiError;

/**
 * API 客户端配置
 */
export interface IApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  errorInterceptors?: ErrorInterceptor[];
}

/**
 * 分页查询参数
 */
export interface IPageQueryParams extends IPaginationParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

/**
 * 批量操作参数
 */
export interface IBatchOperationParams {
  ids: (string | number)[];
  action: string;
  extra?: any;
}

/**
 * 导入参数
 */
export interface IImportParams {
  file: File;
  overwrite?: boolean; // 是否覆盖已有数据
}

/**
 * 导出参数
 */
export interface IExportParams {
  format?: 'xlsx' | 'csv' | 'pdf';
  filters?: any;
  fields?: string[]; // 指定导出的字段
}

