/**
 * 服务层类型定义
 * 定义所有服务相关的接口和类型
 */

import type { MenuItem, MenuTree, SearchResult, SearchState } from './sidebar';
import type { RouteConfig, RoutePath } from './routes';

/**
 * 基础服务接口
 */
export interface BaseService {
  readonly name: string;
  readonly version: string;
  initialize(): Promise<void> | void;
  destroy(): Promise<void> | void;
}

/**
 * 侧边栏服务接口
 */
export interface SidebarService extends BaseService {
  // 菜单管理
  getMenuTree(): Promise<MenuTree>;
  getMenuItem(key: string): Promise<MenuItem | null>;
  updateMenuItem(key: string, updates: Partial<MenuItem>): Promise<void>;
  
  // 状态管理
  getCollapsedState(): boolean;
  setCollapsedState(collapsed: boolean): void;
  getOpenKeys(): readonly string[];
  setOpenKeys(keys: readonly string[]): void;
  getSelectedKey(): string;
  setSelectedKey(key: string): void;
  
  // 导航
  navigateToPath(path: RoutePath): Promise<void>;
  getCurrentPath(): RoutePath;
  
  // 事件监听
  onStateChange(callback: (state: SidebarServiceState) => void): () => void;
}

/**
 * 搜索服务接口
 */
export interface SearchService extends BaseService {
  // 搜索功能
  search(query: string): Promise<readonly SearchResult[]>;
  clearSearch(): void;
  getSearchState(): SearchState;
  
  // 搜索配置
  setSearchOptions(options: SearchOptions): void;
  getSearchOptions(): SearchOptions;
  
  // 搜索历史
  getSearchHistory(): readonly string[];
  addToHistory(query: string): void;
  clearHistory(): void;
  
  // 事件监听
  onSearchStateChange(callback: (state: SearchState) => void): () => void;
}

/**
 * 路由服务接口
 */
export interface RouteService extends BaseService {
  // 路由管理
  getAllRoutes(): readonly RouteConfig[];
  getRouteByPath(path: RoutePath): RouteConfig | null;
  getRoutesByModule(module: string): readonly RouteConfig[];
  
  // 路由转换
  routesToMenuItems(routes: readonly RouteConfig[]): readonly MenuItem[];
  menuItemsToRoutes(items: readonly MenuItem[]): readonly RouteConfig[];
  
  // 路由验证
  validateRoute(route: RouteConfig): boolean;
  validatePath(path: string): boolean;
}

/**
 * 缓存服务接口
 */
export interface CacheService extends BaseService {
  // 基础缓存操作
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // 批量操作
  getMany<T>(keys: readonly string[]): Promise<readonly (T | null)[]>;
  setMany<T>(entries: readonly [string, T, number?][]): Promise<void>;
  deleteMany(keys: readonly string[]): Promise<void>;
  
  // 缓存统计
  getStats(): Promise<CacheStats>;
}

/**
 * 权限服务接口
 */
export interface PermissionService extends BaseService {
  // 权限检查
  hasPermission(permission: string): Promise<boolean>;
  hasAnyPermission(permissions: readonly string[]): Promise<boolean>;
  hasAllPermissions(permissions: readonly string[]): Promise<boolean>;
  
  // 权限管理
  getUserPermissions(): Promise<readonly string[]>;
  checkMenuItemPermission(item: MenuItem): Promise<boolean>;
  filterMenuItemsByPermission(items: readonly MenuItem[]): Promise<readonly MenuItem[]>;
}

/**
 * 服务状态类型
 */
export interface SidebarServiceState {
  readonly collapsed: boolean;
  readonly openKeys: readonly string[];
  readonly selectedKey: string;
  readonly menuTree: MenuTree | null;
  readonly loading: boolean;
  readonly error?: string;
}

/**
 * 搜索选项类型
 */
export interface SearchOptions {
  readonly caseSensitive: boolean;
  readonly fuzzySearch: boolean;
  readonly maxResults: number;
  readonly searchFields: readonly ('label' | 'path' | 'keyword')[];
  readonly minQueryLength: number;
  readonly debounceMs: number;
}

/**
 * 缓存统计类型
 */
export interface CacheStats {
  readonly size: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly evictionCount: number;
  readonly totalRequests: number;
}

/**
 * 服务配置类型
 */
export interface ServiceConfig {
  readonly sidebar: {
    readonly cacheEnabled: boolean;
    readonly cacheTtl: number;
    readonly autoCollapse: boolean;
    readonly persistState: boolean;
  };
  readonly search: {
    readonly enabled: boolean;
    readonly options: SearchOptions;
    readonly historySize: number;
    readonly persistHistory: boolean;
  };
  readonly cache: {
    readonly maxSize: number;
    readonly defaultTtl: number;
    readonly cleanupInterval: number;
  };
  readonly permission: {
    readonly enabled: boolean;
    readonly strictMode: boolean;
    readonly cachePermissions: boolean;
  };
}

/**
 * 服务容器接口
 */
export interface ServiceContainer {
  // 服务注册
  register<T extends BaseService>(name: string, service: T): void;
  registerSingleton<T extends BaseService>(name: string, factory: () => T): void;
  
  // 服务获取
  get<T extends BaseService>(name: string): T;
  getOptional<T extends BaseService>(name: string): T | null;
  
  // 服务管理
  has(name: string): boolean;
  remove(name: string): void;
  clear(): void;
  
  // 生命周期
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

/**
 * 服务工厂类型
 */
export type ServiceFactory<T extends BaseService> = () => T;

/**
 * 服务依赖注入类型
 */
export interface ServiceDependency {
  readonly name: string;
  readonly required: boolean;
  readonly version?: string;
}

/**
 * 服务元数据类型
 */
export interface ServiceMetadata {
  readonly name: string;
  readonly version: string;
  readonly dependencies: readonly ServiceDependency[];
  readonly singleton: boolean;
  readonly lazy: boolean;
}

/**
 * 错误类型
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ServiceNotFoundError extends ServiceError {
  constructor(serviceName: string) {
    super(`Service '${serviceName}' not found`, serviceName, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceDependencyError extends ServiceError {
  constructor(serviceName: string, dependencyName: string) {
    super(
      `Service '${serviceName}' depends on '${dependencyName}' which is not available`,
      serviceName,
      'DEPENDENCY_ERROR'
    );
    this.name = 'ServiceDependencyError';
  }
}

/**
 * 服务事件类型
 */
export interface ServiceEvents {
  onServiceRegistered: (name: string, service: BaseService) => void;
  onServiceRemoved: (name: string) => void;
  onServiceError: (error: ServiceError) => void;
  onContainerInitialized: () => void;
  onContainerDestroyed: () => void;
}

/**
 * 导出服务类型别名（使用ES2015模块语法）
 */
export type BaseServiceType = BaseService;
export type SidebarServiceType = SidebarService;
export type SearchServiceType = SearchService;
export type RouteServiceType = RouteService;
export type CacheServiceType = CacheService;
export type PermissionServiceType = PermissionService;
export type ServiceContainerType = ServiceContainer;
export type ServiceConfigType = ServiceConfig;
export type ServiceFactoryType<T extends BaseService> = ServiceFactory<T>;
export type ServiceMetadataType = ServiceMetadata;
export type ServiceEventsType = ServiceEvents;