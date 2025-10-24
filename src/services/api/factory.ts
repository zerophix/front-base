/**
 * API 工厂函数 - 减少重复的CRUD代码
 */

import { apiClient } from '@/services/api/instance';
import type { IPaginationResponse, IPageQueryParams } from '@/types';

/**
 * 创建标准CRUD API
 */
export function createCrudApi<T>(basePath: string) {
  return {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<T>>(basePath, { params: params as Record<string, unknown> });
    },
    
    getById: (id: string) => {
      return apiClient.get<T>(`${basePath}/${id}`);
    },
    
    create: (data: Partial<T>) => {
      return apiClient.post<T>(basePath, data);
    },
    
    update: (id: string, data: Partial<T>) => {
      return apiClient.put<T>(`${basePath}/${id}`, data);
    },
    
    delete: (id: string) => {
      return apiClient.delete(`${basePath}/${id}`);
    },
  };
}

/**
 * 创建带有审批流程的API
 */
export function createApprovalApi<T>(basePath: string) {
  return {
    ...createCrudApi<T>(basePath),
    
    approve: (id: string, approved: boolean, comment?: string) => {
      return apiClient.post<T>(`${basePath}/${id}/approve`, { approved, comment });
    },
    
    reject: (id: string, comment: string) => {
      return apiClient.post<T>(`${basePath}/${id}/reject`, { comment });
    },
  };
}

/**
 * 创建带有状态管理的API
 */
export function createStatusApi<T>(basePath: string) {
  return {
    ...createCrudApi<T>(basePath),
    
    updateStatus: (id: string, status: string, comment?: string) => {
      return apiClient.post<T>(`${basePath}/${id}/status`, { status, comment });
    },
  };
}

/**
 * 创建文档管理API
 */
export function createDocumentApi<T>(basePath: string) {
  return {
    ...createApprovalApi<T>(basePath),
    
    review: (id: string, result: 'pass' | 'fail' | 'revise', comment?: string) => {
      return apiClient.post<T>(`${basePath}/${id}/review`, { result, comment });
    },
    
    publish: (id: string) => {
      return apiClient.post<T>(`${basePath}/${id}/publish`);
    },
    
    archive: (id: string) => {
      return apiClient.post<T>(`${basePath}/${id}/archive`);
    },
  };
}