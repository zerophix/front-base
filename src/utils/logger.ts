/**
 * 安全日志记录系统
 * 实现审计追踪和安全事件监控
 */

import { loggingConfig } from '../config/security';

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * 安全事件类型
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  PERMISSION_CHANGE = 'permission_change',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SECURITY_VIOLATION = 'security_violation',
  CSRF_VIOLATION = 'csrf_violation',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  API_KEY_USAGE = 'api_key_usage',
  SESSION_EXPIRED = 'session_expired',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

/**
 * 安全事件日志接口
 */
export interface SecurityEvent extends LogEntry {
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target?: string;
  outcome: 'success' | 'failure' | 'blocked';
  riskScore?: number;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
  };
}

/**
 * 审计日志接口
 */
export interface AuditLog extends LogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  changes?: Record<string, { from: any; to: any }>;
}

/**
 * 日志上下文
 */
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
}

/**
 * 敏感数据清理器
 */
class SensitiveDataSanitizer {
  private static sensitiveFields = new Set(loggingConfig.sensitiveFields);
  
  /**
   * 清理敏感数据
   */
  public static sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (this.sensitiveFields.has(lowerKey) || this.isSensitiveKey(lowerKey)) {
        sanitized[key] = this.maskSensitiveValue(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  /**
   * 检查是否为敏感字段
   */
  private static isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /auth/i,
      /credential/i,
      /ssn/i,
      /social/i,
      /credit/i,
      /bank/i,
      /account/i,
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(key));
  }
  
  /**
   * 掩码敏感值
   */
  private static maskSensitiveValue(value: any): string {
    if (typeof value !== 'string') {
      return '[REDACTED]';
    }
    
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }
}

/**
 * 日志记录器
 */
export class Logger {
  private static instance: Logger;
  private context: LogContext = {};
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  /**
   * 设置日志上下文
   */
  public setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }
  
  /**
   * 清除日志上下文
   */
  public clearContext(): void {
    this.context = {};
  }
  
  /**
   * 记录普通日志
   */
  public log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      metadata: metadata ? SensitiveDataSanitizer.sanitize(metadata) : undefined,
    };
    
    this.writeLog(entry);
  }
  
  /**
   * 记录错误日志
   */
  public error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      ...this.context,
      metadata: metadata ? SensitiveDataSanitizer.sanitize(metadata) : undefined,
      stackTrace: error?.stack,
    };
    
    this.writeLog(entry);
  }
  
  /**
   * 记录警告日志
   */
  public warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }
  
  /**
   * 记录信息日志
   */
  public info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }
  
  /**
   * 记录调试日志
   */
  public debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }
  
  /**
   * 写入日志
   */
  private writeLog(entry: LogEntry): void {
    // 在浏览器环境中使用console
    if (typeof window !== 'undefined') {
      this.writeToConsole(entry);
    } else {
      // 在服务器环境中可以写入文件或发送到日志服务
      this.writeToConsole(entry);
      // TODO: 实现文件写入或远程日志服务
    }
  }
  
  /**
   * 写入控制台
   */
  private writeToConsole(entry: LogEntry): void {
    const logMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage, entry.metadata, entry.stackTrace);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.metadata);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.metadata);
        break;
      default:
        console.log(logMessage, entry.metadata);
    }
  }
}

/**
 * 安全事件记录器
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private logger: Logger;
  
  private constructor() {
    this.logger = Logger.getInstance();
  }
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  /**
   * 记录安全事件
   */
  public logSecurityEvent(
    eventType: SecurityEventType,
    message: string,
    severity: SecurityEvent['severity'],
    outcome: SecurityEvent['outcome'],
    metadata?: Record<string, any>
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      level: this.mapSeverityToLogLevel(severity),
      message,
      eventType,
      severity,
      source: this.getEventSource(),
      outcome,
      category: 'security',
      metadata: metadata ? SensitiveDataSanitizer.sanitize(metadata) : undefined,
    };
    
    this.logger.log(event.level, `[SECURITY] ${message}`, {
      eventType,
      severity,
      outcome,
      ...metadata,
    });
    
    // 高危事件立即告警
    if (severity === 'critical' || severity === 'high') {
      this.sendAlert(event);
    }
  }
  
  /**
   * 记录登录事件
   */
  public logLogin(success: boolean, userId?: string, metadata?: Record<string, any>): void {
    this.logSecurityEvent(
      success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      `User login ${success ? 'successful' : 'failed'}`,
      success ? 'low' : 'medium',
      success ? 'success' : 'failure',
      { userId, ...metadata }
    );
  }
  
  /**
   * 记录权限违规
   */
  public logUnauthorizedAccess(resource: string, userId?: string, metadata?: Record<string, any>): void {
    this.logSecurityEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      `Unauthorized access attempt to ${resource}`,
      'high',
      'blocked',
      { resource, userId, ...metadata }
    );
  }
  
  /**
   * 记录安全违规
   */
  public logSecurityViolation(violationType: string, details: string, metadata?: Record<string, any>): void {
    this.logSecurityEvent(
      SecurityEventType.SECURITY_VIOLATION,
      `Security violation detected: ${violationType} - ${details}`,
      'high',
      'blocked',
      { violationType, details, ...metadata }
    );
  }
  
  /**
   * 记录可疑活动
   */
  public logSuspiciousActivity(activity: string, riskScore: number, metadata?: Record<string, any>): void {
    const severity = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : 'medium';
    
    this.logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      `Suspicious activity detected: ${activity}`,
      severity,
      'blocked',
      { activity, riskScore, ...metadata }
    );
  }
  
  /**
   * 映射严重程度到日志级别
   */
  private mapSeverityToLogLevel(severity: SecurityEvent['severity']): LogLevel {
    switch (severity) {
      case 'critical':
      case 'high':
        return LogLevel.ERROR;
      case 'medium':
        return LogLevel.WARN;
      case 'low':
        return LogLevel.INFO;
      default:
        return LogLevel.INFO;
    }
  }
  
  /**
   * 获取事件源
   */
  private getEventSource(): string {
    if (typeof window !== 'undefined') {
      return 'client';
    }
    return 'server';
  }
  
  /**
   * 发送告警
   */
  private sendAlert(event: SecurityEvent): void {
    // TODO: 实现告警机制（邮件、短信、Slack等）
    console.error('🚨 SECURITY ALERT:', event);
  }
}

/**
 * 审计日志记录器
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private logger: Logger;
  
  private constructor() {
    this.logger = Logger.getInstance();
  }
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  /**
   * 记录数据变更
   */
  public logDataChange(
    action: string,
    resource: string,
    resourceId: string,
    oldValue: any,
    newValue: any,
    userId?: string
  ): void {
    const changes = this.calculateChanges(oldValue, newValue);
    
    const auditLog: AuditLog = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `Data ${action} on ${resource}`,
      category: 'audit',
      action,
      resource,
      resourceId,
      oldValue: SensitiveDataSanitizer.sanitize(oldValue),
      newValue: SensitiveDataSanitizer.sanitize(newValue),
      changes,
      userId,
    };
    
    this.logger.info(`[AUDIT] ${auditLog.message}`, {
      action,
      resource,
      resourceId,
      changes,
      userId,
    });
  }
  
  /**
   * 记录资源访问
   */
  public logResourceAccess(
    resource: string,
    resourceId: string,
    action: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.info(`[AUDIT] Resource access: ${action} on ${resource}`, {
      resource,
      resourceId,
      action,
      userId,
      ...metadata,
    });
  }
  
  /**
   * 计算数据变更
   */
  private calculateChanges(oldValue: any, newValue: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};
    
    if (typeof oldValue !== 'object' || typeof newValue !== 'object') {
      return changes;
    }
    
    const allKeys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);
    
    for (const key of allKeys) {
      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = {
          from: SensitiveDataSanitizer.sanitize(oldVal),
          to: SensitiveDataSanitizer.sanitize(newVal),
        };
      }
    }
    
    return changes;
  }
}

/**
 * 导出单例实例
 */
export const logger = Logger.getInstance();
export const securityLogger = SecurityLogger.getInstance();
export const auditLogger = AuditLogger.getInstance();

/**
 * 便捷函数
 */
export const logError = (message: string, error?: Error, metadata?: Record<string, any>) => {
  logger.error(message, error, metadata);
};

export const logWarn = (message: string, metadata?: Record<string, any>) => {
  logger.warn(message, metadata);
};

export const logInfo = (message: string, metadata?: Record<string, any>) => {
  logger.info(message, metadata);
};

export const logDebug = (message: string, metadata?: Record<string, any>) => {
  logger.debug(message, metadata);
};