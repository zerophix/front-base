/**
 * 设备管理 API
 */

import { apiClient } from './instance';
import type {
  IEquipment,
  IEquipmentCalibration,
  IEquipmentUseRecord,
  IEquipmentMaintenanceRecord,
  IEquipmentMaintenancePlan,
  IEquipmentBorrowApply,
  IEquipmentScrapApply,
  IEquipmentAcceptance,
} from '@/types/equipment';
import type { IPaginationResponse, IPageQueryParams } from '@/types';

/**
 * 设备管理 API 服务
 */
export const equipmentApi = {
  /**
   * 获取设备列表
   */
  getList: (params: IPageQueryParams) => {
    return apiClient.get<IPaginationResponse<IEquipment>>('/equipment', params);
  },

  /**
   * 获取设备详情
   */
  getById: (id: string) => {
    return apiClient.get<IEquipment>(`/equipment/${id}`);
  },

  /**
   * 创建设备
   */
  create: (data: Partial<IEquipment>) => {
    return apiClient.post<IEquipment>('/equipment', data);
  },

  /**
   * 更新设备信息
   */
  update: (id: string, data: Partial<IEquipment>) => {
    return apiClient.put<IEquipment>(`/equipment/${id}`, data);
  },

  /**
   * 删除设备
   */
  delete: (id: string) => {
    return apiClient.delete<void>(`/equipment/${id}`);
  },

  // 设备检校相关
  calibration: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentCalibration>>('/equipment/calibration', params);
    },
    
    create: (data: Partial<IEquipmentCalibration>) => {
      return apiClient.post<IEquipmentCalibration>('/equipment/calibration', data);
    },
    
    update: (id: string, data: Partial<IEquipmentCalibration>) => {
      return apiClient.put<IEquipmentCalibration>(`/equipment/calibration/${id}`, data);
    },
    
    // 获取需要检校的设备
    getDueList: () => {
      return apiClient.get<IEquipment[]>('/equipment/calibration/due');
    },
  },

  // 设备使用记录
  useRecord: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentUseRecord>>('/equipment/use-record', params);
    },
    
    create: (data: Partial<IEquipmentUseRecord>) => {
      return apiClient.post<IEquipmentUseRecord>('/equipment/use-record', data);
    },
    
    complete: (id: string) => {
      return apiClient.post<IEquipmentUseRecord>(`/equipment/use-record/${id}/complete`);
    },
  },

  // 设备维护记录
  maintenance: {
    getRecords: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentMaintenanceRecord>>('/equipment/maintenance/record', params);
    },
    
    createRecord: (data: Partial<IEquipmentMaintenanceRecord>) => {
      return apiClient.post<IEquipmentMaintenanceRecord>('/equipment/maintenance/record', data);
    },
    
    getPlans: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentMaintenancePlan>>('/equipment/maintenance/plan', params);
    },
    
    createPlan: (data: Partial<IEquipmentMaintenancePlan>) => {
      return apiClient.post<IEquipmentMaintenancePlan>('/equipment/maintenance/plan', data);
    },
    
    executePlan: (id: string) => {
      return apiClient.post<IEquipmentMaintenancePlan>(`/equipment/maintenance/plan/${id}/execute`);
    },
  },

  // 设备借用
  borrow: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentBorrowApply>>('/equipment/borrow', params);
    },
    
    apply: (data: Partial<IEquipmentBorrowApply>) => {
      return apiClient.post<IEquipmentBorrowApply>('/equipment/borrow', data);
    },
    
    approve: (id: string, approved: boolean, comment?: string) => {
      return apiClient.post<IEquipmentBorrowApply>(`/equipment/borrow/${id}/approve`, { approved, comment });
    },
    
    return: (id: string) => {
      return apiClient.post<IEquipmentBorrowApply>(`/equipment/borrow/${id}/return`);
    },
  },

  // 设备报废
  scrap: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentScrapApply>>('/equipment/scrap', params);
    },
    
    apply: (data: Partial<IEquipmentScrapApply>) => {
      return apiClient.post<IEquipmentScrapApply>('/equipment/scrap', data);
    },
    
    approve: (id: string, approved: boolean, comment?: string) => {
      return apiClient.post<IEquipmentScrapApply>(`/equipment/scrap/${id}/approve`, { approved, comment });
    },
  },

  // 设备验收
  acceptance: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEquipmentAcceptance>>('/equipment/acceptance', params);
    },
    
    create: (data: Partial<IEquipmentAcceptance>) => {
      return apiClient.post<IEquipmentAcceptance>('/equipment/acceptance', data);
    },
  },
};

