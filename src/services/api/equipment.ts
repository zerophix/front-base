/**
 * 设备管理 API 服务
 * 使用统一的API基础架构
 */

import { BaseApiService, createApiService } from './base';
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
import type { 
  PaginationResponse, 
  BaseQueryParams, 
  ID, 
  Result,
  ApiErrorResponse 
} from '@/types/core';
import { apiClient } from './instance';

/**
 * 设备查询参数
 */
export interface EquipmentQueryParams extends BaseQueryParams {
  keyword?: string;
  status?: string;
  category?: string;
  department?: string;
}

/**
 * 设备API服务类
 */
class EquipmentApiService extends BaseApiService<IEquipment, Partial<IEquipment>, Partial<IEquipment> & { id: ID }, EquipmentQueryParams> {
  constructor() {
    super('/equipment');
  }

  /**
   * 获取需要检校的设备
   */
  async getDueCalibrationList(): Promise<Result<IEquipment[], ApiErrorResponse>> {
    return apiClient.get<IEquipment[]>(`${this.baseUrl}/calibration/due`);
  }
}

/**
 * 设备检校API服务
 */
class EquipmentCalibrationApiService extends BaseApiService<IEquipmentCalibration, Partial<IEquipmentCalibration>, Partial<IEquipmentCalibration> & { id: ID }, BaseQueryParams> {
  constructor() {
    super('/equipment/calibration');
  }
}

/**
 * 设备使用记录API服务
 */
class EquipmentUseRecordApiService extends BaseApiService<IEquipmentUseRecord, Partial<IEquipmentUseRecord>, Partial<IEquipmentUseRecord> & { id: ID }, BaseQueryParams> {
  constructor() {
    super('/equipment/use-record');
  }

  /**
   * 完成使用记录
   */
  async complete(id: ID): Promise<Result<IEquipmentUseRecord, ApiErrorResponse>> {
    return apiClient.post<IEquipmentUseRecord>(`${this.baseUrl}/${id}/complete`);
  }
}

/**
 * 设备维护API服务
 */
class EquipmentMaintenanceApiService {
  private readonly baseUrl = '/equipment/maintenance';

  /**
   * 获取维护记录
   */
  async getRecords(params?: BaseQueryParams): Promise<Result<PaginationResponse<IEquipmentMaintenanceRecord>, ApiErrorResponse>> {
    return apiClient.get<PaginationResponse<IEquipmentMaintenanceRecord>>(`${this.baseUrl}/records`, { params: params as Record<string, unknown> });
  }

  /**
   * 创建维护记录
   */
  async createRecord(data: Partial<IEquipmentMaintenanceRecord>): Promise<Result<IEquipmentMaintenanceRecord, ApiErrorResponse>> {
    return apiClient.post<IEquipmentMaintenanceRecord>(`${this.baseUrl}/records`, data);
  }

  /**
   * 获取维护计划
   */
  async getPlans(params?: BaseQueryParams): Promise<Result<PaginationResponse<IEquipmentMaintenancePlan>, ApiErrorResponse>> {
    return apiClient.get<PaginationResponse<IEquipmentMaintenancePlan>>(`${this.baseUrl}/plans`, { params: params as Record<string, unknown> });
  }

  /**
   * 创建维护计划
   */
  async createPlan(data: Partial<IEquipmentMaintenancePlan>): Promise<Result<IEquipmentMaintenancePlan, ApiErrorResponse>> {
    return apiClient.post<IEquipmentMaintenancePlan>(`${this.baseUrl}/plans`, data);
  }

  /**
   * 执行维护计划
   */
  async executePlan(id: ID): Promise<Result<IEquipmentMaintenanceRecord, ApiErrorResponse>> {
    return apiClient.post<IEquipmentMaintenanceRecord>(`${this.baseUrl}/plans/${id}/execute`);
  }
}

/**
 * 设备借用API服务
 */
class EquipmentBorrowApiService extends BaseApiService<IEquipmentBorrowApply, Partial<IEquipmentBorrowApply>, Partial<IEquipmentBorrowApply> & { id: ID }, BaseQueryParams> {
  constructor() {
    super('/equipment/borrow');
  }

  /**
   * 审批借用申请
   */
  async approve(id: ID, approved: boolean, comment?: string): Promise<Result<IEquipmentBorrowApply, ApiErrorResponse>> {
    return apiClient.post<IEquipmentBorrowApply>(`${this.baseUrl}/${id}/approve`, { approved, comment });
  }

  /**
   * 归还设备
   */
  async return(id: ID): Promise<Result<IEquipmentBorrowApply, ApiErrorResponse>> {
    return apiClient.post<IEquipmentBorrowApply>(`${this.baseUrl}/${id}/return`);
  }
}

/**
 * 设备报废API服务
 */
class EquipmentScrapApiService extends BaseApiService<IEquipmentScrapApply, Partial<IEquipmentScrapApply>, Partial<IEquipmentScrapApply> & { id: ID }, BaseQueryParams> {
  constructor() {
    super('/equipment/scrap');
  }

  /**
   * 审批报废申请
   */
  async approve(id: ID, approved: boolean, comment?: string): Promise<Result<IEquipmentScrapApply, ApiErrorResponse>> {
    return apiClient.post<IEquipmentScrapApply>(`${this.baseUrl}/${id}/approve`, { approved, comment });
  }
}

/**
 * 设备验收API服务
 */
class EquipmentAcceptanceApiService extends BaseApiService<IEquipmentAcceptance, Partial<IEquipmentAcceptance>, Partial<IEquipmentAcceptance> & { id: ID }, BaseQueryParams> {
  constructor() {
    super('/equipment/acceptance');
  }
}

/**
 * 导出统一的设备API服务
 */
export const equipmentApi = {
  // 主要设备管理
  equipment: new EquipmentApiService(),
  
  // 设备检校
  calibration: new EquipmentCalibrationApiService(),
  
  // 使用记录
  useRecord: new EquipmentUseRecordApiService(),
  
  // 维护管理
  maintenance: new EquipmentMaintenanceApiService(),
  
  // 借用管理
  borrow: new EquipmentBorrowApiService(),
  
  // 报废管理
  scrap: new EquipmentScrapApiService(),
  
  // 验收管理
  acceptance: new EquipmentAcceptanceApiService(),
};

// 向后兼容的导出
export default equipmentApi;

