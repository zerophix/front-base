'use client';

/**
 * API 请求 Hook
 * 统一处理 API 请求、加载状态、错误处理
 */

import { useState, useCallback, useEffect } from 'react';
import type { IApiResponse } from '@/types';
import { globalErrorHandler, createError, safeExecute } from '@/utils/errorHandler';

export interface UseApiRequestOptions<T, P extends any[] = any[]> {
  /**
   * API 请求函数
   */
  requestFn: (...args: P) => Promise<IApiResponse<T>>;
  
  /**
   * 是否立即执行
   */
  immediate?: boolean;
  
  /**
   * 立即执行时的参数
   */
  immediateParams?: P;
  
  /**
   * 成功回调
   */
  onSuccess?: (data: T) => void;
  
  /**
   * 失败回调
   */
  onError?: (error: Error) => void;
  
  /**
   * 完成回调（无论成功失败都会执行）
   */
  onFinally?: () => void;
  

  
  /**
   * 错误提示消息
   */
  errorMessage?: string;
}

export interface UseApiRequestReturn<T, P extends any[] = any[]> {
  /**
   * 响应数据
   */
  data: T | null;
  
  /**
   * 加载状态
   */
  loading: boolean;
  
  /**
   * 错误信息
   */
  error: Error | null;
  
  /**
   * 执行请求
   */
  run: (...args: P) => Promise<T | null>;
  
  /**
   * 重新执行上次的请求
   */
  refresh: () => Promise<T | null>;
  
  /**
   * 取消请求（清空状态）
   */
  cancel: () => void;
  
  /**
   * 手动设置数据
   */
  setData: (data: T | null) => void;
}

/**
 * API 请求 Hook
 */
export function useApiRequest<T, P extends any[] = any[]>({
  requestFn,
  immediate = false,
  immediateParams,
  onSuccess,
  onError,
  onFinally,
  errorMessage = '请求失败',
}: UseApiRequestOptions<T, P>): UseApiRequestReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<P | null>(null);

  /**
   * 执行请求
   */
  const run = useCallback(async (...args: P): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setLastParams(args);
    
    try {
      const response = await safeExecute(
        () => requestFn(...args),
        globalErrorHandler,
        { requestArgs: args, requestFunction: requestFn.name }
      );
      
      if (response === null) {
        // safeExecute 返回 null 表示发生了错误
        return null;
      }
      
      const responseData = response.data;
      setData(responseData);
      
      if (onSuccess) {
        onSuccess(responseData);
      }
      
      return responseData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // 使用新的错误处理机制
      const appError = createError.network(errorMessage, 'API_REQUEST_FAILED');
      globalErrorHandler.handle(appError, {
        originalError: err,
        requestArgs: args,
        requestFunction: requestFn.name
      });
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setLoading(false);
      
      if (onFinally) {
        onFinally();
      }
    }
  }, [requestFn, onSuccess, onError, onFinally, errorMessage]);

  /**
   * 重新执行上次的请求
   */
  const refresh = useCallback(async (): Promise<T | null> => {
    if (lastParams) {
      return run(...lastParams);
    }
    return null;
  }, [lastParams, run]);

  /**
   * 取消请求（清空状态）
   */
  const cancel = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * 立即执行
   */
  useEffect(() => {
    if (immediate && immediateParams) {
      run(...immediateParams);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    run,
    refresh,
    cancel,
    setData,
  };
}

