/**
 * HTTP 客户端封装
 * 基于 fetch API 实现，集成缓存层
 * 彻底重写版本 - 零兼容旧代码
 */

import { 
  IApiClientConfig, 
  IRequestConfig, 
  HttpMethod, 
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor 
} from '@/types/api';
import { IApiResponse } from '@/types/common';
import { apiCache } from './cache';

/**
 * API 客户端类 - 集成缓存
 */
export class ApiClient {
  private config: IApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private cacheEnabled: boolean = true;

  constructor(config: IApiClientConfig) {
    this.config = {
      timeout: 10000,
      withCredentials: true,
      ...config,
    };

    // 注册配置中的拦截器
    if (config.requestInterceptors) {
      this.requestInterceptors.push(...config.requestInterceptors);
    }
    if (config.responseInterceptors) {
      this.responseInterceptors.push(...config.responseInterceptors);
    }
    if (config.errorInterceptors) {
      this.errorInterceptors.push(...config.errorInterceptors);
    }
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
   * 执行请求拦截器
   */
  private async runRequestInterceptors(config: IRequestConfig): Promise<IRequestConfig> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * 执行响应拦截器
   */
  private async runResponseInterceptors<T>(response: IApiResponse<T>): Promise<IApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * 执行错误拦截器
   */
  private async runErrorInterceptors(error: ApiError): Promise<never> {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      try {
        modifiedError = await interceptor(modifiedError);
      } catch (e) {
        modifiedError = e as ApiError;
      }
    }
    throw modifiedError;
  }

  /**
   * 构建完整URL
   */
  private buildUrl(url: string, params?: any): string {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    if (!params) return fullUrl;

    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  /**
   * 核心请求方法
   */
  async request<T = any>(config: IRequestConfig): Promise<IApiResponse<T>> {
    try {
      // 执行请求拦截器
      const modifiedConfig = await this.runRequestInterceptors(config);

      // 构建请求配置
      const { url, method, data, params, headers = {}, timeout = this.config.timeout } = modifiedConfig;
      const fullUrl = this.buildUrl(url, params);

      // 合并headers
      const mergedHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...headers,
      };

      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 发送请求
      const response = await fetch(fullUrl, {
        method,
        headers: mergedHeaders,
        body: data ? JSON.stringify(data) : undefined,
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 解析响应
      let responseData: IApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        // 非JSON响应，包装成标准格式
        const text = await response.text();
        responseData = {
          code: response.status,
          message: response.statusText,
          data: text as any,
        };
      }

      // 检查HTTP状态码
      if (!response.ok) {
        throw new ApiError(
          responseData.code || response.status,
          responseData.message || response.statusText,
          responseData.data,
        );
      }

      // 执行响应拦截器
      const modifiedResponse = await this.runResponseInterceptors(responseData);

      return modifiedResponse;
    } catch (error) {
      // 处理错误
      if (error instanceof ApiError) {
        return this.runErrorInterceptors(error);
      }

      // 处理网络错误
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return this.runErrorInterceptors(
            new ApiError(408, '请求超时', { timeout: config.timeout }),
          );
        }
        return this.runErrorInterceptors(
          new ApiError(0, error.message || '网络错误'),
        );
      }

      return this.runErrorInterceptors(
        new ApiError(0, '未知错误'),
      );
    }
  }

  /**
   * GET 请求 - 自动缓存
   */
  async get<T = any>(url: string, params?: any, config?: Partial<IRequestConfig> & { noCache?: boolean; cacheTTL?: number }): Promise<IApiResponse<T>> {
    // 检查缓存
    if (this.cacheEnabled && !config?.noCache) {
      const cached = apiCache.get<IApiResponse<T>>(url, params);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[API Cache] HIT:', url);
        }
        return cached;
      }
    }

    // 发起请求
    const response = await this.request<T>({
      url,
      method: HttpMethod.GET,
      params,
      ...config,
    });

    // 缓存响应
    if (this.cacheEnabled && !config?.noCache) {
      apiCache.set(url, response, params, config?.cacheTTL);
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Cache] SET:', url);
      }
    }

    return response;
  }

  /**
   * POST 请求 - 自动失效缓存
   */
  async post<T = any>(url: string, data?: any, config?: Partial<IRequestConfig> & { invalidateCache?: string | RegExp }): Promise<IApiResponse<T>> {
    const response = await this.request<T>({
      url,
      method: HttpMethod.POST,
      data,
      ...config,
    });

    // POST 后失效相关缓存
    if (config?.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Cache] INVALIDATE:', config.invalidateCache);
      }
    } else {
      // 默认失效当前路径缓存
      apiCache.delete(url);
    }

    return response;
  }

  /**
   * PUT 请求 - 自动失效缓存
   */
  async put<T = any>(url: string, data?: any, config?: Partial<IRequestConfig> & { invalidateCache?: string | RegExp }): Promise<IApiResponse<T>> {
    const response = await this.request<T>({
      url,
      method: HttpMethod.PUT,
      data,
      ...config,
    });

    // PUT 后失效相关缓存
    if (config?.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    } else {
      apiCache.delete(url);
    }

    return response;
  }

  /**
   * PATCH 请求 - 自动失效缓存
   */
  async patch<T = any>(url: string, data?: any, config?: Partial<IRequestConfig> & { invalidateCache?: string | RegExp }): Promise<IApiResponse<T>> {
    const response = await this.request<T>({
      url,
      method: HttpMethod.PATCH,
      data,
      ...config,
    });

    // PATCH 后失效相关缓存
    if (config?.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    } else {
      apiCache.delete(url);
    }

    return response;
  }

  /**
   * DELETE 请求 - 自动失效缓存
   */
  async delete<T = any>(url: string, params?: any, config?: Partial<IRequestConfig> & { invalidateCache?: string | RegExp }): Promise<IApiResponse<T>> {
    const response = await this.request<T>({
      url,
      method: HttpMethod.DELETE,
      params,
      ...config,
    });

    // DELETE 后失效相关缓存
    if (config?.invalidateCache) {
      apiCache.invalidate(config.invalidateCache);
    } else {
      apiCache.delete(url, params);
    }

    return response;
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    apiCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return apiCache.getStats();
  }
}

/**
 * 创建默认的API客户端实例
 */
export const createApiClient = (config: IApiClientConfig): ApiClient => {
  return new ApiClient(config);
};
