/**
 * API 实例配置
 * 创建和导出默认的 API 客户端实例
 */

import { createApiClient } from '@/services/api/client';
import {
  tokenRequestInterceptor,
  csrfRequestInterceptor,
  logRequestInterceptor,
  logResponseInterceptor,
  requestInterceptor,
  responseInterceptor,
  businessCodeResponseInterceptor,
  errorHandlerInterceptor,
} from '@/services/api/interceptors';

/**
 * API 基础URL配置
 */
const getBaseURL = (): string => {
  if (typeof window === 'undefined') {
    // 服务端渲染时使用的URL
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  }

  // 客户端根据环境变量或当前域名配置
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
};

/**
 * 创建默认API客户端实例
 */
export const apiClient = createApiClient({
  baseURL: getBaseURL(),
  timeout: 30000, // 30秒超时
  retries: 3,
  retryDelay: 1000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  enableCache: true,
  defaultCacheTTL: 300000, // 5分钟
});

// 添加拦截器
apiClient.addRequestInterceptor(requestInterceptor);
apiClient.addRequestInterceptor(tokenRequestInterceptor);
apiClient.addRequestInterceptor(csrfRequestInterceptor);
apiClient.addRequestInterceptor(logRequestInterceptor);

apiClient.addResponseInterceptor(responseInterceptor);
apiClient.addResponseInterceptor(logResponseInterceptor);
apiClient.addResponseInterceptor(businessCodeResponseInterceptor);

apiClient.addErrorInterceptor(errorHandlerInterceptor);

/**
 * 导出便捷方法
 */
export const get = apiClient.get.bind(apiClient);
export const post = apiClient.post.bind(apiClient);
export const put = apiClient.put.bind(apiClient);
export const patch = apiClient.patch.bind(apiClient);
export const del = apiClient.delete.bind(apiClient);

/**
 * 导出类型
 */
export type { ApiClient } from '@/services/api/client';
export * from '@/services/api/interceptors';

