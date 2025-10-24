/**
 * 质量管理 API
 */

import { BaseApiService, createApiService } from './base';
import { apiClient } from './instance';
import type {
  IStandardSubstance,
  IStdUsageRecord,
  IStdDilutionRecord,
  IEnvironmentRecord,
  INonconformity,
  IDocControlledList,
  IDocComposeApply,
  IDocIssueApprove,
  IWasteRecord,
  IVisitorRegister,
} from '@/types/quality';
import type { PaginationResponse, BaseQueryParams, ID, Result } from '@/types/core';
import type { ApiErrorResponse } from '@/types/core/api';

/**
 * 环境记录查询参数
 */
export interface EnvironmentQueryParams extends BaseQueryParams {
  readonly location?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

/**
 * 标准物质 API 服务
 */
class StandardSubstanceApiService extends BaseApiService<IStandardSubstance, Partial<IStandardSubstance>, Partial<IStandardSubstance> & { id: ID }> {
  /**
   * 获取即将过期的标准物质
   */
  async getExpiring(days: number = 30): Promise<Result<readonly IStandardSubstance[], ApiErrorResponse>> {
    return apiClient.get<readonly IStandardSubstance[]>(`${this.baseUrl}/expiring`, {
      params: { days },
    });
  }
}

/**
 * 环境记录 API 服务
 */
class EnvironmentRecordApiService extends BaseApiService<IEnvironmentRecord, Partial<IEnvironmentRecord>, Partial<IEnvironmentRecord> & { id: ID }, EnvironmentQueryParams> {
  /**
   * 获取最新环境记录
   */
  async getLatest(location: string): Promise<Result<IEnvironmentRecord, ApiErrorResponse>> {
    return apiClient.get<IEnvironmentRecord>(`${this.baseUrl}/latest`, {
      params: { location },
    });
  }
}

/**
 * 不符合项 API 服务
 */
class NonconformityApiService extends BaseApiService<INonconformity, Partial<INonconformity>, Partial<INonconformity> & { id: ID }> {
  /**
   * 提交分析
   */
  async submitAnalysis(id: ID, data: { rootCause: string; analysisBy: string }): Promise<Result<INonconformity, ApiErrorResponse>> {
    return apiClient.post<INonconformity>(`${this.baseUrl}/${id}/analysis`, data);
  }

  /**
   * 提交纠正措施
   */
  async submitCorrectiveAction(id: ID, data: { correctiveAction: string; responsiblePerson: string; targetDate: string }): Promise<Result<INonconformity, ApiErrorResponse>> {
    return apiClient.post<INonconformity>(`${this.baseUrl}/${id}/corrective-action`, data);
  }

  /**
   * 验证
   */
  async verify(id: ID, data: { verificationResult: string; verifiedBy: string }): Promise<Result<INonconformity, ApiErrorResponse>> {
    return apiClient.post<INonconformity>(`${this.baseUrl}/${id}/verify`, data);
  }
}

/**
 * 废弃物 API 服务
 */
class WasteRecordApiService extends BaseApiService<IWasteRecord, Partial<IWasteRecord>, Partial<IWasteRecord> & { id: ID }> {
  /**
   * 处置废弃物
   */
  async dispose(id: ID): Promise<Result<IWasteRecord, ApiErrorResponse>> {
    return apiClient.post<IWasteRecord>(`${this.baseUrl}/${id}/dispose`);
  }
}

/**
 * 访客登记 API 服务
 */
class VisitorRegisterApiService extends BaseApiService<IVisitorRegister, Partial<IVisitorRegister>, Partial<IVisitorRegister> & { id: ID }> {
  /**
   * 访客登记
   */
  async register(data: Partial<IVisitorRegister>): Promise<Result<IVisitorRegister, ApiErrorResponse>> {
    return apiClient.post<IVisitorRegister>(`${this.baseUrl}/register`, data);
  }

  /**
   * 访客离开
   */
  async exit(id: ID): Promise<Result<IVisitorRegister, ApiErrorResponse>> {
    return apiClient.post<IVisitorRegister>(`${this.baseUrl}/${id}/exit`);
  }
}

// 创建API服务实例
export const standardSubstanceApi = createApiService<IStandardSubstance>('/quality/standard-substance');
export const stdUsageRecordApi = createApiService<IStdUsageRecord>('/quality/standard-substance/usage');
export const stdDilutionRecordApi = createApiService<IStdDilutionRecord>('/quality/standard-substance/dilution');
export const environmentRecordApi = createApiService<IEnvironmentRecord, Partial<IEnvironmentRecord>, Partial<IEnvironmentRecord> & { id: ID }, EnvironmentQueryParams>('/quality/environment');
export const nonconformityApi = createApiService<INonconformity>('/quality/nonconformity');
export const docControlledListApi = createApiService<IDocControlledList>('/quality/document/controlled');
export const docComposeApplyApi = createApiService<IDocComposeApply>('/quality/document/compose-apply');
export const docIssueApproveApi = createApiService<IDocIssueApprove>('/quality/document/issue-approve');
export const wasteRecordApi = createApiService<IWasteRecord>('/quality/waste');
export const visitorRegisterApi = createApiService<IVisitorRegister>('/quality/visitor');

// 扩展API服务实例
const extendedStandardSubstanceApi = Object.assign(standardSubstanceApi, {
  getExpiring: async (days?: number) => {
    const service = new StandardSubstanceApiService('/quality/standard-substance');
    return service.getExpiring(days);
  },
});

const extendedEnvironmentRecordApi = Object.assign(environmentRecordApi, {
  getLatest: async (location: string) => {
    const service = new EnvironmentRecordApiService('/quality/environment');
    return service.getLatest(location);
  },
});

const extendedNonconformityApi = Object.assign(nonconformityApi, {
  submitAnalysis: async (id: string, data: { rootCause: string; analysisBy: string }) => {
    const service = new NonconformityApiService('/quality/nonconformity');
    return service.submitAnalysis(id as ID, data);
  },
  submitCorrectiveAction: async (id: string, data: { correctiveAction: string; responsiblePerson: string; targetDate: string }) => {
    const service = new NonconformityApiService('/quality/nonconformity');
    return service.submitCorrectiveAction(id as ID, data);
  },
  verify: async (id: string, data: { verificationResult: string; verifiedBy: string }) => {
    const service = new NonconformityApiService('/quality/nonconformity');
    return service.verify(id as ID, data);
  },
});

const extendedWasteRecordApi = Object.assign(wasteRecordApi, {
  dispose: async (id: string) => {
    const service = new WasteRecordApiService('/quality/waste');
    return service.dispose(id as ID);
  },
});

const extendedVisitorRegisterApi = Object.assign(visitorRegisterApi, {
  register: async (data: Partial<IVisitorRegister>) => {
    const service = new VisitorRegisterApiService('/quality/visitor');
    return service.register(data);
  },
  exit: async (id: string) => {
    const service = new VisitorRegisterApiService('/quality/visitor');
    return service.exit(id as ID);
  },
});

// 向后兼容的导出
export const qualityApi = {
  // 标准物质管理
  standardSubstance: {
    getList: (params: BaseQueryParams) => extendedStandardSubstanceApi.list(params),
    getById: (id: string) => extendedStandardSubstanceApi.getById(id),
    create: (data: Partial<IStandardSubstance>) => extendedStandardSubstanceApi.create(data),
    update: (id: string, data: Partial<IStandardSubstance>) => extendedStandardSubstanceApi.update({ id: id as ID, ...data }),
    delete: (id: string) => extendedStandardSubstanceApi.delete(id),
    getExpiring: (days?: number) => extendedStandardSubstanceApi.getExpiring(days),
    
    // 标准物质使用记录
    usageRecord: {
      getList: (params: BaseQueryParams) => stdUsageRecordApi.list(params),
      getById: (id: string) => stdUsageRecordApi.getById(id),
      create: (data: Partial<IStdUsageRecord>) => stdUsageRecordApi.create(data),
      update: (id: string, data: Partial<IStdUsageRecord>) => stdUsageRecordApi.update({ id: id as ID, ...data }),
      delete: (id: string) => stdUsageRecordApi.delete(id),
    },
    
    // 标准物质稀释记录
    dilutionRecord: {
      getList: (params: BaseQueryParams) => stdDilutionRecordApi.list(params),
      getById: (id: string) => stdDilutionRecordApi.getById(id),
      create: (data: Partial<IStdDilutionRecord>) => stdDilutionRecordApi.create(data),
      update: (id: string, data: Partial<IStdDilutionRecord>) => stdDilutionRecordApi.update({ id: id as ID, ...data }),
      delete: (id: string) => stdDilutionRecordApi.delete(id),
    },
  },

  // 环境记录
  environment: {
    getList: (params: EnvironmentQueryParams) => extendedEnvironmentRecordApi.list(params),
    getById: (id: string) => extendedEnvironmentRecordApi.getById(id),
    create: (data: Partial<IEnvironmentRecord>) => extendedEnvironmentRecordApi.create(data),
    update: (id: string, data: Partial<IEnvironmentRecord>) => extendedEnvironmentRecordApi.update({ id: id as ID, ...data }),
    delete: (id: string) => extendedEnvironmentRecordApi.delete(id),
    getLatest: (location: string) => extendedEnvironmentRecordApi.getLatest(location),
  },

  // 不符合项管理
  nonconformity: {
    getList: (params: BaseQueryParams) => extendedNonconformityApi.list(params),
    create: (data: Partial<INonconformity>) => extendedNonconformityApi.create(data),
    update: (id: string, data: Partial<INonconformity>) => extendedNonconformityApi.update({ id: id as ID, ...data }),
    submitAnalysis: (id: string, data: { rootCause: string; analysisBy: string }) => extendedNonconformityApi.submitAnalysis(id, data),
    submitCorrectiveAction: (id: string, data: { correctiveAction: string; responsiblePerson: string; targetDate: string }) => extendedNonconformityApi.submitCorrectiveAction(id, data),
    verify: (id: string, data: { verificationResult: string; verifiedBy: string }) => extendedNonconformityApi.verify(id, data),
  },

  // 文件管理
  document: {
    // 受控文件清单
    controlledList: {
      getList: (params: BaseQueryParams) => docControlledListApi.list(params),
      getById: (id: string) => docControlledListApi.getById(id),
      create: (data: Partial<IDocControlledList>) => docControlledListApi.create(data),
      update: (id: string, data: Partial<IDocControlledList>) => docControlledListApi.update({ id: id as ID, ...data }),
      delete: (id: string) => docControlledListApi.delete(id),
    },
    
    // 文件编制申请
    composeApply: {
      getList: (params: BaseQueryParams) => docComposeApplyApi.list(params),
      getById: (id: string) => docComposeApplyApi.getById(id),
      create: (data: Partial<IDocComposeApply>) => docComposeApplyApi.create(data),
      update: (id: string, data: Partial<IDocComposeApply>) => docComposeApplyApi.update({ id: id as ID, ...data }),
      delete: (id: string) => docComposeApplyApi.delete(id),
    },
    
    // 文件发布审批
    issueApprove: {
      getList: (params: BaseQueryParams) => docIssueApproveApi.list(params),
      getById: (id: string) => docIssueApproveApi.getById(id),
      create: (data: Partial<IDocIssueApprove>) => docIssueApproveApi.create(data),
      update: (id: string, data: Partial<IDocIssueApprove>) => docIssueApproveApi.update({ id: id as ID, ...data }),
      delete: (id: string) => docIssueApproveApi.delete(id),
    },
  },

  // 废弃物管理
  waste: {
    getList: (params: BaseQueryParams) => extendedWasteRecordApi.list(params),
    getById: (id: string) => extendedWasteRecordApi.getById(id),
    create: (data: Partial<IWasteRecord>) => extendedWasteRecordApi.create(data),
    update: (id: string, data: Partial<IWasteRecord>) => extendedWasteRecordApi.update({ id: id as ID, ...data }),
    delete: (id: string) => extendedWasteRecordApi.delete(id),
    dispose: (id: string) => extendedWasteRecordApi.dispose(id),
  },

  // 访客登记
  visitor: {
    getList: (params: BaseQueryParams) => extendedVisitorRegisterApi.list(params),
    getById: (id: string) => extendedVisitorRegisterApi.getById(id),
    create: (data: Partial<IVisitorRegister>) => extendedVisitorRegisterApi.create(data),
    update: (id: string, data: Partial<IVisitorRegister>) => extendedVisitorRegisterApi.update({ id: id as ID, ...data }),
    delete: (id: string) => extendedVisitorRegisterApi.delete(id),
    register: (data: Partial<IVisitorRegister>) => extendedVisitorRegisterApi.register(data),
    exit: (id: string) => extendedVisitorRegisterApi.exit(id),
  },
};

