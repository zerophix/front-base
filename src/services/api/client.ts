/**
 * API 客户端实现
 * 基于 fetch API，支持拦截器、缓存和错误处理
 */

import { 
  ApiClientConfig, 
  RequestConfig, 
  HttpMethod, 
  ApiErrorResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  ApiResponse,
  ApiStatusCode
} from '@/types/core/api';
import type { Result } from '@/types/core/base';
import { apiCache } from '@/services/api/cache';

/**
 * API 客户端类
 */
export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 运行请求拦截器
   */
  private async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * 运行响应拦截器
   */
  private async runResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse) as ApiResponse<T>;
    }
    return modifiedResponse;
  }

  /**
   * 运行错误拦截器
   */
  private async runErrorInterceptors(error: ApiErrorResponse): Promise<ApiErrorResponse> {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    return modifiedError;
  }

  /**
   * 构建完整URL
   */
  private buildUrl(url: string, params?: Record<string, unknown>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}${searchParams.toString()}`;
  }

  /**
   * 核心请求方法
   */
  private async request<T = unknown>(
    url: string,
    method: keyof typeof HttpMethod = 'GET',
    data?: unknown,
    config?: RequestConfig
  ): Promise<Result<T, ApiErrorResponse>> {
    try {
      // 合并配置
      const requestConfig: RequestConfig = {
        timeout: this.config.timeout,
        retries: this.config.retries,
        retryDelay: this.config.retryDelay,
        headers: { ...this.config.defaultHeaders },
        cache: this.config.enableCache,
        cacheTTL: this.config.defaultCacheTTL,
        ...config,
      };

      // 运行请求拦截器
      const processedConfig = await this.runRequestInterceptors(requestConfig);

      // 构建完整URL
      const fullUrl = this.buildUrl(url, processedConfig.params);

      // 准备请求选项
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...processedConfig.headers,
        },
      };

      // 添加请求体（如果不是 GET 请求）
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // 发送请求
      const response = await fetch(fullUrl, requestOptions);

      // 解析响应
      let responseData: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as unknown as T;
      }

      // 检查HTTP状态码
      if (!response.ok) {
        const error: ApiErrorResponse = {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Request failed',
          statusCode: response.status as any,
          path: url,
          method: method as any,
          timestamp: Date.now().toString(),
          details: responseData as Record<string, unknown>,
        };
        
        const processedError = await this.runErrorInterceptors(error);
        return { success: false, error: processedError };
      }

      // 构建成功响应
      const apiResponse: ApiResponse<T> = {
        success: true,
        data: responseData,
        message: 'Success',
        code: response.status as any,
        timestamp: Date.now().toString(),
        traceId: response.headers.get('x-trace-id') || `trace-${Date.now()}`,
      };

      // 运行响应拦截器
      const processedResponse = await this.runResponseInterceptors(apiResponse);
      return { success: true, data: processedResponse.data };

    } catch (error) {
      const apiError: ApiErrorResponse = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        statusCode: 0 as any,
        path: url,
        method: method as any,
        timestamp: Date.now().toString(),
        details: error as Record<string, unknown>,
      };
      
      const processedError = await this.runErrorInterceptors(apiError);
      return { success: false, error: processedError };
    }
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>> {
    const cacheKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;
    
    // 检查缓存
    if (config?.cache !== false && this.config.enableCache) {
      const cached = await apiCache.get<T>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    const result = await this.request<T>(url, 'GET', undefined, config);

    // 缓存成功响应
    if (result.success && config?.cache !== false && this.config.enableCache) {
      await apiCache.set(cacheKey, result.data, config?.cacheTTL);
    }

    return result;
  }

  /**
   * POST 请求
   */
  async post<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>> {
    return this.request<T>(url, 'POST', data, config);
  }

  /**
   * PUT 请求
   */
  async put<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>> {
    return this.request<T>(url, 'PUT', data, config);
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>> {
    return this.request<T>(url, 'PATCH', data, config);
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>> {
    return this.request<T>(url, 'DELETE', undefined, config);
  }
}

/**
 * 创建 API 客户端实例
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};
