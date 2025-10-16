/**
 * 统一错误处理工具
 * 提供类型安全的错误处理和日志记录
 */

import { message } from 'antd';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误基类
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    type: ErrorType,
    message: string,
    code: string,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * 转换为用户友好的消息
   */
  toUserMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return this.message || '输入数据格式不正确';
      case ErrorType.NETWORK:
        return '网络连接失败，请检查网络设置';
      case ErrorType.AUTHENTICATION:
        return '身份验证失败，请重新登录';
      case ErrorType.AUTHORIZATION:
        return '没有权限执行此操作';
      case ErrorType.NOT_FOUND:
        return '请求的资源不存在';
      case ErrorType.SERVER:
        return '服务器错误，请稍后重试';
      default:
        return '操作失败，请稍后重试';
    }
  }

  /**
   * 转换为日志格式
   */
  toLogFormat(): Record<string, any> {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: any) {
    super(
      ErrorType.VALIDATION,
      message,
      'VALIDATION_ERROR',
      400,
      { field, value }
    );
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(message: string, url?: string, method?: string) {
    super(
      ErrorType.NETWORK,
      message,
      'NETWORK_ERROR',
      undefined,
      { url, method }
    );
  }
}

/**
 * 业务错误
 */
export class BusinessError extends AppError {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(
      ErrorType.UNKNOWN,
      message,
      code,
      undefined,
      context
    );
  }
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  showUserMessage?: boolean;
  logError?: boolean;
  reportError?: boolean;
  fallbackMessage?: string;
}

/**
 * 默认错误处理器配置
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  showUserMessage: true,
  logError: true,
  reportError: false,
  fallbackMessage: '操作失败，请稍后重试',
};

/**
 * 统一错误处理器
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 处理错误
   */
  handle(error: unknown, context?: Record<string, any>): void {
    const appError = this.normalizeError(error, context);

    // 记录日志
    if (this.config.logError) {
      this.logError(appError);
    }

    // 显示用户消息
    if (this.config.showUserMessage) {
      this.showUserMessage(appError);
    }

    // 上报错误（如果配置了错误监控服务）
    if (this.config.reportError) {
      this.reportError(appError);
    }
  }

  /**
   * 标准化错误对象
   */
  private normalizeError(error: unknown, context?: Record<string, any>): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        ErrorType.UNKNOWN,
        error.message,
        'UNKNOWN_ERROR',
        undefined,
        { ...context, originalError: error.name }
      );
    }

    return new AppError(
      ErrorType.UNKNOWN,
      this.config.fallbackMessage || '未知错误',
      'UNKNOWN_ERROR',
      undefined,
      { ...context, originalError: String(error) }
    );
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError): void {
    const logData = error.toLogFormat();
    
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.type} Error`);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      if (error.context) {
        console.error('Context:', error.context);
      }
      console.error('Stack:', error.stack);
      console.groupEnd();
    } else {
      // 生产环境可以发送到日志服务
      console.error('[ErrorHandler]', JSON.stringify(logData));
    }
  }

  /**
   * 显示用户消息
   */
  private showUserMessage(error: AppError): void {
    const userMessage = error.toUserMessage();
    
    switch (error.type) {
      case ErrorType.VALIDATION:
        message.warning(userMessage);
        break;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        message.error(userMessage);
        break;
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
        message.error(userMessage);
        break;
      default:
        message.error(userMessage);
    }
  }

  /**
   * 上报错误到监控服务
   */
  private reportError(error: AppError): void {
    // 这里可以集成错误监控服务，如 Sentry
    // 目前只是占位实现
    if (typeof window !== 'undefined' && (window as any).errorReporter) {
      (window as any).errorReporter.captureException(error);
    }
  }
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * 安全执行函数 - 包装可能抛出错误的函数
 */
export async function safeExecute<T>(
  fn: () => Promise<T> | T,
  errorHandler?: ErrorHandler,
  context?: Record<string, any>
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    (errorHandler || globalErrorHandler).handle(error, context);
    return null;
  }
}

/**
 * 类型守卫：检查是否为 AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 类型守卫：检查是否为特定类型的 AppError
 */
export function isErrorOfType(error: unknown, type: ErrorType): error is AppError {
  return isAppError(error) && error.type === type;
}

/**
 * 创建错误工厂函数
 */
export const createError = {
  validation: (message: string, field?: string, value?: any) => 
    new ValidationError(message, field, value),
  
  network: (message: string, url?: string, method?: string) => 
    new NetworkError(message, url, method),
  
  business: (message: string, code: string, context?: Record<string, any>) => 
    new BusinessError(message, code, context),
  
  auth: (message: string = '身份验证失败') => 
    new AppError(ErrorType.AUTHENTICATION, message, 'AUTH_ERROR', 401),
  
  forbidden: (message: string = '没有权限访问') => 
    new AppError(ErrorType.AUTHORIZATION, message, 'FORBIDDEN_ERROR', 403),
  
  notFound: (message: string = '资源不存在') => 
    new AppError(ErrorType.NOT_FOUND, message, 'NOT_FOUND_ERROR', 404),
  
  server: (message: string = '服务器内部错误') => 
    new AppError(ErrorType.SERVER, message, 'SERVER_ERROR', 500),
};