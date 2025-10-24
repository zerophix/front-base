/**
 * 安全日志记录系统
 * 实现审计追踪和安全事件监控
 */

// 移除对服务端安全配置的直接导入，避免客户端引入加密模块
// import { loggingConfig } from '../config/security';
const IS_BROWSER = typeof window !== 'undefined';

const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'csrf',
    'ssn',
    'creditCard',
    'bankAccount',
  ],
  maxLogSize: '100MB',
  maxFiles: 30,
  auditLog: {
    enabled: !IS_BROWSER, // 仅在服务端启用审计日志
    events: [
      'login',
      'logout',
      'register',
      'password_change',
      'password_reset',
      'permission_change',
      'data_access',
      'data_modification',
      'security_violation',
    ],
  },
};

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
    // 写入控制台
    this.writeToConsole(entry);
    
    // 实现文件写入或远程日志服务
    if (IS_BROWSER) {
      // 浏览器环境：发送到远程日志服务
      this.sendToRemoteLogService(entry);
    } else {
      // 服务器环境：写入本地文件
      this.writeToFile(entry);
    }
  }

  /**
   * 写入本地文件（服务器环境）
   */
  private writeToFile(entry: LogEntry): void {
    try {
      // 在服务器环境中实现文件写入
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        // 确定日志文件路径
        const logDir = path.join(process.cwd(), 'logs');
        const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        
        // 确保日志目录存在
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        // 格式化日志条目
        const logLine = JSON.stringify(entry) + '\n';
        
        // 异步写入文件
        fs.appendFile(logFile, logLine, (err: any) => {
          if (err) {
            console.error('Failed to write log to file:', err);
          }
        });
        
        // 执行日志轮转检查
        this.checkLogRotation(logDir);
      }
    } catch (error) {
      console.error('Error writing log to file:', error);
    }
  }

  /**
   * 发送到远程日志服务（浏览器环境）
   */
  private sendToRemoteLogService(entry: LogEntry): void {
    try {
      // 只在生产环境或配置了远程日志服务时发送
      const remoteLogEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT;
      if (!remoteLogEndpoint) {
        return;
      }

      // 使用 fetch 发送日志到远程服务
      fetch(remoteLogEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          source: 'frontend',
          environment: process.env.NODE_ENV,
        }),
      }).catch((error) => {
        // 静默处理错误，避免日志发送失败影响应用
        console.warn('Failed to send log to remote service:', error);
      });
    } catch (error) {
      console.warn('Error sending log to remote service:', error);
    }
  }

  /**
   * 检查并执行日志轮转
   */
  private checkLogRotation(logDir: string): void {
    try {
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        // 获取日志目录中的所有文件
        const files = fs.readdirSync(logDir);
        const logFiles = files.filter((file: string) => file.endsWith('.log'));
        
        // 如果日志文件超过最大数量，删除最旧的文件
        const maxFiles = typeof loggingConfig.maxFiles === 'number' 
          ? loggingConfig.maxFiles 
          : parseInt(String(loggingConfig.maxFiles), 10) || 30;
        if (logFiles.length > maxFiles) {
          const sortedFiles = logFiles
            .map((file: string) => ({
              name: file,
              path: path.join(logDir, file),
              mtime: fs.statSync(path.join(logDir, file)).mtime,
            }))
            .sort((a: any, b: any) => a.mtime.getTime() - b.mtime.getTime());
          
          // 删除最旧的文件
          const filesToDelete = sortedFiles.slice(0, logFiles.length - maxFiles);
          filesToDelete.forEach((file: any) => {
            fs.unlinkSync(file.path);
          });
        }
        
        // 检查当前日志文件大小
        const currentLogFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        if (fs.existsSync(currentLogFile)) {
          const stats = fs.statSync(currentLogFile);
          const maxSize = this.parseSize(loggingConfig.maxLogSize as string) || 100 * 1024 * 1024; // 默认100MB
          
          if (stats.size > maxSize) {
            // 创建新的日志文件
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archivedFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}-${timestamp}.log`);
            fs.renameSync(currentLogFile, archivedFile);
          }
        }
      }
    } catch (error) {
      console.error('Error during log rotation:', error);
    }
  }

  /**
   * 解析大小字符串（如 "100MB"）
   */
  private parseSize(sizeStr: string): number {
    const units: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };
    
    const match = sizeStr.match(/^(\d+)\s*(B|KB|MB|GB)$/i);
    if (!match) {
      return 0;
    }
    
    const [, size, unit] = match;
    return parseInt(size, 10) * (units[unit.toUpperCase()] || 1);
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
    // 控制台告警
    console.error('🚨 SECURITY ALERT:', event);
    
    // 实现多种告警机制
    this.sendEmailAlert(event);
    this.sendSlackAlert(event);
    this.sendWebhookAlert(event);
  }

  /**
   * 发送邮件告警
   */
  private sendEmailAlert(event: SecurityEvent): void {
    try {
      const alertEmail = process.env.SECURITY_ALERT_EMAIL;
      if (!alertEmail || IS_BROWSER) {
        return;
      }

      // 在服务器环境中发送邮件
      if (typeof require !== 'undefined') {
        // 这里可以集成邮件服务（如 nodemailer）
        const emailData = {
          to: alertEmail,
          subject: `🚨 Security Alert: ${event.eventType}`,
          html: `
            <h2>Security Event Detected</h2>
            <p><strong>Event Type:</strong> ${event.eventType}</p>
            <p><strong>Severity:</strong> ${event.severity}</p>
            <p><strong>Message:</strong> ${event.message}</p>
            <p><strong>Timestamp:</strong> ${event.timestamp}</p>
            <p><strong>Source:</strong> ${event.source}</p>
            <p><strong>Outcome:</strong> ${event.outcome}</p>
            ${event.userId ? `<p><strong>User ID:</strong> ${event.userId}</p>` : ''}
            ${event.ip ? `<p><strong>IP Address:</strong> ${event.ip}</p>` : ''}
            ${event.userAgent ? `<p><strong>User Agent:</strong> ${event.userAgent}</p>` : ''}
            <hr>
            <p><strong>Metadata:</strong></p>
            <pre>${JSON.stringify(event.metadata, null, 2)}</pre>
          `,
        };
        
        // 发送到邮件队列或直接发送
        this.queueEmailAlert(emailData);
      }
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  /**
   * 发送Slack告警
   */
  private sendSlackAlert(event: SecurityEvent): void {
    try {
      const slackWebhook = process.env.SLACK_WEBHOOK_URL;
      if (!slackWebhook) {
        return;
      }

      const slackMessage = {
        text: `🚨 Security Alert: ${event.eventType}`,
        attachments: [
          {
            color: this.getSeverityColor(event.severity),
            fields: [
              {
                title: 'Event Type',
                value: event.eventType,
                short: true,
              },
              {
                title: 'Severity',
                value: event.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Message',
                value: event.message,
                short: false,
              },
              {
                title: 'Timestamp',
                value: event.timestamp,
                short: true,
              },
              {
                title: 'Source',
                value: event.source,
                short: true,
              },
              {
                title: 'Outcome',
                value: event.outcome,
                short: true,
              },
            ],
            footer: 'Security Monitoring System',
            ts: Math.floor(new Date(event.timestamp).getTime() / 1000),
          },
        ],
      };

      // 发送到Slack
      if (IS_BROWSER) {
        // 浏览器环境：通过API发送
        fetch('/api/alerts/slack', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        }).catch((error) => {
          console.warn('Failed to send Slack alert:', error);
        });
      } else {
        // 服务器环境：直接发送
        fetch(slackWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage),
        }).catch((error) => {
          console.error('Failed to send Slack alert:', error);
        });
      }
    } catch (error) {
      console.error('Error sending Slack alert:', error);
    }
  }

  /**
   * 发送Webhook告警
   */
  private sendWebhookAlert(event: SecurityEvent): void {
    try {
      const webhookUrl = process.env.SECURITY_WEBHOOK_URL;
      if (!webhookUrl) {
        return;
      }

      const webhookPayload = {
        type: 'security_alert',
        event,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        application: process.env.APP_NAME || 'unknown',
      };

      // 发送Webhook
      const sendWebhook = () => {
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Security-Alert': 'true',
          },
          body: JSON.stringify(webhookPayload),
        }).catch((error) => {
          console.error('Failed to send webhook alert:', error);
        });
      };

      if (IS_BROWSER) {
        // 浏览器环境：通过API代理发送
        fetch('/api/alerts/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        }).catch((error) => {
          console.warn('Failed to send webhook alert:', error);
        });
      } else {
        // 服务器环境：直接发送
        sendWebhook();
      }
    } catch (error) {
      console.error('Error sending webhook alert:', error);
    }
  }

  /**
   * 获取严重程度对应的颜色
   */
  private getSeverityColor(severity: SecurityEvent['severity']): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'good';
      case 'low':
        return '#36a64f';
      default:
        return '#36a64f';
    }
  }

  /**
   * 将邮件告警加入队列
   */
  private queueEmailAlert(emailData: any): void {
    try {
      // 这里可以集成消息队列（如 Redis、RabbitMQ）
      // 或者直接发送邮件
      console.log('Email alert queued:', emailData.subject);
      
      // 示例：保存到文件系统作为简单队列
      if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const alertsDir = path.join(process.cwd(), 'alerts');
        if (!fs.existsSync(alertsDir)) {
          fs.mkdirSync(alertsDir, { recursive: true });
        }
        
        const alertFile = path.join(alertsDir, `alert-${Date.now()}.json`);
        fs.writeFileSync(alertFile, JSON.stringify(emailData, null, 2));
      }
    } catch (error) {
      console.error('Failed to queue email alert:', error);
    }
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