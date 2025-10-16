/**
 * 质量管理 API
 */

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
import type { IPaginationResponse, IPageQueryParams } from '@/types';

/**
 * 质量管理 API 服务
 */
export const qualityApi = {
  // 标准物质管理
  standardSubstance: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IStandardSubstance>>('/quality/standard-substance', params);
    },
    
    create: (data: Partial<IStandardSubstance>) => {
      return apiClient.post<IStandardSubstance>('/quality/standard-substance', data);
    },
    
    update: (id: string, data: Partial<IStandardSubstance>) => {
      return apiClient.put<IStandardSubstance>(`/quality/standard-substance/${id}`, data);
    },
    
    // 获取即将过期的标准物质
    getExpiring: (days: number = 30) => {
      return apiClient.get<IStandardSubstance[]>('/quality/standard-substance/expiring', { days });
    },
    
    // 标准物质使用记录
    usageRecord: {
      getList: (params: IPageQueryParams) => {
        return apiClient.get<IPaginationResponse<IStdUsageRecord>>('/quality/standard-substance/usage', params);
      },
      
      create: (data: Partial<IStdUsageRecord>) => {
        return apiClient.post<IStdUsageRecord>('/quality/standard-substance/usage', data);
      },
    },
    
    // 标准物质稀释记录
    dilutionRecord: {
      getList: (params: IPageQueryParams) => {
        return apiClient.get<IPaginationResponse<IStdDilutionRecord>>('/quality/standard-substance/dilution', params);
      },
      
      create: (data: Partial<IStdDilutionRecord>) => {
        return apiClient.post<IStdDilutionRecord>('/quality/standard-substance/dilution', data);
      },
    },
  },

  // 环境监测
  environment: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IEnvironmentRecord>>('/quality/environment', params);
    },
    
    create: (data: Partial<IEnvironmentRecord>) => {
      return apiClient.post<IEnvironmentRecord>('/quality/environment', data);
    },
    
    // 获取最新环境数据
    getLatest: (location: string) => {
      return apiClient.get<IEnvironmentRecord>('/quality/environment/latest', { location });
    },
  },

  // 不符合项管理
  nonconformity: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<INonconformity>>('/quality/nonconformity', params);
    },
    
    create: (data: Partial<INonconformity>) => {
      return apiClient.post<INonconformity>('/quality/nonconformity', data);
    },
    
    update: (id: string, data: Partial<INonconformity>) => {
      return apiClient.put<INonconformity>(`/quality/nonconformity/${id}`, data);
    },
    
    // 提交分析
    submitAnalysis: (id: string, data: { rootCause: string; analysisBy: string }) => {
      return apiClient.post<INonconformity>(`/quality/nonconformity/${id}/analysis`, data);
    },
    
    // 提交纠正措施
    submitCorrectiveAction: (id: string, data: { correctiveAction: string; responsiblePerson: string; targetDate: string }) => {
      return apiClient.post<INonconformity>(`/quality/nonconformity/${id}/corrective-action`, data);
    },
    
    // 验证
    verify: (id: string, data: { verificationResult: string; verifiedBy: string }) => {
      return apiClient.post<INonconformity>(`/quality/nonconformity/${id}/verify`, data);
    },
  },

  // 文件管理
  document: {
    // 受控文件清单
    controlledList: {
      getList: (params: IPageQueryParams) => {
        return apiClient.get<IPaginationResponse<IDocControlledList>>('/quality/document/controlled', params);
      },
      
      create: (data: Partial<IDocControlledList>) => {
        return apiClient.post<IDocControlledList>('/quality/document/controlled', data);
      },
      
      update: (id: string, data: Partial<IDocControlledList>) => {
        return apiClient.put<IDocControlledList>(`/quality/document/controlled/${id}`, data);
      },
    },
    
    // 文件编制申请
    composeApply: {
      getList: (params: IPageQueryParams) => {
        return apiClient.get<IPaginationResponse<IDocComposeApply>>('/quality/document/compose-apply', params);
      },
      
      create: (data: Partial<IDocComposeApply>) => {
        return apiClient.post<IDocComposeApply>('/quality/document/compose-apply', data);
      },
      
      approve: (id: string, approved: boolean, comment?: string) => {
        return apiClient.post<IDocComposeApply>(`/quality/document/compose-apply/${id}/approve`, { approved, comment });
      },
    },
    
    // 文件发布审批
    issueApprove: {
      getList: (params: IPageQueryParams) => {
        return apiClient.get<IPaginationResponse<IDocIssueApprove>>('/quality/document/issue-approve', params);
      },
      
      create: (data: Partial<IDocIssueApprove>) => {
        return apiClient.post<IDocIssueApprove>('/quality/document/issue-approve', data);
      },
      
      review: (id: string, result: 'pass' | 'fail' | 'revise', comment?: string) => {
        return apiClient.post<IDocIssueApprove>(`/quality/document/issue-approve/${id}/review`, { result, comment });
      },
      
      approve: (id: string, approved: boolean, comment?: string) => {
        return apiClient.post<IDocIssueApprove>(`/quality/document/issue-approve/${id}/approve`, { approved, comment });
      },
    },
  },

  // 废弃物管理
  waste: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IWasteRecord>>('/quality/waste', params);
    },
    
    create: (data: Partial<IWasteRecord>) => {
      return apiClient.post<IWasteRecord>('/quality/waste', data);
    },
    
    dispose: (id: string) => {
      return apiClient.post<IWasteRecord>(`/quality/waste/${id}/dispose`);
    },
  },

  // 访客登记
  visitor: {
    getList: (params: IPageQueryParams) => {
      return apiClient.get<IPaginationResponse<IVisitorRegister>>('/quality/visitor', params);
    },
    
    register: (data: Partial<IVisitorRegister>) => {
      return apiClient.post<IVisitorRegister>('/quality/visitor', data);
    },
    
    exit: (id: string) => {
      return apiClient.post<IVisitorRegister>(`/quality/visitor/${id}/exit`);
    },
  },
};

