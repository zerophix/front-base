/**
 * API 拦截器配置
 * 统一处理请求/响应、错误处理、loading状态
 */

import { message } from 'antd';
import { useUIStore, useUserStore } from '@/store';
import type { IRequestConfig, IApiResponse, ApiError } from '@/types/api';
import { getCsrfToken } from '@/utils';
import { getValidAccessToken } from '@/utils/auth';
import { globalErrorHandler, createError } from '@/utils/errorHandler';

/**
 * 请求拦截器 - 添加token（使用新的认证系统）
 */
export const tokenRequestInterceptor = async (config: IRequestConfig): Promise<IRequestConfig> => {
  const token = await getValidAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

/**
 * 请求拦截器 - 注入CSRF Token
 */
export const csrfRequestInterceptor = async (config: IRequestConfig): Promise<IRequestConfig> => {
  const csrf = typeof window !== 'undefined' ? getCsrfToken() : null;
  if (csrf) {
    config.headers = {
      ...config.headers,
      'X-CSRF-Token': csrf,
    };
  }
  return config;
};

/**
 * 请求拦截器 - 显示loading
 */
export const requestInterceptor = async (config: IRequestConfig): Promise<IRequestConfig> => {
  useUIStore.getState().showLoading();
  return config;
};

/**
 * 请求错误拦截器
 */
export const requestErrorInterceptor = async (config: IRequestConfig): Promise<IRequestConfig> => {
  useUIStore.getState().hideLoading();
  return config;
};

/**
 * 响应拦截器 - 日志
 */
export const logResponseInterceptor = async <T>(response: IApiResponse<T>): Promise<IApiResponse<T>> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Response]:', response);
  }
  return response;
};

/**
 * 响应拦截器 - 隐藏loading
 */
export const responseInterceptor = async <T>(response: IApiResponse<T>): Promise<IApiResponse<T>> => {
  useUIStore.getState().hideLoading();
  return response;
};

/**
 * 响应拦截器 - 业务码处理
 */
export const businessCodeResponseInterceptor = async <T>(response: IApiResponse<T>): Promise<IApiResponse<T>> => {
  if (response.code !== undefined && response.code !== 200 && response.code !== 0) {
    message.error(response.message || '操作失败');
    throw new Error(response.message || '操作失败');
  }
  return response;
};

/**
 * 错误拦截器 - 统一错误处理
 */
export const errorHandlerInterceptor = async (error: ApiError): Promise<never> => {
  useUIStore.getState().hideLoading();
  
  const { code, message: errMsg } = error;
  
  // 使用新的错误处理机制
  let appError;
  
  switch (code) {
    case 401:
      appError = createError.auth(errMsg || '未授权，请登录');
      useUserStore.getState().clearUser();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      break;
    
    case 403:
      appError = createError.forbidden(errMsg || '没有权限访问');
      break;
    
    case 404:
      appError = createError.notFound(errMsg || '请求的资源不存在');
      break;
    
    case 408:
      appError = createError.network(errMsg || '请求超时');
      break;
    
    case 500:
      appError = createError.server(errMsg || '服务器错误');
      break;
    
    default:
      appError = createError.network(errMsg || '请求失败');
  }
  
  // 使用全局错误处理器
  globalErrorHandler.handle(appError, {
    apiError: true,
    statusCode: code,
    originalError: error,
  });
  
  throw appError;
};

/**
 * 日志请求拦截器
 */
export const logRequestInterceptor = async (config: IRequestConfig): Promise<IRequestConfig> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]:', config);
  }
  return config;
};
