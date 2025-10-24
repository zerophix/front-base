/**
 * API 核心类型定义
 * 提供严格的API请求/响应类型约束
 */

import type { 
  ID, 
  Timestamp, 
  PaginationParams, 
  PaginationResponse, 
  BaseQueryParams,
  AppError,
  Result,
  AsyncState
} from './base';

/**
 * HTTP 方法枚举
 */
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethodType = typeof HttpMethod[keyof typeof HttpMethod];

/**
 * API 响应状态码
 */
export const ApiStatusCode = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type ApiStatusCodeType = typeof ApiStatusCode[keyof typeof ApiStatusCode];

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly message: string;
  readonly code: ApiStatusCodeType;
  readonly timestamp: Timestamp;
  readonly traceId: string;
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse extends AppError {
  readonly statusCode: ApiStatusCodeType;
  readonly path: string;
  readonly method: HttpMethodType;
}

/**
 * 请求配置接口
 */
export interface RequestConfig {
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, unknown>;
  readonly cache?: boolean;
  readonly cacheTTL?: number;
}

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retries: number;
  readonly retryDelay: number;
  readonly defaultHeaders: Record<string, string>;
  readonly enableCache: boolean;
  readonly defaultCacheTTL: number;
}

/**
 * 拦截器类型
 */
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor<T = unknown> = (
  response: ApiResponse<T>
) => ApiResponse<T> | Promise<ApiResponse<T>>;

export type ErrorInterceptor = (
  error: ApiErrorResponse
) => ApiErrorResponse | Promise<ApiErrorResponse>;

/**
 * CRUD API 接口定义
 */
export interface CrudApi<T, CreateInput, UpdateInput, QueryParams extends BaseQueryParams = BaseQueryParams> {
  /**
   * 创建资源
   */
  create(input: CreateInput): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 根据ID获取资源
   */
  getById(id: ID): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 查询资源列表
   */
  list(params?: QueryParams): Promise<Result<PaginationResponse<T>, ApiErrorResponse>>;
  
  /**
   * 更新资源
   */
  update(input: UpdateInput): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 删除资源
   */
  delete(id: ID): Promise<Result<void, ApiErrorResponse>>;
  
  /**
   * 批量删除
   */
  batchDelete(ids: readonly ID[]): Promise<Result<void, ApiErrorResponse>>;
}

/**
 * 审批流程 API 接口
 */
export interface ApprovalApi<T> {
  /**
   * 提交审批
   */
  submit(id: ID, comment?: string): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 审批通过
   */
  approve(id: ID, comment?: string): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 审批拒绝
   */
  reject(id: ID, comment: string): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 撤回审批
   */
  withdraw(id: ID, comment?: string): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 获取审批历史
   */
  getApprovalHistory(id: ID): Promise<Result<readonly ApprovalRecord[], ApiErrorResponse>>;
}

/**
 * 审批记录
 */
export interface ApprovalRecord {
  readonly id: ID;
  readonly entityId: ID;
  readonly action: 'submit' | 'approve' | 'reject' | 'withdraw';
  readonly comment: string;
  readonly operatorId: ID;
  readonly operatorName: string;
  readonly timestamp: Timestamp;
}

/**
 * 文件上传 API 接口
 */
export interface FileUploadApi {
  /**
   * 单文件上传
   */
  uploadSingle(file: File, options?: UploadOptions): Promise<Result<FileInfo, ApiErrorResponse>>;
  
  /**
   * 多文件上传
   */
  uploadMultiple(files: readonly File[], options?: UploadOptions): Promise<Result<readonly FileInfo[], ApiErrorResponse>>;
  
  /**
   * 删除文件
   */
  deleteFile(fileId: ID): Promise<Result<void, ApiErrorResponse>>;
}

/**
 * 上传选项
 */
export interface UploadOptions {
  readonly maxSize?: number; // 最大文件大小（字节）
  readonly allowedTypes?: readonly string[]; // 允许的文件类型
  readonly folder?: string; // 上传目录
  readonly compress?: boolean; // 是否压缩
}

/**
 * 文件信息
 */
export interface FileInfo {
  readonly id: ID;
  readonly filename: string;
  readonly originalName: string;
  readonly size: number;
  readonly mimeType: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly uploadedAt: Timestamp;
  readonly uploadedBy: ID;
}

/**
 * 导入导出 API 接口
 */
export interface ImportExportApi<T> {
  /**
   * 导出数据
   */
  export(params?: BaseQueryParams): Promise<Result<ExportResult, ApiErrorResponse>>;
  
  /**
   * 导入数据
   */
  import(file: File, options?: ImportOptions): Promise<Result<ImportResult<T>, ApiErrorResponse>>;
  
  /**
   * 获取导入模板
   */
  getTemplate(): Promise<Result<FileInfo, ApiErrorResponse>>;
}

/**
 * 导出结果
 */
export interface ExportResult {
  readonly fileId: ID;
  readonly filename: string;
  readonly url: string;
  readonly recordCount: number;
  readonly exportedAt: Timestamp;
}

/**
 * 导入选项
 */
export interface ImportOptions {
  readonly skipErrors?: boolean; // 是否跳过错误行
  readonly updateExisting?: boolean; // 是否更新已存在的记录
  readonly validateOnly?: boolean; // 仅验证不导入
}

/**
 * 导入结果
 */
export interface ImportResult<T> {
  readonly successCount: number;
  readonly errorCount: number;
  readonly totalCount: number;
  readonly errors: readonly ImportError[];
  readonly successRecords: readonly T[];
}

/**
 * 导入错误
 */
export interface ImportError {
  readonly row: number;
  readonly field?: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * API 缓存接口
 */
export interface ApiCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
}

/**
 * API 客户端接口
 */
export interface ApiClient {
  /**
   * GET 请求
   */
  get<T>(url: string, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * POST 请求
   */
  post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * PUT 请求
   */
  put<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * PATCH 请求
   */
  patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * DELETE 请求
   */
  delete<T>(url: string, config?: RequestConfig): Promise<Result<T, ApiErrorResponse>>;
  
  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  
  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
  
  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void;
}

/**
 * API 状态管理
 */
export type ApiState<T> = AsyncState<T, ApiErrorResponse>;