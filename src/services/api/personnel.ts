/**
 * 人员管理 API
 */

import { BaseApiService, createApiService } from './base';
import { apiClient } from './instance';
import type { 
  IPersonnel, 
  IPersonnelRegistration,
  IPersonnelChange,
  IPersonnelQualification,
  ITrainingRecord,
  ITrainingPlan,
} from '@/types/personnel';
import type { PaginationResponse, BaseQueryParams, ID, Result } from '@/types/core';
import type { ApiErrorResponse } from '@/types/core/api';

/**
 * 人员查询参数
 */
export interface PersonnelQueryParams extends BaseQueryParams {
  readonly department?: string;
  readonly position?: string;
  readonly status?: 'active' | 'inactive' | 'pending';
}

/**
 * 人员管理 API 服务
 */
class PersonnelApiService extends BaseApiService<IPersonnel, Partial<IPersonnel>, Partial<IPersonnel> & { id: ID }, PersonnelQueryParams> {
  /**
   * 导出人员数据
   */
  async export(params?: PersonnelQueryParams): Promise<Result<Blob, ApiErrorResponse>> {
    return apiClient.get<Blob>(`${this.baseUrl}/export`, {
      params: params as Record<string, unknown>,
    });
  }

  /**
   * 导入人员数据
   */
  async import(file: File): Promise<Result<{ successCount: number; errorCount: number }, ApiErrorResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<{ successCount: number; errorCount: number }>(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

/**
 * 人员变更 API 服务
 */
class PersonnelChangeApiService extends BaseApiService<IPersonnelChange, Partial<IPersonnelChange>, Partial<IPersonnelChange> & { id: ID }> {
  /**
   * 审批人员变更
   */
  async approve(id: ID, approved: boolean, comment?: string): Promise<Result<IPersonnelChange, ApiErrorResponse>> {
    return apiClient.post<IPersonnelChange>(`${this.baseUrl}/${id}/approve`, {
      approved,
      comment,
    });
  }
}

/**
 * 人员资质 API 服务
 */
class PersonnelQualificationApiService extends BaseApiService<IPersonnelQualification, Partial<IPersonnelQualification>, Partial<IPersonnelQualification> & { id: ID }> {
  /**
   * 获取即将过期的资质
   */
  async getExpiring(days: number = 30): Promise<Result<readonly IPersonnelQualification[], ApiErrorResponse>> {
    return apiClient.get<readonly IPersonnelQualification[]>(`${this.baseUrl}/expiring`, {
      params: { days },
    });
  }
}

/**
 * 培训计划 API 服务
 */
class TrainingPlanApiService extends BaseApiService<ITrainingPlan, Partial<ITrainingPlan>, Partial<ITrainingPlan> & { id: ID }> {
  /**
   * 执行培训计划
   */
  async execute(id: ID): Promise<Result<ITrainingPlan, ApiErrorResponse>> {
    return apiClient.post<ITrainingPlan>(`${this.baseUrl}/${id}/execute`);
  }
}

// 创建API服务实例
export const personnelApi = createApiService<IPersonnel, Partial<IPersonnel>, Partial<IPersonnel> & { id: ID }, PersonnelQueryParams>('/personnel');
export const personnelRegistrationApi = createApiService<IPersonnelRegistration>('/personnel/registration');
export const personnelChangeApi = createApiService<IPersonnelChange>('/personnel/change');
export const personnelQualificationApi = createApiService<IPersonnelQualification>('/personnel/qualification');
export const trainingRecordApi = createApiService<ITrainingRecord>('/personnel/training/record');
export const trainingPlanApi = createApiService<ITrainingPlan>('/personnel/training/plan');

// 扩展API服务实例
const extendedPersonnelApi = Object.assign(personnelApi, {
  export: async (params?: PersonnelQueryParams) => {
    const service = new PersonnelApiService('/personnel');
    return service.export(params);
  },
  import: async (file: File) => {
    const service = new PersonnelApiService('/personnel');
    return service.import(file);
  },
});

const extendedPersonnelChangeApi = Object.assign(personnelChangeApi, {
  approve: async (id: string, approved: boolean, comment?: string) => {
    const service = new PersonnelChangeApiService('/personnel/change');
    return service.approve(id, approved, comment);
  },
});

const extendedPersonnelQualificationApi = Object.assign(personnelQualificationApi, {
  getExpiring: async (days?: number) => {
    const service = new PersonnelQualificationApiService('/personnel/qualification');
    return service.getExpiring(days);
  },
});

const extendedTrainingPlanApi = Object.assign(trainingPlanApi, {
  execute: async (id: string) => {
    const service = new TrainingPlanApiService('/personnel/training/plan');
    return service.execute(id);
  },
});

// 向后兼容的导出
export const personnelApiLegacy = {
  getPersonnelList: (params: PersonnelQueryParams) => extendedPersonnelApi.list(params),
  getPersonnelById: (id: string) => extendedPersonnelApi.getById(id),
  createPersonnel: (data: Partial<IPersonnel>) => extendedPersonnelApi.create(data),
  updatePersonnel: (id: string, data: Partial<IPersonnel>) => extendedPersonnelApi.update({ id, ...data }),
  deletePersonnel: (id: string) => extendedPersonnelApi.delete(id),
  batchDeletePersonnel: (ids: string[]) => extendedPersonnelApi.batchDelete(ids),
  exportPersonnel: (params?: PersonnelQueryParams) => extendedPersonnelApi.export(params),
  importPersonnel: (file: File) => extendedPersonnelApi.import(file),

  registration: {
    getList: (params: BaseQueryParams) => personnelRegistrationApi.list(params),
    getById: (id: string) => personnelRegistrationApi.getById(id),
    create: (data: Partial<IPersonnelRegistration>) => personnelRegistrationApi.create(data),
    update: (id: string, data: Partial<IPersonnelRegistration>) => personnelRegistrationApi.update({ id, ...data }),
    delete: (id: string) => personnelRegistrationApi.delete(id),
  },

  change: {
    getList: (params: BaseQueryParams) => extendedPersonnelChangeApi.list(params),
    create: (data: Partial<IPersonnelChange>) => extendedPersonnelChangeApi.create(data),
    approve: (id: string, approved: boolean, comment?: string) => extendedPersonnelChangeApi.approve(id, approved, comment),
  },

  qualification: {
    getList: (params: BaseQueryParams) => extendedPersonnelQualificationApi.list(params),
    create: (data: Partial<IPersonnelQualification>) => extendedPersonnelQualificationApi.create(data),
    update: (id: string, data: Partial<IPersonnelQualification>) => extendedPersonnelQualificationApi.update({ id, ...data }),
    getExpiring: (days?: number) => extendedPersonnelQualificationApi.getExpiring(days),
  },

  training: {
    getList: (params: BaseQueryParams) => trainingRecordApi.list(params),
    create: (data: Partial<ITrainingRecord>) => trainingRecordApi.create(data),
    update: (id: string, data: Partial<ITrainingRecord>) => trainingRecordApi.update({ id, ...data }),
  },

  trainingPlan: {
    getList: (params: BaseQueryParams) => extendedTrainingPlanApi.list(params),
    create: (data: Partial<ITrainingPlan>) => extendedTrainingPlanApi.create(data),
    update: (id: string, data: Partial<ITrainingPlan>) => extendedTrainingPlanApi.update({ id, ...data }),
    execute: (id: string) => extendedTrainingPlanApi.execute(id),
  },
};

