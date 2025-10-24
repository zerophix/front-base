/**
 * 通用类型定义
 * 所有业务模块共享的基础类型
 */

/**
 * 通用分页参数
 */
export interface IPaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 通用分页响应
 */
export interface IPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 通用API响应
 */
export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

/**
 * 通用ID类型
 */
export type ID = string;

/**
 * 通用记录基础接口
 */
export interface IBaseRecord {
  id?: ID;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 表格行操作类型
 */
export type TableRowAction = 'edit' | 'delete' | 'view' | 'copy';

/**
 * 通用状态枚举
 */
export enum CommonStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Deleted = 'deleted',
}

/**
 * 通用排序参数
 */
export interface ISortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 通用筛选参数
 */
export interface IFilterParams {
  [key: string]: any;
}

/**
 * 通用查询参数
 */
export interface IQueryParams extends Partial<IPaginationParams> {
  sort?: ISortParams;
  filter?: IFilterParams;
  search?: string;
}

/**
 * 文件上传响应
 */
export interface IFileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * 选项类型（用于下拉框等）
 */
export interface IOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  extra?: any;
}

/**
 * 键值对类型
 */
export type KeyValue<T = any> = Record<string, T>;

