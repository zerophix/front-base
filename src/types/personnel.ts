/**
 * 人员管理模块类型定义
 */

import { IBaseRecord } from './common';

/**
 * 人员基本信息
 */
export interface IPersonnel extends IBaseRecord {
  certNo: string; // 上岗证编号
  name: string; // 姓名
  department: string; // 部门
  mainProject: string; // 主要从事项目
  testingProject: string; // 检测项目
  photo?: string; // 照片URL
  remark?: string; // 备注
}

/**
 * 人员注册信息
 */
export interface IPersonnelRegistration extends IBaseRecord {
  name: string; // 姓名
  gender: 'male' | 'female'; // 性别
  birthDate: string; // 出生年月
  hometown: string; // 籍贯
  ethnicity: string; // 民族
  education: string; // 受教育程度
  idNumber: string; // 身份证号
  workStartDate: string; // 参加工作时间
  politicalStatus: string; // 政治面貌
  email: string; // 电子邮箱
  workHistory?: string; // 工作经历
  trainingRecord?: string; // 培训记录
  remark?: string; // 备注
  
  // 关联数据
  educationHistory: IEducationHistory[]; // 教育经历
  titleHistory: ITitleHistory[]; // 职称经历
  skillCertificates: ISkillCertificate[]; // 技能证书
}

/**
 * 教育经历
 */
export interface IEducationHistory {
  key: string;
  date: string;
  school: string;
  major: string;
}

/**
 * 职称经历
 */
export interface ITitleHistory {
  key: string;
  date: string;
  title: string;
}

/**
 * 技能证书
 */
export interface ISkillCertificate {
  key: string;
  date: string;
  certificate: string;
}

/**
 * 人员变动记录
 */
export interface IPersonnelChange extends IBaseRecord {
  personnelId: string;
  changeType: PersonnelChangeType;
  changeDate: string;
  fromDepartment?: string;
  toDepartment?: string;
  fromPosition?: string;
  toPosition?: string;
  reason: string;
  approver?: string;
  remark?: string;
}

/**
 * 人员变动类型
 */
export enum PersonnelChangeType {
  Transfer = 'transfer', // 调动
  Promotion = 'promotion', // 晋升
  Demotion = 'demotion', // 降职
  Resignation = 'resignation', // 离职
  Entry = 'entry', // 入职
}

/**
 * 人员资质
 */
export interface IPersonnelQualification extends IBaseRecord {
  personnelId: string;
  qualificationType: string; // 资质类型
  qualificationName: string; // 资质名称
  certificateNo: string; // 证书编号
  issueDate: string; // 发证日期
  expiryDate?: string; // 有效期至
  issuingAuthority: string; // 发证机关
  attachments?: string[]; // 附件
  status: 'valid' | 'expiring' | 'expired'; // 状态
}

/**
 * 培训记录
 */
export interface ITrainingRecord extends IBaseRecord {
  personnelId: string;
  trainingName: string; // 培训名称
  trainingType: string; // 培训类型
  trainingDate: string; // 培训日期
  duration: number; // 学时
  instructor: string; // 讲师
  score?: number; // 考核成绩
  passed: boolean; // 是否通过
  certificateNo?: string; // 证书编号
  remark?: string;
}

/**
 * 培训计划
 */
export interface ITrainingPlan extends IBaseRecord {
  planName: string; // 计划名称
  planYear: number; // 计划年度
  targetPersonnel: string[]; // 目标人员
  trainingContent: string; // 培训内容
  plannedDate: string; // 计划日期
  estimatedDuration: number; // 预计学时
  instructor?: string; // 讲师
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  actualDate?: string; // 实际培训日期
  completionRate?: number; // 完成率
}

