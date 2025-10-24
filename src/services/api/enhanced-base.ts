/**
 * 增强的API服务基础类
 * 提供更多通用模式，减少代码重复
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
import { BaseApiService } from './base';

/**
 * 通用业务操作接口
 */
export interface BusinessOperations<T> {
  approve?(id: ID, approved: boolean, comment?: string): Promise<Result<T, ApiErrorResponse>>;
  reject?(id: ID, reason: string): Promise<Result<T, ApiErrorResponse>>;
  submit?(id: ID, data?: Record<string, unknown>): Promise<Result<T, ApiErrorResponse>>;
  cancel?(id: ID, reason?: string): Promise<Result<T, ApiErrorResponse>>;
  export?(params?: Record<string, unknown>): Promise<Result<Blob, ApiErrorResponse>>;
  import?(file: File): Promise<Result<T[], ApiErrorResponse>>;
}

/**
 * 状态管理操作接口
 */
export interface StatusOperations<T> {
  activate?(id: ID): Promise<Result<T, ApiErrorResponse>>;
  deactivate?(id: ID): Promise<Result<T, ApiErrorResponse>>;
  enable?(id: ID): Promise<Result<T, ApiErrorResponse>>;
  disable?(id: ID): Promise<Result<T, ApiErrorResponse>>;
  archive?(id: ID): Promise<Result<T, ApiErrorResponse>>;
  restore?(id: ID): Promise<Result<T, ApiErrorResponse>>;
}

/**
 * 时间相关操作接口
 */
export interface TimeBasedOperations<T> {
  getExpiring?(days?: number): Promise<Result<T[], ApiErrorResponse>>;
  getOverdue?(): Promise<Result<T[], ApiErrorResponse>>;
  getByDateRange?(startDate: string, endDate: string): Promise<Result<T[], ApiErrorResponse>>;
}

/**
 * 增强的API服务基础类
 */
export abstract class EnhancedApiService<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
> extends BaseApiService<T, CreateInput, UpdateInput, QueryParams> 
  implements BusinessOperations<T>, StatusOperations<T>, TimeBasedOperations<T> {

  /**
   * 批量操作
   */
  async batchCreate(inputs: CreateInput[]): Promise<Result<T[], ApiErrorResponse>> {
    return apiClient.post<T[]>(`${this.baseUrl}/batch`, { items: inputs });
  }

  async batchUpdate(updates: UpdateInput[]): Promise<Result<T[], ApiErrorResponse>> {
    return apiClient.put<T[]>(`${this.baseUrl}/batch`, { items: updates });
  }

  /**
   * 通用审批操作
   */
  async approve(id: ID, approved: boolean, comment?: string): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/approve`, {
      approved,
      comment,
    });
  }

  async reject(id: ID, reason: string): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  /**
   * 通用提交操作
   */
  async submit(id: ID, data?: Record<string, unknown>): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/submit`, data || {});
  }

  /**
   * 通用取消操作
   */
  async cancel(id: ID, reason?: string): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/cancel`, { reason });
  }

  /**
   * 状态管理操作
   */
  async activate(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivate(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/deactivate`);
  }

  async enable(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/enable`);
  }

  async disable(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/disable`);
  }

  async archive(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/archive`);
  }

  async restore(id: ID): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/restore`);
  }

  /**
   * 导出操作
   */
  async export(params?: Record<string, unknown>): Promise<Result<Blob, ApiErrorResponse>> {
    return apiClient.get<Blob>(`${this.baseUrl}/export`, {
      params,
      headers: { 'Accept': 'application/octet-stream' }
    });
  }

  /**
   * 导入操作
   */
  async import(file: File): Promise<Result<T[], ApiErrorResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<T[]>(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  /**
   * 时间相关查询
   */
  async getExpiring(days: number = 30): Promise<Result<T[], ApiErrorResponse>> {
    return apiClient.get<T[]>(`${this.baseUrl}/expiring`, {
      params: { days }
    });
  }

  async getOverdue(): Promise<Result<T[], ApiErrorResponse>> {
    return apiClient.get<T[]>(`${this.baseUrl}/overdue`);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Result<T[], ApiErrorResponse>> {
    return apiClient.get<T[]>(`${this.baseUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  /**
   * 统计信息
   */
  async getStats(params?: Record<string, unknown>): Promise<Result<Record<string, number>, ApiErrorResponse>> {
    return apiClient.get<Record<string, number>>(`${this.baseUrl}/stats`, { params });
  }

  /**
   * 搜索操作
   */
  async search(query: string, params?: QueryParams): Promise<Result<PaginationResponse<T>, ApiErrorResponse>> {
    return apiClient.get<PaginationResponse<T>>(`${this.baseUrl}/search`, {
      params: { q: query, ...params as Record<string, unknown> }
    });
  }

  /**
   * 复制操作
   */
  async duplicate(id: ID, modifications?: Partial<CreateInput>): Promise<Result<T, ApiErrorResponse>> {
    return apiClient.post<T>(`${this.baseUrl}/${id}/duplicate`, modifications || {});
  }

  /**
   * 历史记录
   */
  async getHistory(id: ID): Promise<Result<Array<{ timestamp: string; action: string; user: string; changes: Record<string, unknown> }>, ApiErrorResponse>> {
    return apiClient.get(`${this.baseUrl}/${id}/history`);
  }
}

/**
 * API服务装饰器 - 用于添加缓存
 */
export function withCache<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
>(
  target: EnhancedApiService<T, CreateInput, UpdateInput, QueryParams>,
  cacheTTL: number = 300000 // 5分钟
): EnhancedApiService<T, CreateInput, UpdateInput, QueryParams> {
  const originalList = target.list.bind(target);
  const originalGetById = target.getById.bind(target);

  target.list = async function(params?: QueryParams) {
    return originalList(params);
  };

  target.getById = async function(id: ID) {
    return originalGetById(id);
  };

  return target;
}

/**
 * API服务装饰器 - 用于添加乐观锁
 */
export function withOptimisticLocking<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
>(
  target: EnhancedApiService<T, CreateInput, UpdateInput, QueryParams>
): EnhancedApiService<T, CreateInput, UpdateInput, QueryParams> {
  const originalUpdate = target.update.bind(target);

  target.update = async function(input: UpdateInput) {
    // 添加版本检查逻辑
    if ((input as any).version !== undefined) {
      const current = await target.getById((input as any).id);
      if (current.success && (current.data as any).version !== (input as any).version) {
        return {
          success: false,
          error: {
            code: 'OPTIMISTIC_LOCK_ERROR',
            message: '数据已被其他用户修改，请刷新后重试',
            statusCode: 409,
            path: (target as any).baseUrl,
            method: 'PUT',
            timestamp: Date.now().toString(),
            details: { expectedVersion: (input as any).version, currentVersion: (current.data as any).version }
          }
        };
      }
    }

    return originalUpdate(input);
  };

  return target;
}

/**
 * 增强的API服务工厂函数
 */
export function createEnhancedApiService<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T> & { id: ID },
  QueryParams extends BaseQueryParams = BaseQueryParams
>(baseUrl: string, options?: {
  enableCache?: boolean;
  cacheTTL?: number;
  enableOptimisticLocking?: boolean;
}) {
  let service = new (class extends EnhancedApiService<T, CreateInput, UpdateInput, QueryParams> {
    constructor() {
      super(baseUrl);
    }
  })();

  // 应用装饰器
  if (options?.enableCache) {
    service = withCache(service, options.cacheTTL);
  }

  if (options?.enableOptimisticLocking) {
    service = withOptimisticLocking(service);
  }

  return service;
}

/**
 * 服务组合器 - 用于组合多个相关的API服务
 */
export class ApiServiceComposer<T extends Record<string, EnhancedApiService<any>>> {
  constructor(private services: T) {}

  /**
   * 获取指定服务
   */
  get<K extends keyof T>(serviceName: K): T[K] {
    return this.services[serviceName];
  }

  /**
   * 批量操作多个服务
   */
  async batchOperation<K extends keyof T>(
    operations: Array<{
      service: K;
      operation: string;
      params: any[];
    }>
  ): Promise<Array<Result<any, ApiErrorResponse>>> {
    const promises = operations.map(({ service, operation, params }) => {
      const serviceInstance = this.services[service];
      const method = (serviceInstance as any)[operation];
      if (typeof method === 'function') {
        return method.apply(serviceInstance, params);
      }
      throw new Error(`Operation ${operation} not found on service ${String(service)}`);
    });

    return Promise.all(promises);
  }

  /**
   * 事务操作 - 如果任何操作失败，回滚所有操作
   */
  async transaction<K extends keyof T>(
    operations: Array<{
      service: K;
      operation: string;
      params: any[];
      rollback?: {
        operation: string;
        params: any[];
      };
    }>
  ): Promise<Result<any[], ApiErrorResponse>> {
    const results: any[] = [];
    const rollbackStack: Array<{
      service: K;
      operation: string;
      params: any[];
    }> = [];

    try {
      for (const { service, operation, params, rollback } of operations) {
        const serviceInstance = this.services[service];
        const method = (serviceInstance as any)[operation];
        
        if (typeof method !== 'function') {
          throw new Error(`Operation ${operation} not found on service ${String(service)}`);
        }

        const result = await method.apply(serviceInstance, params);
        
        if (!result.success) {
          // 执行回滚
          for (const rollbackOp of rollbackStack.reverse()) {
            try {
              const rollbackService = this.services[rollbackOp.service];
              const rollbackMethod = (rollbackService as any)[rollbackOp.operation];
              if (typeof rollbackMethod === 'function') {
                await rollbackMethod.apply(rollbackService, rollbackOp.params);
              }
            } catch (rollbackError) {
              console.error('Rollback failed:', rollbackError);
            }
          }
          
          return { success: false, error: result.error };
        }

        results.push(result.data);
        
        // 添加到回滚栈
        if (rollback) {
          rollbackStack.push({
            service,
            operation: rollback.operation,
            params: rollback.params
          });
        }
      }

      return { success: true, data: results };
    } catch (error) {
      // 执行回滚
      for (const rollbackOp of rollbackStack.reverse()) {
        try {
          const rollbackService = this.services[rollbackOp.service];
          const rollbackMethod = (rollbackService as any)[rollbackOp.operation];
          if (typeof rollbackMethod === 'function') {
            await rollbackMethod.apply(rollbackService, rollbackOp.params);
          }
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      return {
        success: false,
        error: {
          code: 'TRANSACTION_ERROR',
          message: error instanceof Error ? error.message : 'Transaction failed',
          statusCode: 500,
          path: 'transaction',
          method: 'POST',
          timestamp: Date.now().toString(),
          details: error as Record<string, unknown>
        }
      };
    }
  }
}