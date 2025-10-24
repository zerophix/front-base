/**
 * 增强API服务使用示例
 * 展示如何使用新的增强API服务减少代码重复
 */

import { 
  EnhancedApiService, 
  createEnhancedApiService, 
  ApiServiceComposer,
  withCache,
  withOptimisticLocking 
} from '../enhanced-base';
import type { 
  IPersonnel, 
  IPersonnelRegistration,
  IPersonnelChange,
  IEquipment,
  IEquipmentCalibration,
  IStandardSubstance
} from '@/types';
import type { BaseQueryParams, ID, Result, ApiErrorResponse } from '@/types/core';

/**
 * 示例1: 使用增强API服务替代原有的重复代码
 */

// 原来需要为每个API服务单独实现的扩展方法，现在可以直接使用
export const personnelApi = createEnhancedApiService<IPersonnel>('/personnel', {
  enableCache: true,
  cacheTTL: 300000,
  enableOptimisticLocking: true
});

// 现在可以直接使用通用方法，无需重复实现
// personnelApi.export() - 导出功能
// personnelApi.import() - 导入功能  
// personnelApi.approve() - 审批功能
// personnelApi.getExpiring() - 获取即将过期的记录
// personnelApi.search() - 搜索功能
// personnelApi.getStats() - 统计信息

/**
 * 示例2: 自定义扩展特定业务逻辑
 */
class PersonnelApiService extends EnhancedApiService<IPersonnel> {
  constructor() {
    super('/personnel');
  }

  // 只需要实现特定的业务逻辑，通用功能已经继承
  async getByDepartment(department: string): Promise<Result<readonly IPersonnel[], ApiErrorResponse>> {
    const result = await this.search('', { department } as any);
    if (result.success) {
      return { success: true, data: result.data.data };
    }
    return result;
  }

  async transferDepartment(id: ID, newDepartment: string, reason: string): Promise<Result<IPersonnel, ApiErrorResponse>> {
    return this.submit(id, { newDepartment, reason, action: 'transfer' });
  }
}

/**
 * 示例3: 服务组合器使用
 */
const qualityServices = new ApiServiceComposer({
  personnel: createEnhancedApiService<IPersonnel>('/personnel'),
  equipment: createEnhancedApiService<IEquipment>('/equipment'),
  standardSubstance: createEnhancedApiService<IStandardSubstance>('/quality/standard-substance'),
});

// 使用组合器进行批量操作
async function batchQualityOperations() {
  // 批量操作示例
  const results = await qualityServices.batchOperation([
    {
      service: 'personnel',
      operation: 'getStats',
      params: [{ department: 'quality' }]
    },
    {
      service: 'equipment',
      operation: 'getExpiring',
      params: [30]
    },
    {
      service: 'standardSubstance',
      operation: 'getOverdue',
      params: []
    }
  ]);

  return results;
}

// 事务操作示例
async function createQualityRecord(personnelData: Partial<IPersonnel>, equipmentData: Partial<IEquipment>) {
  return qualityServices.transaction([
    {
      service: 'personnel',
      operation: 'create',
      params: [personnelData],
      rollback: {
        operation: 'delete',
        params: ['{{result.id}}'] // 占位符，实际使用时会被替换
      }
    },
    {
      service: 'equipment',
      operation: 'create',
      params: [{ ...equipmentData, assignedTo: '{{personnel.id}}' }],
      rollback: {
        operation: 'delete',
        params: ['{{result.id}}']
      }
    }
  ]);
}

/**
 * 示例4: 装饰器使用
 */
class CachedPersonnelService extends EnhancedApiService<IPersonnel> {
  constructor() {
    super('/personnel');
  }
}

// 应用装饰器
const cachedPersonnelService = withCache(
  withOptimisticLocking(new CachedPersonnelService()),
  600000 // 10分钟缓存
);

/**
 * 示例5: 对比原有代码的改进
 */

// 原有代码（重复的模式）:
/*
class OldPersonnelApiService extends BaseApiService<IPersonnel> {
  async export(params?: PersonnelQueryParams) {
    return apiClient.get<Blob>(`${this.baseUrl}/export`, {
      params,
      headers: { 'Accept': 'application/octet-stream' }
    });
  }

  async import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<IPersonnel[]>(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async approve(id: ID, approved: boolean, comment?: string) {
    return apiClient.post<IPersonnel>(`${this.baseUrl}/${id}/approve`, {
      approved,
      comment,
    });
  }

  async getExpiring(days?: number) {
    return apiClient.get<IPersonnel[]>(`${this.baseUrl}/expiring`, {
      params: { days: days || 30 }
    });
  }
}

class OldEquipmentApiService extends BaseApiService<IEquipment> {
  // 同样的方法需要重复实现...
  async export(params?: EquipmentQueryParams) { ... }
  async import(file: File) { ... }
  async approve(id: ID, approved: boolean, comment?: string) { ... }
  async getExpiring(days?: number) { ... }
}
*/

// 新代码（使用增强API服务）:
export const newPersonnelApi = createEnhancedApiService<IPersonnel>('/personnel');
export const newEquipmentApi = createEnhancedApiService<IEquipment>('/equipment');

// 所有通用方法都已经可用，无需重复实现！

/**
 * 示例6: 类型安全的使用方式
 */
interface PersonnelQueryParams extends BaseQueryParams {
  department?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  pageSize?: number;
}

const typedPersonnelApi = createEnhancedApiService<
  IPersonnel,
  Partial<IPersonnel>,
  Partial<IPersonnel> & { id: ID },
  PersonnelQueryParams
>('/personnel');

// 现在所有方法都有正确的类型推断
async function typedExample() {
  // 类型安全的查询
  const result = await typedPersonnelApi.list({
    department: 'quality',
    page: 1,
    pageSize: 10
  });

  // 类型安全的创建
  const createResult = await typedPersonnelApi.create({
    name: 'John Doe',
    department: 'quality'
  });

  // 类型安全的搜索
  const searchResult = await typedPersonnelApi.search('John', {
    department: 'quality'
  });

  return { result, createResult, searchResult };
}

/**
 * 代码重复减少统计:
 * 
 * 原有方式:
 * - 每个API服务需要重复实现 export, import, approve, getExpiring 等方法
 * - 5个API服务 × 4个通用方法 = 20个重复的方法实现
 * - 每个方法平均10行代码 = 200行重复代码
 * 
 * 新方式:
 * - 通用方法在 EnhancedApiService 中实现一次
 * - 所有API服务自动继承这些方法
 * - 减少了约200行重复代码
 * - 提高了代码一致性和可维护性
 */