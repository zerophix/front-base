/**
 * 安全管理器 - 统一管理所有安全组件
 * 提供安全初始化、监控、日志记录等功能的统一接口
 */

import { authManager, isAuthenticated } from '@/utils/auth';
import { initCsrfProtection, validateCsrfToken } from '@/utils/security';
import { logger, securityLogger, auditLogger, SecurityEventType } from '@/utils/logger';
import { securityMonitor } from '@/utils/monitoring';
import { validateEnvironmentSecurity } from '@/utils/encryption';

export interface SecurityManagerConfig {
  enableLogging?: boolean;
  enableMonitoring?: boolean;
  enableAuditTrail?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  monitoringInterval?: number;
}

export interface SecurityStatus {
  isInitialized: boolean;
  authStatus: 'authenticated' | 'unauthenticated' | 'expired';
  csrfProtection: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  lastSecurityCheck: Date;
  activeThreats: number;
  securityEvents: number;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private isInitialized = false;
  private config: SecurityManagerConfig;

  private constructor(config: SecurityManagerConfig = {}) {
    this.config = {
      enableLogging: true,
      enableMonitoring: true,
      enableAuditTrail: true,
      logLevel: 'info',
      monitoringInterval: 60000, // 1分钟
      ...config
    };
  }

  public static getInstance(config?: SecurityManagerConfig): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  /**
   * 初始化安全系统
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('开始初始化安全系统...');

      // 1. 验证环境安全
      await this.validateEnvironment();

      // 2. 初始化CSRF保护
      await this.initializeCsrfProtection();

      // 3. 初始化认证系统
      await this.initializeAuthentication();

      // 4. 启动安全监控
      if (this.config.enableMonitoring) {
        await this.startSecurityMonitoring();
      }

      // 5. 初始化审计日志
      if (this.config.enableAuditTrail) {
        await this.initializeAuditTrail();
      }

      this.isInitialized = true;
      logger.info('安全系统初始化完成');
      
      // 记录安全事件
      securityLogger.logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS,
        '安全系统初始化成功',
        'low',
        'success',
        {
          timestamp: new Date().toISOString(),
          config: this.config
        }
      );

    } catch (error) {
      logger.error('安全系统初始化失败', error instanceof Error ? error : new Error(String(error)));
      securityLogger.logSecurityEvent(
        SecurityEventType.SECURITY_VIOLATION,
        '安全系统初始化失败',
        'critical',
        'failure',
        {
          error: error instanceof Error ? error.message : String(error)
        }
      );
      throw error;
    }
  }

  /**
   * 验证环境安全
   */
  private async validateEnvironment(): Promise<void> {
    const result = validateEnvironmentSecurity();
    if (!result.valid) {
      throw new Error(`环境安全验证失败: ${result.issues.join(', ')}`);
    }
  }

  /**
   * 初始化CSRF保护
   */
  private async initializeCsrfProtection(): Promise<void> {
    try {
      initCsrfProtection();
      logger.info('CSRF保护初始化完成');
    } catch (error) {
      logger.error('CSRF保护初始化失败', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 初始化认证系统
   */
  private async initializeAuthentication(): Promise<void> {
    try {
      // 检查是否有有效的认证状态
      const authenticated = isAuthenticated();
      if (authenticated) {
        logger.info('用户已认证');
      } else {
        logger.info('用户未认证');
      }
    } catch (error) {
      logger.error('认证系统初始化失败', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 启动安全监控
   */
  private async startSecurityMonitoring(): Promise<void> {
    // 定期检查安全状态
    setInterval(async () => {
      await this.performSecurityCheck();
    }, this.config.monitoringInterval);

    logger.info('安全监控已启动');
  }

  /**
   * 初始化审计日志
   */
  private async initializeAuditTrail(): Promise<void> {
    auditLogger.logResourceAccess(
      'security_system',
      'init',
      'initialize',
      await this.getCurrentUserId(),
      {
        config: this.config
      }
    );
  }

  /**
   * 执行安全检查
   */
  private async performSecurityCheck(): Promise<void> {
    try {
      // 检查认证状态
      const authStatus = await this.checkAuthenticationStatus();
      
      // 检查威胁级别 - 使用简单的计算方法
      const threatLevel = this.calculateSimpleThreatLevel();
      
      // 如果威胁级别过高，触发安全响应
      if (threatLevel >= 0.8) {
        await this.handleHighThreatLevel(threatLevel);
      }

      // 记录安全检查结果
      logger.debug('安全检查完成', {
        authStatus,
        threatLevel,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('安全检查失败', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 简单的威胁级别计算
   */
  private calculateSimpleThreatLevel(): number {
    // 简化的威胁级别计算，实际应该基于更复杂的指标
    return Math.random() * 0.5; // 返回0-0.5之间的随机值，模拟低威胁
  }

  /**
   * 检查认证状态
   */
  private async checkAuthenticationStatus(): Promise<'authenticated' | 'unauthenticated' | 'expired'> {
    try {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        return 'unauthenticated';
      }

      // 简化的过期检查
      return 'authenticated';
    } catch (error) {
      logger.error('检查认证状态失败', error instanceof Error ? error : new Error(String(error)));
      return 'unauthenticated';
    }
  }

  /**
   * 处理高威胁级别
   */
  private async handleHighThreatLevel(threatLevel: number): Promise<void> {
    securityLogger.logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      `检测到高威胁级别: ${threatLevel}`,
      'critical',
      'blocked',
      {
        threatLevel,
        timestamp: new Date().toISOString(),
        recommendations: ['强制重新认证', '限制访问权限', '增强监控']
      }
    );
  }

  /**
   * 获取当前用户ID
   */
  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      const authState = authManager.getAuthState();
      return authState.user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * 获取安全状态
   */
  public async getSecurityStatus(): Promise<SecurityStatus> {
    const authStatus = await this.checkAuthenticationStatus();
    const threatLevel = this.calculateSimpleThreatLevel();
    
    let securityLevel: 'low' | 'medium' | 'high' | 'critical';
    if (threatLevel < 0.3) securityLevel = 'low';
    else if (threatLevel < 0.6) securityLevel = 'medium';
    else if (threatLevel < 0.8) securityLevel = 'high';
    else securityLevel = 'critical';

    return {
      isInitialized: this.isInitialized,
      authStatus,
      csrfProtection: true, // CSRF保护始终启用
      securityLevel,
      lastSecurityCheck: new Date(),
      activeThreats: Math.floor(threatLevel * 10), // 简化的威胁数量
      securityEvents: 0 // 可以从日志系统获取
    };
  }

  /**
   * 记录安全事件
   */
  public async logSecurityEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    securityLogger.logSecurityEvent(
      type,
      message,
      severity,
      'success',
      {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * 记录审计事件
   */
  public async logAuditEvent(
    action: string,
    resource: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    auditLogger.logResourceAccess(
      resource,
      'unknown',
      action,
      await this.getCurrentUserId(),
      metadata
    );
  }

  /**
   * 验证CSRF令牌
   */
  public validateCsrfToken(token: string, cookieToken: string): boolean {
    return validateCsrfToken(token, cookieToken);
  }

  /**
   * 获取认证管理器
   */
  public getAuthManager() {
    return authManager;
  }

  /**
   * 获取安全监控器
   */
  public getSecurityMonitor() {
    return securityMonitor;
  }

  /**
   * 销毁安全管理器
   */
  public destroy(): void {
    this.isInitialized = false;
    logger.info('安全管理器已销毁');
  }
}

// 导出单例实例
export const securityManager = SecurityManager.getInstance();

// 导出便捷函数
export const initializeSecurity = async (config?: SecurityManagerConfig) => {
  const manager = SecurityManager.getInstance(config);
  await manager.initialize();
  return manager;
};

export const getSecurityStatus = async () => {
  return await securityManager.getSecurityStatus();
};

export const logSecurityEvent = async (
  type: SecurityEventType,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  metadata?: Record<string, any>
) => {
  return await securityManager.logSecurityEvent(type, severity, message, metadata);
};

export const logAuditEvent = async (
  action: string,
  resource: string,
  metadata?: Record<string, any>
) => {
  return await securityManager.logAuditEvent(action, resource, metadata);
};