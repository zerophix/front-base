/**
 * 状态管理类型定义
 * 定义所有状态相关的接口和类型
 */

import type { MenuItem, MenuTree, SearchResult } from './sidebar';
import type { RouteConfig, RoutePath, ModuleType } from './routes';

/**
 * 基础状态接口
 */
export interface BaseState {
  readonly loading: boolean;
  readonly error?: string;
  readonly lastUpdated?: number;
}

/**
 * 侧边栏状态
 */
export interface SidebarStoreState extends BaseState {
  readonly ui: {
    readonly collapsed: boolean;
    readonly openKeys: readonly string[];
    readonly selectedKey: string;
    readonly width: number;
    readonly mode: 'inline' | 'popup' | 'drawer';
  };
  readonly menu: {
    readonly tree: MenuTree | null;
    readonly flatItems: readonly MenuItem[];
    readonly activeModule: ModuleType | null;
  };
  readonly search: {
    readonly query: string;
    readonly results: readonly SearchResult[];
    readonly active: boolean;
    readonly history: readonly string[];
  };
  readonly navigation: {
    readonly currentPath: RoutePath;
    readonly previousPath?: RoutePath;
    readonly breadcrumbs: readonly BreadcrumbItem[];
  };
  readonly preferences: {
    readonly autoCollapse: boolean;
    readonly rememberState: boolean;
    readonly animationEnabled: boolean;
  };
}

/**
 * 路由状态
 */
export interface RouteStoreState extends BaseState {
  readonly routes: readonly RouteConfig[];
  readonly routeMap: Record<string, RouteConfig>;
  readonly moduleRoutes: Record<ModuleType, readonly RouteConfig[]>;
  readonly currentRoute: RouteConfig | null;
  readonly navigationHistory: readonly RoutePath[];
}

/**
 * UI状态
 */
export interface UIStoreState extends BaseState {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: 'zh' | 'en';
  readonly layout: {
    readonly sidebarCollapsed: boolean;
    readonly headerVisible: boolean;
    readonly footerVisible: boolean;
  };
  readonly responsive: {
    readonly breakpoint: 'mobile' | 'tablet' | 'desktop';
    readonly screenWidth: number;
    readonly screenHeight: number;
  };
  readonly notifications: readonly Notification[];
}

/**
 * 应用全局状态
 */
export interface AppStoreState extends BaseState {
  readonly initialized: boolean;
  readonly user: UserState | null;
  readonly permissions: readonly string[];
  readonly config: AppConfig;
  readonly version: string;
}

/**
 * 用户状态
 */
export interface UserState {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly role: string;
  readonly permissions: readonly string[];
  readonly preferences: UserPreferences;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: 'zh' | 'en';
  readonly sidebarCollapsed: boolean;
  readonly notifications: boolean;
  readonly autoSave: boolean;
}

/**
 * 应用配置
 */
export interface AppConfig {
  readonly apiBaseUrl: string;
  readonly enableDevTools: boolean;
  readonly enableAnalytics: boolean;
  readonly features: Record<string, boolean>;
  readonly limits: {
    readonly maxSearchResults: number;
    readonly maxHistoryItems: number;
    readonly cacheSize: number;
  };
}

/**
 * 通知类型
 */
export interface Notification {
  readonly id: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly title: string;
  readonly message: string;
  readonly duration?: number;
  readonly actions?: readonly NotificationAction[];
  readonly timestamp: number;
}

export interface NotificationAction {
  readonly label: string;
  readonly action: () => void;
  readonly type?: 'primary' | 'secondary';
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  readonly label: string;
  readonly path?: RoutePath;
  readonly icon?: string;
}

/**
 * 状态动作类型
 */
export interface BaseAction {
  readonly type: string;
  readonly payload?: unknown;
  readonly meta?: ActionMeta;
}

export interface ActionMeta {
  readonly timestamp: number;
  readonly source?: string;
  readonly batch?: boolean;
}

/**
 * 侧边栏动作
 */
export interface SidebarActions {
  // UI 动作
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setOpenKeys: (keys: readonly string[]) => void;
  setSelectedKey: (key: string) => void;
  setWidth: (width: number) => void;
  setMode: (mode: 'inline' | 'popup' | 'drawer') => void;
  
  // 菜单动作
  loadMenuTree: () => Promise<void>;
  updateMenuItem: (key: string, updates: Partial<MenuItem>) => void;
  setActiveModule: (module: ModuleType) => void;
  
  // 搜索动作
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // 导航动作
  navigateTo: (path: RoutePath) => void;
  updateBreadcrumbs: (breadcrumbs: readonly BreadcrumbItem[]) => void;
  
  // 偏好设置动作
  setPreferences: (preferences: Partial<SidebarStoreState['preferences']>) => void;
  
  // 错误处理
  setError: (error: string) => void;
  clearError: () => void;
}

/**
 * 路由动作
 */
export interface RouteActions {
  loadRoutes: () => Promise<void>;
  setCurrentRoute: (route: RouteConfig) => void;
  addToHistory: (path: RoutePath) => void;
  clearHistory: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

/**
 * UI动作
 */
export interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  updateLayout: (layout: Partial<UIStoreState['layout']>) => void;
  updateResponsive: (responsive: Partial<UIStoreState['responsive']>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * 应用动作
 */
export interface AppActions {
  initialize: () => Promise<void>;
  setUser: (user: UserState) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setPermissions: (permissions: readonly string[]) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

/**
 * 根状态类型
 */
export interface RootState {
  readonly sidebar: SidebarStoreState;
  readonly route: RouteStoreState;
  readonly ui: UIStoreState;
  readonly app: AppStoreState;
}

/**
 * 根动作类型
 */
export interface RootActions {
  readonly sidebar: SidebarActions;
  readonly route: RouteActions;
  readonly ui: UIActions;
  readonly app: AppActions;
}

/**
 * 状态选择器类型
 */
export type StateSelector<T> = (state: RootState) => T;

/**
 * 状态订阅器类型
 */
export type StateSubscriber<T> = (state: T, prevState: T) => void;

/**
 * 状态中间件类型
 */
export type StateMiddleware = (
  action: BaseAction,
  state: RootState,
  next: (action: BaseAction) => void
) => void;

/**
 * 状态存储接口
 */
export interface StateStore {
  // 状态获取
  getState(): RootState;
  getState<T>(selector: StateSelector<T>): T;
  
  // 状态订阅
  subscribe<T>(selector: StateSelector<T>, subscriber: StateSubscriber<T>): () => void;
  subscribe(subscriber: StateSubscriber<RootState>): () => void;
  
  // 动作分发
  dispatch(action: BaseAction): void;
  
  // 中间件
  use(middleware: StateMiddleware): void;
  
  // 生命周期
  initialize(): Promise<void>;
  destroy(): void;
}

/**
 * 状态持久化接口
 */
export interface StatePersistence {
  save(key: string, state: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * 状态验证器类型
 */
export type StateValidator<T> = (state: T) => boolean | string;

/**
 * 状态迁移器类型
 */
export type StateMigrator<T> = (oldState: unknown, version: string) => T;

/**
 * 状态配置
 */
export interface StateConfig {
  readonly persistence: {
    readonly enabled: boolean;
    readonly key: string;
    readonly storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
    readonly whitelist?: readonly string[];
    readonly blacklist?: readonly string[];
  };
  readonly devTools: {
    readonly enabled: boolean;
    readonly maxActions: number;
    readonly trace: boolean;
  };
  readonly middleware: {
    readonly logger: boolean;
    readonly thunk: boolean;
    readonly saga: boolean;
  };
}

/**
 * 导出状态类型命名空间
 */
// Store type aliases for convenience
export type StoreRoot = RootState;
export type StoreActions = RootActions;
export type Store = StateStore;
export type StoreSelector<T> = StateSelector<T>;
export type StoreSubscriber<T> = StateSubscriber<T>;
export type StoreMiddleware = StateMiddleware;
export type StorePersistence = StatePersistence;
export type StoreConfig = StateConfig;