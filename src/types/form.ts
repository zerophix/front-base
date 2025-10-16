/**
 * 表单相关类型定义
 */

import { ReactNode } from 'react';
import type { Rule } from 'antd/es/form';

/**
 * 表单模式
 */
export enum FormMode {
  Create = 'create',
  Edit = 'edit',
  View = 'view',
}

/**
 * 表单状态
 */
export enum FormStatus {
  Idle = 'idle',
  Validating = 'validating',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error',
}

/**
 * 字段配置基础接口
 */
export interface IFieldConfig<T = any> {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: T;
  rules?: Rule[];
  disabled?: boolean;
  hidden?: boolean;
  tooltip?: string;
  extra?: ReactNode;
  // 字段特定配置
  fieldProps?: Record<string, any>;
}

/**
 * 字段类型
 */
export enum FieldType {
  Text = 'text',
  TextArea = 'textarea',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiSelect',
  Date = 'date',
  DateRange = 'dateRange',
  Time = 'time',
  DateTime = 'datetime',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Switch = 'switch',
  Upload = 'upload',
  Custom = 'custom',
}

/**
 * 表单配置
 */
export interface IFormConfig {
  formId: string;
  title?: string;
  mode?: FormMode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  fields: IFieldConfig[];
  submitText?: string;
  cancelText?: string;
  showReset?: boolean;
  showSave?: boolean; // 是否显示暂存按钮
}

/**
 * 表单提交参数
 */
export interface IFormSubmitParams<T = any> {
  values: T;
  mode: FormMode;
  formId: string;
}

/**
 * 表单操作回调
 */
export interface IFormCallbacks<T = any> {
  onSubmit?: (params: IFormSubmitParams<T>) => Promise<boolean>;
  onSave?: (values: T) => Promise<boolean>; // 暂存
  onCancel?: () => void;
  onReset?: () => void;
  onValuesChange?: (changedValues: Partial<T>, allValues: T) => void;
}

/**
 * 表单错误
 */
export interface IFormError {
  field: string;
  message: string;
}

/**
 * 可编辑表格行基础接口
 */
export interface IEditableRow {
  key: string;
  [key: string]: any;
}

/**
 * 可编辑表格列配置
 */
export interface IEditableColumnConfig<T = any> {
  title: string;
  dataIndex: keyof T;
  key: string;
  width?: number | string;
  editable?: boolean;
  inputType?: FieldType;
  rules?: Rule[];
  options?: { label: string; value: any }[]; // 用于 select 类型
  render?: (value: any, record: T, index: number) => ReactNode;
}

/**
 * 可编辑表格配置
 */
export interface IEditableTableConfig<T = IEditableRow> {
  columns: IEditableColumnConfig<T>[];
  showDragHandle?: boolean; // 是否显示拖拽手柄
  showActions?: boolean; // 是否显示操作列
  enableAdd?: boolean; // 是否允许添加
  enableDelete?: boolean; // 是否允许删除
  enableBatchImport?: boolean; // 是否允许批量导入
  maxRows?: number; // 最大行数
  minRows?: number; // 最小行数
}

/**
 * 表单页面容器配置
 */
export interface IFormPageConfig {
  breadcrumbItems: Array<{ label: string; href?: string }>;
  title: string;
  recordNumber?: string; // 记录编号
  description?: string;
  extra?: ReactNode; // 额外操作按钮
}

