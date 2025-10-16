/**
 * 设备管理模块类型定义
 */

import { IBaseRecord } from './common';

/**
 * 设备基本信息
 */
export interface IEquipment extends IBaseRecord {
  equipmentCode: string; // 设备编号
  equipmentName: string; // 设备名称
  model: string; // 型号规格
  manufacturer: string; // 生产厂家
  serialNo: string; // 出厂编号
  purchaseDate: string; // 购置日期
  purchasePrice: number; // 购置价格
  department: string; // 使用部门
  location: string; // 存放位置
  status: EquipmentStatus; // 设备状态
  category: string; // 设备类别
  responsiblePerson: string; // 责任人
  remark?: string;
}

/**
 * 设备状态
 */
export enum EquipmentStatus {
  Normal = 'normal', // 正常
  InUse = 'inUse', // 使用中
  Maintenance = 'maintenance', // 维护中
  Calibration = 'calibration', // 校准中
  Repair = 'repair', // 维修中
  Scrapped = 'scrapped', // 已报废
  Borrowed = 'borrowed', // 已借出
}

/**
 * 设备检校记录
 */
export interface IEquipmentCalibration extends IBaseRecord {
  equipmentName: string; // 设备名称
  department: string; // 使用部门
  serialNo: string; // 出厂编号
  date: string; // 检校日期
  beforeCalibrate?: string; // 校准前
  beforeVerify?: string; // 检定前
  temperature?: string; // 温度
  humidity?: string; // 湿度
  issuer?: string; // 签发人
  instModel?: string; // 检校仪器仪表名称规格型号
  instNo?: string; // 检校仪器仪表编号
  
  // 检校记录明细
  records: ICalibrationRecord[];
}

/**
 * 检校记录明细
 */
export interface ICalibrationRecord {
  key: string;
  itemName: string; // 名称
  unit: string; // 校准单位
  measured: string; // 实测值
  allowed: string; // 允许误差
  actual: string; // 实际误差
  verdict: string; // 判定
}

/**
 * 设备使用记录
 */
export interface IEquipmentUseRecord extends IBaseRecord {
  equipmentId: string;
  equipmentName: string;
  operator: string; // 使用人
  department: string;
  startTime: string;
  endTime?: string;
  purpose: string; // 使用目的
  project?: string; // 关联项目
  status: 'using' | 'completed';
  remark?: string;
}

/**
 * 设备维护记录
 */
export interface IEquipmentMaintenanceRecord extends IBaseRecord {
  equipmentId: string;
  equipmentName: string;
  maintenanceType: MaintenanceType;
  maintenanceDate: string;
  maintainer: string; // 维护人
  maintenanceContent: string; // 维护内容
  cost?: number; // 费用
  result: 'normal' | 'abnormal' | 'needRepair';
  nextMaintenanceDate?: string; // 下次维护日期
  remark?: string;
}

/**
 * 维护类型
 */
export enum MaintenanceType {
  Daily = 'daily', // 日常维护
  Periodic = 'periodic', // 定期维护
  Preventive = 'preventive', // 预防性维护
  Repair = 'repair', // 维修
}

/**
 * 设备维护计划
 */
export interface IEquipmentMaintenancePlan extends IBaseRecord {
  planName: string;
  equipmentIds: string[]; // 设备列表
  maintenanceType: MaintenanceType;
  plannedDate: string;
  cycle: string; // 维护周期
  responsiblePerson: string;
  maintenanceItems: string[]; // 维护项目
  status: 'pending' | 'ongoing' | 'completed' | 'overdue';
  actualDate?: string;
}

/**
 * 设备借用申请
 */
export interface IEquipmentBorrowApply extends IBaseRecord {
  equipmentId: string;
  equipmentName: string;
  borrower: string; // 借用人
  borrowDepartment: string; // 借用部门
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string; // 借用目的
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  approver?: string;
  approveDate?: string;
  remark?: string;
}

/**
 * 设备报废申请
 */
export interface IEquipmentScrapApply extends IBaseRecord {
  equipmentId: string;
  equipmentName: string;
  applicant: string; // 申请人
  applyDate: string;
  reason: string; // 报废原因
  purchaseDate: string;
  originalValue: number; // 原值
  currentValue: number; // 现值
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approver?: string;
  approveDate?: string;
  disposalMethod?: string; // 处置方式
  remark?: string;
}

/**
 * 设备验收记录
 */
export interface IEquipmentAcceptance extends IBaseRecord {
  equipmentName: string;
  model: string;
  manufacturer: string;
  serialNo: string;
  supplier: string; // 供应商
  purchaseDate: string;
  acceptanceDate: string;
  acceptancePersonnel: string[]; // 验收人员
  acceptanceResult: 'passed' | 'failed' | 'conditional';
  acceptanceItems: IAcceptanceItem[]; // 验收项目
  problem?: string; // 发现的问题
  solution?: string; // 解决方案
  remark?: string;
}

/**
 * 验收项目
 */
export interface IAcceptanceItem {
  key: string;
  item: string; // 验收项目
  requirement: string; // 要求
  actual: string; // 实际情况
  result: 'pass' | 'fail';
}

