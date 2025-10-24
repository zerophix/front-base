/**
 * 组件系统核心类型定义
 * 提供组件架构的类型约束和接口规范
 */

import type { ReactNode, ComponentType, CSSProperties } from 'react';
import type { ID, Option, AsyncState } from './base';
import type { FormConfig, FormState, FormActions } from './form';

/**
 * 组件大小枚举
 */
export const ComponentSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type ComponentSizeType = typeof ComponentSize[keyof typeof ComponentSize];

/**
 * 组件变体枚举
 */
export const ComponentVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
} as const;

export type ComponentVariantType = typeof ComponentVariant[keyof typeof ComponentVariant];

/**
 * 基础组件属性
 */
export interface BaseComponentProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly id?: string;
  readonly testId?: string;
  readonly children?: ReactNode;
}

/**
 * 可交互组件属性
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

/**
 * 表格列定义
 */
export interface TableColumn<T = Record<string, unknown>> {
  readonly key: string;
  readonly title: string;
  readonly dataIndex?: keyof T;
  readonly width?: number | string;
  readonly fixed?: 'left' | 'right';
  readonly align?: 'left' | 'center' | 'right';
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly resizable?: boolean;
  readonly ellipsis?: boolean;
  readonly render?: (value: unknown, record: T, index: number) => ReactNode;
  readonly sorter?: (a: T, b: T) => number;
  readonly filters?: readonly Option[];
  readonly onFilter?: (value: unknown, record: T) => boolean;
}

/**
 * 表格行操作
 */
export interface TableRowAction<T = Record<string, unknown>> {
  readonly key: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly type?: 'primary' | 'default' | 'danger';
  readonly disabled?: boolean | ((record: T) => boolean);
  readonly visible?: boolean | ((record: T) => boolean);
  readonly onClick: (record: T, index: number) => void;
}

/**
 * 表格配置
 */
export interface TableConfig<T = Record<string, unknown>> {
  readonly columns: readonly TableColumn<T>[];
  readonly rowKey?: keyof T | ((record: T) => string);
  readonly size?: ComponentSizeType;
  readonly bordered?: boolean;
  readonly showHeader?: boolean;
  readonly pagination?: PaginationConfig | false;
  readonly selection?: TableSelectionConfig<T>;
  readonly actions?: readonly TableRowAction<T>[];
  readonly expandable?: TableExpandableConfig<T>;
  readonly scroll?: { x?: number | string; y?: number | string };
  readonly sticky?: boolean;
  readonly virtual?: boolean;
}

/**
 * 表格选择配置
 */
export interface TableSelectionConfig<T = Record<string, unknown>> {
  readonly type: 'checkbox' | 'radio';
  readonly fixed?: boolean;
  readonly columnWidth?: number | string;
  readonly selectedRowKeys?: readonly string[];
  readonly onSelect?: (record: T, selected: boolean, selectedRows: readonly T[]) => void;
  readonly onSelectAll?: (selected: boolean, selectedRows: readonly T[], changeRows: readonly T[]) => void;
  readonly getCheckboxProps?: (record: T) => { disabled?: boolean };
}

/**
 * 表格展开配置
 */
export interface TableExpandableConfig<T = Record<string, unknown>> {
  readonly expandedRowKeys?: readonly string[];
  readonly defaultExpandedRowKeys?: readonly string[];
  readonly expandedRowRender?: (record: T, index: number) => ReactNode;
  readonly expandRowByClick?: boolean;
  readonly expandIcon?: (props: { expanded: boolean; onExpand: () => void; record: T }) => ReactNode;
  readonly onExpand?: (expanded: boolean, record: T) => void;
  readonly onExpandedRowsChange?: (expandedKeys: readonly string[]) => void;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  readonly current?: number;
  readonly pageSize?: number;
  readonly total?: number;
  readonly showSizeChanger?: boolean;
  readonly showQuickJumper?: boolean;
  readonly showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  readonly pageSizeOptions?: readonly string[];
  readonly size?: ComponentSizeType;
  readonly simple?: boolean;
  readonly onChange?: (page: number, pageSize: number) => void;
  readonly onShowSizeChange?: (current: number, size: number) => void;
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  readonly placeholder?: string;
  readonly allowClear?: boolean;
  readonly enterButton?: boolean | ReactNode;
  readonly size?: ComponentSizeType;
  readonly loading?: boolean;
  readonly onSearch?: (value: string) => void;
  readonly onChange?: (value: string) => void;
}

/**
 * 过滤器配置
 */
export interface FilterConfig {
  readonly fields: readonly FilterFieldConfig[];
  readonly layout?: 'horizontal' | 'vertical' | 'inline';
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly showResetButton?: boolean;
  readonly showSearchButton?: boolean;
  readonly onFilter?: (values: Record<string, unknown>) => void;
  readonly onReset?: () => void;
}

/**
 * 过滤器字段配置
 */
export interface FilterFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';
  readonly placeholder?: string;
  readonly options?: readonly Option[];
  readonly defaultValue?: unknown;
  readonly span?: number;
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  readonly title: string;
  readonly href?: string;
  readonly icon?: ReactNode;
  readonly onClick?: () => void;
}

/**
 * 面包屑配置
 */
export interface BreadcrumbConfig {
  readonly items: readonly BreadcrumbItem[];
  readonly separator?: ReactNode;
  readonly maxItems?: number;
  readonly showHome?: boolean;
  readonly homeIcon?: ReactNode;
  readonly homeHref?: string;
}

/**
 * 页面头部配置
 */
export interface PageHeaderConfig {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly avatar?: ReactNode;
  readonly breadcrumb?: BreadcrumbConfig;
  readonly actions?: readonly ReactNode[];
  readonly extra?: ReactNode;
  readonly tags?: readonly ReactNode[];
  readonly showBack?: boolean;
  readonly onBack?: () => void;
}

/**
 * 侧边栏菜单项
 */
export interface SidebarMenuItem {
  readonly key: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly path?: string;
  readonly children?: readonly SidebarMenuItem[];
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly badge?: string | number;
  readonly permissions?: readonly string[];
}

/**
 * 侧边栏配置
 */
export interface SidebarConfig {
  readonly items: readonly SidebarMenuItem[];
  readonly collapsed?: boolean;
  readonly collapsible?: boolean;
  readonly width?: number;
  readonly collapsedWidth?: number;
  readonly theme?: 'light' | 'dark';
  readonly mode?: 'vertical' | 'horizontal' | 'inline';
  readonly selectedKeys?: readonly string[];
  readonly openKeys?: readonly string[];
  readonly onSelect?: (selectedKeys: readonly string[]) => void;
  readonly onOpenChange?: (openKeys: readonly string[]) => void;
  readonly onCollapse?: (collapsed: boolean) => void;
}

/**
 * 模态框配置
 */
export interface ModalConfig {
  readonly title?: ReactNode;
  readonly content?: ReactNode;
  readonly footer?: ReactNode | null;
  readonly width?: number | string;
  readonly centered?: boolean;
  readonly closable?: boolean;
  readonly maskClosable?: boolean;
  readonly keyboard?: boolean;
  readonly destroyOnClose?: boolean;
  readonly forceRender?: boolean;
  readonly getContainer?: () => HTMLElement;
  readonly onOk?: () => void | Promise<void>;
  readonly onCancel?: () => void;
  readonly afterClose?: () => void;
}

/**
 * 抽屉配置
 */
export interface DrawerConfig {
  readonly title?: ReactNode;
  readonly content?: ReactNode;
  readonly footer?: ReactNode;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly placement?: 'top' | 'right' | 'bottom' | 'left';
  readonly closable?: boolean;
  readonly maskClosable?: boolean;
  readonly keyboard?: boolean;
  readonly destroyOnClose?: boolean;
  readonly forceRender?: boolean;
  readonly getContainer?: () => HTMLElement;
  readonly onClose?: () => void;
  readonly afterVisibleChange?: (visible: boolean) => void;
}

/**
 * 通知配置
 */
export interface NotificationConfig {
  readonly type: 'success' | 'info' | 'warning' | 'error';
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  readonly icon?: ReactNode;
  readonly btn?: ReactNode;
  readonly key?: string;
  readonly onClose?: () => void;
  readonly onClick?: () => void;
}

/**
 * 加载状态配置
 */
export interface LoadingConfig {
  readonly spinning?: boolean;
  readonly size?: ComponentSizeType;
  readonly tip?: string;
  readonly indicator?: ReactNode;
  readonly delay?: number;
  readonly wrapperClassName?: string;
}

/**
 * 空状态配置
 */
export interface EmptyConfig {
  readonly image?: ReactNode;
  readonly imageStyle?: CSSProperties;
  readonly description?: ReactNode;
  readonly children?: ReactNode;
}

/**
 * 错误边界状态
 */
export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: { componentStack: string };
}

/**
 * 错误边界配置
 */
export interface ErrorBoundaryConfig {
  readonly fallback?: ComponentType<ErrorBoundaryState>;
  readonly onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  readonly resetOnPropsChange?: boolean;
  readonly resetKeys?: readonly unknown[];
}

/**
 * 表单页面配置
 */
export interface FormPageConfig<T = Record<string, unknown>> {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly breadcrumb?: BreadcrumbConfig;
  readonly form: FormConfig<T>;
  readonly layout?: 'card' | 'plain';
  readonly showHeader?: boolean;
  readonly showFooter?: boolean;
  readonly actions?: readonly ReactNode[];
}

/**
 * 列表页面配置
 */
export interface ListPageConfig<T = Record<string, unknown>> {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly breadcrumb?: BreadcrumbConfig;
  readonly table: TableConfig<T>;
  readonly search?: SearchConfig;
  readonly filter?: FilterConfig;
  readonly actions?: readonly ReactNode[];
  readonly batchActions?: readonly TableRowAction<T>[];
}

/**
 * 详情页面配置
 */
export interface DetailPageConfig<T = Record<string, unknown>> {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly breadcrumb?: BreadcrumbConfig;
  readonly data: T;
  readonly fields: readonly DetailFieldConfig[];
  readonly layout?: 'card' | 'plain' | 'tabs';
  readonly actions?: readonly ReactNode[];
}

/**
 * 详情字段配置
 */
export interface DetailFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly span?: number;
  readonly render?: (value: unknown, record: Record<string, unknown>) => ReactNode;
  readonly copyable?: boolean;
  readonly ellipsis?: boolean;
}

/**
 * 组件状态管理
 */
export interface ComponentState<T = Record<string, unknown>> {
  readonly data: T;
  readonly loading: boolean;
  readonly error?: string;
  readonly dirty: boolean;
  readonly lastUpdated?: string;
}

/**
 * 组件操作接口
 */
export interface ComponentActions<T = Record<string, unknown>> {
  setData: (data: T) => void;
  updateData: (updates: Partial<T>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  refresh: () => Promise<void>;
}

/**
 * 高阶组件配置
 */
export interface HOCConfig {
  readonly displayName?: string;
  readonly forwardRef?: boolean;
  readonly memo?: boolean;
  readonly pure?: boolean;
}

/**
 * 组件工厂配置
 */
export interface ComponentFactoryConfig<P = Record<string, unknown>> {
  readonly defaultProps?: Partial<P>;
  readonly propTypes?: Record<string, unknown>;
  readonly displayName?: string;
  readonly memo?: boolean;
  readonly forwardRef?: boolean;
}

/**
 * 组件注册表
 */
export interface ComponentRegistry {
  register: <P = Record<string, unknown>>(
    name: string,
    component: ComponentType<P>,
    config?: ComponentFactoryConfig<P>
  ) => void;
  get: <P = Record<string, unknown>>(name: string) => ComponentType<P> | undefined;
  has: (name: string) => boolean;
  unregister: (name: string) => void;
  list: () => readonly string[];
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  readonly primaryColor?: string;
  readonly successColor?: string;
  readonly warningColor?: string;
  readonly errorColor?: string;
  readonly infoColor?: string;
  readonly textColor?: string;
  readonly backgroundColor?: string;
  readonly borderColor?: string;
  readonly borderRadius?: number;
  readonly fontSize?: number;
  readonly fontFamily?: string;
  readonly spacing?: Record<string, number>;
  readonly shadows?: Record<string, string>;
  readonly breakpoints?: Record<string, number>;
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  readonly xs?: number; // <576px
  readonly sm?: number; // ≥576px
  readonly md?: number; // ≥768px
  readonly lg?: number; // ≥992px
  readonly xl?: number; // ≥1200px
  readonly xxl?: number; // ≥1600px
}

/**
 * 栅格配置
 */
export interface GridConfig {
  readonly gutter?: number | [number, number] | ResponsiveConfig;
  readonly align?: 'top' | 'middle' | 'bottom' | 'stretch';
  readonly justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
  readonly wrap?: boolean;
}

/**
 * 栅格列配置
 */
export interface GridColConfig extends ResponsiveConfig {
  readonly span?: number;
  readonly offset?: number;
  readonly push?: number;
  readonly pull?: number;
  readonly order?: number;
  readonly flex?: string | number;
}