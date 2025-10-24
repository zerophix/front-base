/**
 * 状态管理核心类型定义
 * 提供严格的状态类型约束，与实际实现保持一致
 */

import type { ID, Timestamp, AsyncState, AppError } from './base';

/**
 * 主题类型
 */
export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemeType = typeof Theme[keyof typeof Theme];

/**
 * UI 状态接口 - 与实际 Zustand store 保持一致
 */
export interface UIState {
  // 主题相关
  readonly theme: ThemeType;
  
  // 全局 loading 状态
  readonly loading: boolean;
  readonly loadingCount: number;
  
  // 侧边栏状态
  readonly sidebarCollapsed: boolean;
  readonly sidebarOpenKeys: readonly string[];
}

/**
 * UI 状态操作接口
 */
export interface UIActions {
  // 主题操作
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  
  // Loading 操作
  showLoading: () => void;
  hideLoading: () => void;
  
  // 侧边栏操作
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpenKeys: (keys: readonly string[]) => void;
}

/**
 * 完整的 UI Store 类型
 */
export type UIStore = UIState & UIActions;

/**
 * 用户信息接口
 */
export interface User {
  readonly id: ID;
  readonly name: string;
  readonly email?: string;
  readonly avatar?: string;
  readonly department?: string;
  readonly role?: string;
  readonly permissions: readonly string[];
}

/**
 * 用户状态接口
 */
export interface UserState {
  readonly user: User | null;
}

/**
 * 用户状态操作接口
 */
export interface UserActions {
  setUser: (user: User | null) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
}

/**
 * 完整的用户 Store 类型
 */
export type UserStore = UserState & UserActions;

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

/**
 * 页面配置状态接口
 */
export interface PageState {
  readonly pageTitle: string;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly recordNumber: string;
}

/**
 * 页面配置操作接口
 */
export interface PageActions {
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: readonly BreadcrumbItem[]) => void;
  setRecordNumber: (recordNumber: string) => void;
  setPageConfig: (config: {
    title: string;
    breadcrumbs?: readonly BreadcrumbItem[];
    recordNumber?: string;
  }) => void;
}

/**
 * 完整的页面 Store 类型
 */
export type PageStore = PageState & PageActions;

/**
 * 路由元信息
 */
export interface RouteMeta {
  readonly title: string;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly requiresAuth: boolean;
  readonly permissions: readonly string[];
  readonly module: string;
}

/**
 * 应用全局状态
 */
export interface AppState {
  readonly initialized: boolean;
  readonly version: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly features: Record<string, boolean>;
}

/**
 * 应用状态操作
 */
export interface AppActions {
  initialize: () => Promise<void>;
  setFeature: (feature: string, enabled: boolean) => void;
}

/**
 * 完整的应用 Store 类型
 */
export type AppStore = AppState & AppActions;

/**
 * 通知类型
 */
export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType];

/**
 * 通知项
 */
export interface Notification {
  readonly id: ID;
  readonly type: NotificationTypeType;
  readonly title: string;
  readonly message: string;
  readonly duration?: number;
  readonly timestamp: Timestamp;
  readonly read: boolean;
}

/**
 * 通知状态
 */
export interface NotificationState {
  readonly notifications: readonly Notification[];
  readonly unreadCount: number;
}

/**
 * 通知操作
 */
export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: ID) => void;
  markAsRead: (id: ID) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

/**
 * 完整的通知 Store 类型
 */
export type NotificationStore = NotificationState & NotificationActions;

/**
 * Store 持久化配置
 */
export interface PersistConfig<T> {
  readonly name: string;
  readonly storage: 'localStorage' | 'sessionStorage';
  readonly partialize?: (state: T) => Partial<T>;
  readonly version?: number;
  readonly migrate?: (persistedState: unknown, version: number) => T;
}

/**
 * Store 中间件类型
 */
export type StoreMiddleware<T> = (
  config: (set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void, get: () => T) => T
) => (set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void, get: () => T) => T;

/**
 * 异步操作状态管理工具类型
 */
export interface AsyncOperationState<T, E = AppError> extends AsyncState<T, E> {
  readonly operation: string;
  readonly startedAt?: Timestamp;
  readonly completedAt?: Timestamp;
}

/**
 * 异步操作管理器
 */
export interface AsyncOperationManager<T, E = AppError> {
  readonly state: AsyncOperationState<T, E>;
  start: (operation: string) => void;
  success: (data: T) => void;
  error: (error: E) => void;
  reset: () => void;
}

/**
 * 表单状态管理
 */
export interface FormState<T = Record<string, unknown>> {
  readonly values: T;
  readonly errors: Record<keyof T, string>;
  readonly touched: Record<keyof T, boolean>;
  readonly dirty: boolean;
  readonly valid: boolean;
  readonly submitting: boolean;
}

/**
 * 表单操作
 */
export interface FormActions<T = Record<string, unknown>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  reset: (values?: T) => void;
  submit: () => Promise<void>;
}

/**
 * 完整的表单 Store 类型
 */
export type FormStore<T = Record<string, unknown>> = FormState<T> & FormActions<T>;

/**
 * 列表状态管理
 */
export interface ListState<T> {
  readonly items: readonly T[];
  readonly loading: boolean;
  readonly error: AppError | null;
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
  readonly filters: Record<string, unknown>;
  readonly sort: {
    readonly field: string;
    readonly direction: 'asc' | 'desc';
  } | null;
}

/**
 * 列表操作
 */
export interface ListActions<T> {
  load: (params?: Record<string, unknown>) => Promise<void>;
  reload: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  clearSort: () => void;
  addItem: (item: T) => void;
  updateItem: (id: ID, updates: Partial<T>) => void;
  removeItem: (id: ID) => void;
  reset: () => void;
}

/**
 * 完整的列表 Store 类型
 */
export type ListStore<T> = ListState<T> & ListActions<T>;

/**
 * Store 工厂函数类型
 */
export type StoreFactory<T> = () => T;

/**
 * Store 选择器类型
 */
export type StoreSelector<T, R> = (state: T) => R;

/**
 * Store 订阅器类型
 */
export type StoreSubscriber<T> = (state: T, prevState: T) => void;