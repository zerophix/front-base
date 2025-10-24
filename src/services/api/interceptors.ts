/**
 * API 拦截器配置
 * 统一处理请求/响应、错误处理、loading状态
 */

import { message } from 'antd';
import { useUIStore, useUserStore } from '@/store';
import type { RequestConfig, ApiResponse, ApiErrorResponse } from '@/types/core/api';
import { getCsrfToken } from '@/utils';
import { getValidAccessToken } from '@/utils/auth';
import { globalErrorHandler, createError } from '@/utils/errorHandler';

/**
 * 请求拦截器 - 添加token（使用新的认证系统）
 */
export const tokenRequestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  const token = await getValidAccessToken();
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      },
    };
  }
  return config;
};

/**
 * 请求拦截器 - 添加CSRF token
 */
export const csrfRequestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  const csrf = typeof window !== 'undefined' ? getCsrfToken() : null;
  if (csrf) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-CSRF-Token': csrf,
      },
    };
  }
  return config;
};

/**
 * 通用请求拦截器
 */
export const requestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  useUIStore.getState().showLoading();
  return config;
};

/**
 * 请求错误拦截器
 */
export const requestErrorInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  useUIStore.getState().hideLoading();
  return config;
};

/**
 * 响应日志拦截器
 */
export const logResponseInterceptor = async <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Response]:', response);
  }
  return response;
};

/**
 * 通用响应拦截器
 */
export const responseInterceptor = async <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> => {
  useUIStore.getState().hideLoading();
  return response;
};

/**
 * 业务状态码响应拦截器
 */
export const businessCodeResponseInterceptor = async <T>(response: ApiResponse<T>): Promise<ApiResponse<T>> => {
  if (!response.success) {
    message.error(response.message || '操作失败');
  }
  return response;
};

/**
 * 错误处理拦截器
 */
export const errorHandlerInterceptor = async (error: ApiErrorResponse): Promise<ApiErrorResponse> => {
  useUIStore.getState().hideLoading();
  
  // 处理认证错误
   if (error.statusCode === 401) {
     const userStore = useUserStore.getState();
     userStore.clearUser();
     message.error('登录已过期，请重新登录');
     // 重定向到登录页
     if (typeof window !== 'undefined') {
       window.location.href = '/login';
     }
     return error;
   }

  // 处理权限错误
  if (error.statusCode === 403) {
    message.error('权限不足，无法执行此操作');
    return error;
  }

  // 处理服务器错误
  if (error.statusCode >= 500) {
    message.error('服务器错误，请稍后重试');
    // 记录错误日志
    console.error('[Server Error]:', error);
    return error;
  }

  // 处理网络错误
  if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
    message.error('网络连接失败，请检查网络设置');
    return error;
  }

  // 处理其他业务错误
  if (error.message) {
    message.error(error.message);
  } else {
    message.error('操作失败，请重试');
  }

  // 使用全局错误处理器
   globalErrorHandler.handle(createError.business(error.message || '未知错误', error.statusCode?.toString() || 'UNKNOWN'), {
     originalError: error,
   });

  return error;
};

/**
 * 请求日志拦截器
 */
export const logRequestInterceptor = async (config: RequestConfig): Promise<RequestConfig> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]:', config);
  }
  return config;
};
