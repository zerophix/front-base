/**
 * 质量管理模块类型定义
 */

import { IBaseRecord } from '@/types/common';

/**
 * 标准物质信息
 */
export interface IStandardSubstance extends IBaseRecord {
  substanceCode: string; // 标准物质编号
  substanceName: string; // 标准物质名称
  specification: string; // 规格
  manufacturer: string; // 生产厂家
  batchNo: string; // 批号
  certificateNo: string; // 证书编号
  purchaseDate: string; // 购买日期
  expiryDate: string; // 有效期至
  quantity: number; // 数量
  unit: string; // 单位
  storageCondition: string; // 储存条件
  storageLocation: string; // 储存位置
  status: 'normal' | 'expiring' | 'expired' | 'exhausted';
  responsiblePerson: string;
  remark?: string;
}

/**
 * 标准物质使用记录
 */
export interface IStdUsageRecord extends IBaseRecord {
  substanceId: string;
  substanceName: string;
  usageDate: string;
  operator: string;
  project: string; // 使用项目
  usageAmount: number; // 使用量
  unit: string;
  remainingAmount: number; // 剩余量
  purpose: string; // 使用目的
  remark?: string;
}

/**
 * 标准物质稀释记录
 */
export interface IStdDilutionRecord extends IBaseRecord {
  substanceId: string;
  substanceName: string;
  originalConcentration: string; // 原始浓度
  targetConcentration: string; // 目标浓度
  dilutionRatio: string; // 稀释比例
  dilutionDate: string;
  operator: string;
  solvent: string; // 溶剂
  preparedVolume: number; // 配制体积
  storageCondition: string;
  expiryDate: string;
  remark?: string;
}

/**
 * 环境条件记录
 */
export interface IEnvironmentRecord extends IBaseRecord {
  recordDate: string;
  recordTime: string;
  location: string; // 监测位置
  temperature: number; // 温度
  humidity: number; // 湿度
  pressure?: number; // 气压
  otherConditions?: string; // 其他环境条件
  recorder: string;
  meetRequirement: boolean; // 是否符合要求
  remark?: string;
}

/**
 * 不符合项
 */
export interface INonconformity extends IBaseRecord {
  nonconformityNo: string; // 不符合项编号
  foundDate: string; // 发现日期
  foundBy: string; // 发现人
  department: string;
  category: NonconformityCategory;
  description: string; // 描述
  severity: 'critical' | 'major' | 'minor'; // 严重程度
  status: 'open' | 'investigating' | 'correcting' | 'closed';
  
  // 原因分析
  rootCause?: string;
  analysisBy?: string;
  analysisDate?: string;
  
  // 纠正措施
  correctiveAction?: string;
  responsiblePerson?: string;
  targetDate?: string;
  completionDate?: string;
  
  // 验证
  verificationResult?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

/**
 * 不符合项类别
 */
export enum NonconformityCategory {
  Equipment = 'equipment', // 设备
  Personnel = 'personnel', // 人员
  Method = 'method', // 方法
  Material = 'material', // 物料
  Environment = 'environment', // 环境
  Documentation = 'documentation', // 文件
  Other = 'other', // 其他
}

/**
 * 文件控制清单
 */
export interface IDocControlledList extends IBaseRecord {
  docCode: string; // 文件编号
  docName: string; // 文件名称
  docType: DocumentType;
  version: string; // 版本号
  issueDate: string; // 发布日期
  effectiveDate: string; // 生效日期
  department: string; // 归口部门
  status: 'draft' | 'reviewing' | 'effective' | 'obsolete';
  replacedDoc?: string; // 替代文件
  distributionList: string[]; // 分发清单
  remark?: string;
}

/**
 * 文件类型
 */
export enum DocumentType {
  Manual = 'manual', // 手册
  Procedure = 'procedure', // 程序文件
  Instruction = 'instruction', // 作业指导书
  Record = 'record', // 记录表格
  External = 'external', // 外来文件
}

/**
 * 文件编制申请
 */
export interface IDocComposeApply extends IBaseRecord {
  docName: string;
  docType: DocumentType;
  applicant: string;
  applyDate: string;
  applyDepartment: string;
  reason: string; // 申请原因
  content: string; // 主要内容
  relatedDocs?: string[]; // 相关文件
  status: 'pending' | 'approved' | 'rejected' | 'composing';
  approver?: string;
  approveDate?: string;
  approveComment?: string;
}

/**
 * 文件发布审批
 */
export interface IDocIssueApprove extends IBaseRecord {
  docCode: string;
  docName: string;
  version: string;
  composer: string; // 编制人
  composeDate: string;
  reviewer: string; // 审核人
  reviewDate?: string;
  reviewResult?: 'pass' | 'fail' | 'revise';
  reviewComment?: string;
  approver: string; // 批准人
  approveDate?: string;
  approveResult?: 'approved' | 'rejected';
  approveComment?: string;
  status: 'pending' | 'reviewing' | 'approving' | 'approved' | 'rejected';
}

/**
 * 废弃物处理记录
 */
export interface IWasteRecord extends IBaseRecord {
  wasteType: string; // 废弃物类型
  wasteSource: string; // 来源
  quantity: number;
  unit: string;
  generateDate: string; // 产生日期
  disposalDate?: string; // 处理日期
  disposalMethod: string; // 处理方式
  operator: string;
  supervisor?: string; // 监督人
  status: 'pending' | 'processing' | 'completed';
  hazardLevel?: 'low' | 'medium' | 'high'; // 危险等级
  remark?: string;
}

/**
 * 访客登记
 */
export interface IVisitorRegister extends IBaseRecord {
  visitorName: string; // 访客姓名
  visitorCompany: string; // 访客单位
  visitorIdNo: string; // 证件号码
  contactPhone: string; // 联系电话
  visitDate: string;
  visitTime: string;
  visitPurpose: string; // 来访目的
  visitDepartment: string; // 被访部门
  visitPerson: string; // 被访人
  escort: string; // 陪同人
  entryTime: string; // 进入时间
  exitTime?: string; // 离开时间
  status: 'entered' | 'exited';
  remark?: string;
}

