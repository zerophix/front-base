/**
 * API 服务基础类
 * 提供统一的API调用接口和错误处理机制
 */

import type { 
  ApiResponse, 
  ApiErrorResponse, 
  CrudApi, 
  PaginationResponse, 
  BaseQueryParams,
  ID,
  Result
} from '@/types/core';
import { apiClient } from './instance';

/**
 * 基础API服务类
 * 提供标准的CRUD操作和错误处理
 */
export abstract class BaseApiService<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
> implements CrudApi<T, CreateInput, UpdateInput, QueryParams> {
  
  protected readonly baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 创建资源
   */
  async create(input: CreateInput): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(this.baseUrl, input);
  }

  /**
   * 根据ID获取资源
   */
  async getById(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.get<T>(`${this.baseUrl}/${id}`);
  }

  /**
   * 查询资源列表
   */
  async list(params?: QueryParams): Promise<Result<PaginationResponse<T>, ApiErrorResponse>> {
    return apiClient.get<PaginationResponse<T>>(this.baseUrl, { params: params as Record<string, unknown> });
  }

  /**
   * 更新资源
   */
  async update(input: UpdateInput): Promise<Result<T, ApiErrorResponse>> {
    const { id, ...data } = input as UpdateInput & { id: ID };
    return apiClient.put<T>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 删除资源
   */
  async delete(id: ID): Promise<Result<void, ApiErrorResponse>> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * 批量删除
   */
  async batchDelete(ids: ID[]): Promise<Result<void, ApiErrorResponse>> {
    return apiClient.post<void>(`${this.baseUrl}/batch-delete`, { ids });
  }

  /**
   * 统一错误处理
   */
  protected handleError(error: unknown): ApiErrorResponse {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return error as ApiErrorResponse;
    }
    
    // 默认错误响应
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      path: this.baseUrl,
      method: 'GET',
      timestamp: Date.now().toString(),
      details: error as Record<string, unknown>,
    };
  }

  /**
   * 构建查询URL
   */
  protected buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = `${this.baseUrl}${path}`;
    if (!params) return url;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }
}

/**
 * API服务工厂函数
 * 快速创建标准的CRUD API服务
 */
export function createApiService<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
>(baseUrl: string) {
  return new (class extends BaseApiService<T, CreateInput, UpdateInput, QueryParams> {
    constructor() {
      super(baseUrl);
    }
  })();
}