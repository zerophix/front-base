/**
 * 表单核心类型定义
 * 提供严格的表单类型约束和验证
 */

import type { ReactNode } from 'react';
import type { Rule } from 'antd/es/form';
import type { ID, Option, AsyncState, AppError } from './base';

/**
 * 表单模式枚举
 */
export const FormMode = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
  COPY: 'copy',
} as const;

export type FormModeType = typeof FormMode[keyof typeof FormMode];

/**
 * 字段类型枚举
 */
export const FieldType = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  EMAIL: 'email',
  PASSWORD: 'password',
  SELECT: 'select',
  MULTI_SELECT: 'multiSelect',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
  TIME: 'time',
  DATETIME: 'datetime',
  UPLOAD: 'upload',
  RICH_TEXT: 'richText',
  CUSTOM: 'custom',
} as const;

export type FieldTypeType = typeof FieldType[keyof typeof FieldType];

/**
 * 字段验证规则
 */
export interface FieldValidationRule {
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: RegExp;
  readonly validator?: (value: unknown) => string | null;
  readonly message?: string;
}

/**
 * 字段配置基础接口
 */
export interface BaseFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly type: FieldTypeType;
  readonly placeholder?: string;
  readonly tooltip?: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly required?: boolean;
  readonly rules?: readonly Rule[];
  readonly validation?: FieldValidationRule;
  readonly defaultValue?: unknown;
  readonly dependencies?: readonly string[]; // 依赖的其他字段
}

/**
 * 文本字段配置
 */
export interface TextFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.TEXT | typeof FieldType.TEXTAREA | typeof FieldType.EMAIL | typeof FieldType.PASSWORD;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly rows?: number; // 仅用于 textarea
  readonly autoSize?: boolean; // 仅用于 textarea
}

/**
 * 数字字段配置
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.NUMBER;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly precision?: number;
  readonly formatter?: (value: number) => string;
  readonly parser?: (value: string) => number;
}

/**
 * 选择字段配置
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.SELECT | typeof FieldType.MULTI_SELECT | typeof FieldType.RADIO;
  readonly options: readonly Option[];
  readonly allowClear?: boolean;
  readonly showSearch?: boolean;
  readonly multiple?: boolean;
  readonly loadOptions?: () => Promise<readonly Option[]>;
}

/**
 * 日期字段配置
 */
export interface DateFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.DATE | typeof FieldType.DATE_RANGE | typeof FieldType.TIME | typeof FieldType.DATETIME;
  readonly format?: string;
  readonly showTime?: boolean;
  readonly disabledDate?: (date: Date) => boolean;
  readonly range?: boolean;
}

/**
 * 上传字段配置
 */
export interface UploadFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.UPLOAD;
  readonly accept?: string;
  readonly maxSize?: number; // 字节
  readonly maxCount?: number;
  readonly multiple?: boolean;
  readonly listType?: 'text' | 'picture' | 'picture-card';
}

/**
 * 自定义字段配置
 */
export interface CustomFieldConfig extends BaseFieldConfig {
  readonly type: typeof FieldType.CUSTOM;
  readonly component: React.ComponentType<CustomFieldProps>;
  readonly props?: Record<string, unknown>;
}

/**
 * 联合字段配置类型
 */
export type FieldConfig = 
  | TextFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | DateFieldConfig
  | UploadFieldConfig
  | CustomFieldConfig;

/**
 * 自定义字段组件属性
 */
export interface CustomFieldProps {
  readonly value?: unknown;
  readonly onChange?: (value: unknown) => void;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly [key: string]: unknown;
}

/**
 * 表单布局配置
 */
export interface FormLayout {
  readonly type: 'horizontal' | 'vertical' | 'inline';
  readonly labelCol?: { span: number; offset?: number };
  readonly wrapperCol?: { span: number; offset?: number };
  readonly gutter?: number;
  readonly responsive?: boolean;
}

/**
 * 表单分组配置
 */
export interface FormGroup {
  readonly title: string;
  readonly description?: string;
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly fields: readonly string[]; // 字段名数组
}

/**
 * 表单配置
 */
export interface FormConfig<T = Record<string, unknown>> {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly mode: FormModeType;
  readonly layout: FormLayout;
  readonly fields: readonly FieldConfig[];
  readonly groups?: readonly FormGroup[];
  readonly initialValues?: Partial<T>;
  readonly validation?: {
    readonly validateOnChange?: boolean;
    readonly validateOnBlur?: boolean;
    readonly stopOnFirstError?: boolean;
  };
  readonly submission?: {
    readonly showSubmitButton?: boolean;
    readonly submitText?: string;
    readonly showCancelButton?: boolean;
    readonly cancelText?: string;
    readonly showResetButton?: boolean;
    readonly resetText?: string;
    readonly showSaveButton?: boolean;
    readonly saveText?: string;
  };
}

/**
 * 表单值类型
 */
export type FormValues<T = Record<string, unknown>> = T;

/**
 * 表单错误类型
 */
export type FormErrors<T = Record<string, unknown>> = {
  readonly [K in keyof T]?: string;
};

/**
 * 表单触摸状态
 */
export type FormTouched<T = Record<string, unknown>> = {
  readonly [K in keyof T]?: boolean;
};

/**
 * 表单状态
 */
export interface FormState<T = Record<string, unknown>> {
  readonly values: FormValues<T>;
  readonly errors: FormErrors<T>;
  readonly touched: FormTouched<T>;
  readonly dirty: boolean;
  readonly valid: boolean;
  readonly submitting: boolean;
  readonly submitCount: number;
  readonly lastSubmittedAt?: string;
}

/**
 * 表单提交结果
 */
export type FormSubmitResult<T = unknown> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly errors: FormErrors;
  readonly message?: string;
};

/**
 * 表单回调函数
 */
export interface FormCallbacks<T = Record<string, unknown>, R = unknown> {
  readonly onSubmit?: (values: FormValues<T>) => Promise<FormSubmitResult<R>>;
  readonly onSave?: (values: FormValues<T>) => Promise<FormSubmitResult<R>>;
  readonly onCancel?: () => void;
  readonly onReset?: () => void;
  readonly onValuesChange?: (changedValues: Partial<T>, allValues: FormValues<T>) => void;
  readonly onFieldChange?: (field: keyof T, value: T[keyof T], allValues: FormValues<T>) => void;
  readonly onValidationChange?: (errors: FormErrors<T>, valid: boolean) => void;
}

/**
 * 表单操作接口
 */
export interface FormActions<T = Record<string, unknown>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  clearError: <K extends keyof T>(field: K) => void;
  clearErrors: () => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  setTouchedAll: (touched: boolean) => void;
  validateField: <K extends keyof T>(field: K) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  reset: (values?: Partial<T>) => void;
  submit: () => Promise<void>;
  save: () => Promise<void>;
}

/**
 * 表单 Hook 返回类型
 */
export interface FormHookResult<T = Record<string, unknown>, R = unknown> {
  readonly state: FormState<T>;
  readonly actions: FormActions<T>;
  readonly config: FormConfig<T>;
  readonly callbacks: FormCallbacks<T, R>;
}

/**
 * 可编辑表格行接口
 */
export interface EditableRow {
  readonly key: string;
  readonly [field: string]: unknown;
}

/**
 * 可编辑表格列配置
 */
export interface EditableColumnConfig<T extends EditableRow = EditableRow> {
  readonly title: string;
  readonly dataIndex: keyof T;
  readonly key: string;
  readonly width?: number | string;
  readonly editable?: boolean;
  readonly required?: boolean;
  readonly fieldType?: FieldTypeType;
  readonly fieldConfig?: Partial<FieldConfig>;
  readonly render?: (value: unknown, record: T, index: number) => ReactNode;
  readonly validator?: (value: unknown, record: T) => string | null;
}

/**
 * 可编辑表格配置
 */
export interface EditableTableConfig<T extends EditableRow = EditableRow> {
  readonly columns: readonly EditableColumnConfig<T>[];
  readonly rowKey?: keyof T;
  readonly showActions?: boolean;
  readonly showAddButton?: boolean;
  readonly showDeleteButton?: boolean;
  readonly showMoveButtons?: boolean;
  readonly maxRows?: number;
  readonly minRows?: number;
  readonly validation?: {
    readonly validateOnChange?: boolean;
    readonly showErrorsInline?: boolean;
  };
}

/**
 * 可编辑表格状态
 */
export interface EditableTableState<T extends EditableRow = EditableRow> {
  readonly data: readonly T[];
  readonly errors: Record<string, FormErrors<T>>;
  readonly editingKeys: readonly string[];
  readonly loading: boolean;
}

/**
 * 可编辑表格操作
 */
export interface EditableTableActions<T extends EditableRow = EditableRow> {
  addRow: (row?: Partial<T>) => void;
  removeRow: (key: string) => void;
  updateRow: (key: string, updates: Partial<T>) => void;
  moveRow: (fromIndex: number, toIndex: number) => void;
  startEdit: (key: string) => void;
  cancelEdit: (key: string) => void;
  saveEdit: (key: string) => Promise<boolean>;
  validateRow: (key: string) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  reset: (data?: readonly T[]) => void;
}

/**
 * 表单字段依赖关系
 */
export interface FieldDependency {
  readonly field: string;
  readonly dependsOn: readonly string[];
  readonly condition: (values: Record<string, unknown>) => boolean;
  readonly effect: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

/**
 * 表单验证上下文
 */
export interface ValidationContext<T = Record<string, unknown>> {
  readonly values: FormValues<T>;
  readonly field: keyof T;
  readonly allFields: readonly FieldConfig[];
  readonly mode: FormModeType;
}

/**
 * 异步验证器
 */
export type AsyncValidator<T = Record<string, unknown>> = (
  value: unknown,
  context: ValidationContext<T>
) => Promise<string | null>;

/**
 * 表单字段状态
 */
export interface FieldState {
  readonly value: unknown;
  readonly error?: string;
  readonly touched: boolean;
  readonly dirty: boolean;
  readonly valid: boolean;
  readonly validating: boolean;
}

/**
 * 表单上下文
 */
export interface FormContext<T = Record<string, unknown>> {
  readonly config: FormConfig<T>;
  readonly state: FormState<T>;
  readonly actions: FormActions<T>;
  readonly getFieldState: (field: keyof T) => FieldState;
  readonly isFieldVisible: (field: keyof T) => boolean;
  readonly isFieldDisabled: (field: keyof T) => boolean;
  readonly isFieldRequired: (field: keyof T) => boolean;
}