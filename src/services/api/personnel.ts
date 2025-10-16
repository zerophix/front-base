/**
 * 人员管理 API
 */

import { apiClient } from './instance';
import type { 
  IPersonnel, 
  IPersonnelRegistration,
  IPersonnelChange,
  IPersonnelQualification,
  ITrainingRecord,
  ITrainingPlan,
} from '@/types/personnel';
import type { IPaginationResponse, IPageQueryParams } from '@/types';

/**
 * 人员管理 API 服务
 */
export const personnelApi = {
  /**
   * 获取人员列表
   */
  getPersonnelList: (params: IPageQueryParams) => {
    return apiClient.get<IPaginationResponse<IPersonnel>>('/personnel', params);
  },

  /**
   * 获取人员详情
   */
  getPersonnelById: (id: string) => {
    return apiClient.get<IPersonnel>(`/personnel/${id}`);
  },

  /**
   * 创建人员
   */
  createPersonnel: (data: Partial<IPersonnel>) => {
    return apiClient.post<IPersonnel>('/personnel', data);
  },

  /**
   * 更新人员信息
   */
  updatePersonnel: (id: string, data: Partial<IPersonnel>) => {
    return apiClient.put<IPersonnel>(`/personnel/${id}`, data);
  },

  /**
   * 删除人员
   */
  deletePersonnel: (id: string) => {
    return apiClient.delete<void>(`/personnel/${id}`);
  },

  /**
   * 批量删除人员
   */
  batchDeletePersonnel: (ids: string[]) => {
    return apiClient.post<void>('/personnel/batch-delete', { ids });
  },

  /**
   * 导出人员列表
   */
  exportPersonnel: (params: any) => {
    return apiClient.get<Blob>('/personnel/export', params, {
      headers: { 'Accept': 'application/vnd.ms-excel' },
    });
  },

  /**
   * 导入人员数据
   */
  importPersonnel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ success: number; failed: number }>('/personnel/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 人员注册相关
  registration: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IPersonnelRegistration>>('/personnel/registration', params);
    },
    
    getById: (id: string) => {
      return apiClient.get<IPersonnelRegistration>(`/personnel/registration/${id}`);
    },
    
    create: (data: Partial<IPersonnelRegistration>) => {
      return apiClient.post<IPersonnelRegistration>('/personnel/registration', data);
    },
    
    update: (id: string, data: Partial<IPersonnelRegistration>) => {
      return apiClient.put<IPersonnelRegistration>(`/personnel/registration/${id}`, data);
    },
    
    delete: (id: string) => {
      return apiClient.delete<void>(`/personnel/registration/${id}`);
    },
  },

  // 人员变动相关
  change: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IPersonnelChange>>('/personnel/change', params);
    },
    
    create: (data: Partial<IPersonnelChange>) => {
      return apiClient.post<IPersonnelChange>('/personnel/change', data);
    },
    
    approve: (id: string, approved: boolean, comment?: string) => {
      return apiClient.post<IPersonnelChange>(`/personnel/change/${id}/approve`, { approved, comment });
    },
  },

  // 人员资质相关
  qualification: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IPersonnelQualification>>('/personnel/qualification', params);
    },
    
    create: (data: Partial<IPersonnelQualification>) => {
      return apiClient.post<IPersonnelQualification>('/personnel/qualification', data);
    },
    
    update: (id: string, data: Partial<IPersonnelQualification>) => {
      return apiClient.put<IPersonnelQualification>(`/personnel/qualification/${id}`, data);
    },
    
    // 获取即将过期的资质
    getExpiring: (days: number = 30) => {
      return apiClient.get<IPersonnelQualification[]>('/personnel/qualification/expiring', { days });
    },
  },

  // 培训记录相关
  training: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<ITrainingRecord>>('/personnel/training/record', params);
    },
    
    create: (data: Partial<ITrainingRecord>) => {
      return apiClient.post<ITrainingRecord>('/personnel/training/record', data);
    },
    
    update: (id: string, data: Partial<ITrainingRecord>) => {
      return apiClient.put<ITrainingRecord>(`/personnel/training/record/${id}`, data);
    },
  },

  // 培训计划相关
  trainingPlan: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<ITrainingPlan>>('/personnel/training/plan', params);
    },
    
    create: (data: Partial<ITrainingPlan>) => {
      return apiClient.post<ITrainingPlan>('/personnel/training/plan', data);
    },
    
    update: (id: string, data: Partial<ITrainingPlan>) => {
      return apiClient.put<ITrainingPlan>(`/personnel/training/plan/${id}`, data);
    },
    
    execute: (id: string) => {
      return apiClient.post<ITrainingPlan>(`/personnel/training/plan/${id}/execute`);
    },
  },
};

