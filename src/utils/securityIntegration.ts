/**
 * 安全集成示例
 * 展示如何在应用中集成和使用安全管理器
 */

import { securityManager, initializeSecurity, getSecurityStatus } from '@/utils/securityManager';
import { SecurityEventType } from '@/utils/logger';

/**
 * 应用启动时的安全初始化
 */
export async function initializeAppSecurity(): Promise<void> {
  try {
    console.log('正在初始化应用安全系统...');
    
    // 初始化安全管理器
    await initializeSecurity({
      enableLogging: true,
      enableMonitoring: true,
      enableAuditTrail: true,
      logLevel: 'info',
      monitoringInterval: 60000 // 1分钟检查一次
    });

    // 获取并显示安全状态
    const status = await getSecurityStatus();
    console.log('安全系统状态:', status);

    console.log('应用安全系统初始化完成');
  } catch (error) {
    console.error('安全系统初始化失败:', error);
    throw error;
  }
}

/**
 * 用户登录时的安全处理
 */
export async function handleUserLogin(username: string, success: boolean): Promise<void> {
  try {
    // 记录登录事件
    await securityManager.logSecurityEvent(
      success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      success ? 'medium' : 'high',
      `用户 ${username} ${success ? '登录成功' : '登录失败'}`,
      {
        username,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        ip: 'unknown' // 实际应用中应该获取真实IP
      }
    );

    // 如果登录失败，记录审计事件
    if (!success) {
      await securityManager.logAuditEvent(
        'login_attempt_failed',
        'user_authentication',
        {
          username,
          reason: 'invalid_credentials'
        }
      );
    }
  } catch (error) {
    console.error('处理登录安全事件失败:', error);
  }
}

/**
 * 数据访问时的安全处理
 */
export async function handleDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<void> {
  try {
    // 记录数据访问事件
    await securityManager.logSecurityEvent(
      SecurityEventType.DATA_ACCESS,
      'low',
      `用户 ${userId} 访问了 ${resourceType}`,
      {
        userId,
        resourceType,
        resourceId,
        action,
        timestamp: new Date().toISOString()
      }
    );

    // 记录审计事件
    await securityManager.logAuditEvent(
      `data_${action}`,
      resourceType,
      {
        resourceId,
        userId,
        action
      }
    );
  } catch (error) {
    console.error('处理数据访问安全事件失败:', error);
  }
}

/**
 * 文件上传时的安全处理
 */
export async function handleFileUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string
): Promise<void> {
  try {
    // 记录文件上传事件
    await securityManager.logSecurityEvent(
      SecurityEventType.FILE_UPLOAD,
      'medium',
      `用户 ${userId} 上传文件 ${fileName}`,
      {
        userId,
        fileName,
        fileSize,
        fileType,
        timestamp: new Date().toISOString()
      }
    );

    // 记录审计事件
    await securityManager.logAuditEvent(
      'file_upload',
      'file_system',
      {
        fileName,
        fileSize,
        fileType,
        userId
      }
    );
  } catch (error) {
    console.error('处理文件上传安全事件失败:', error);
  }
}

/**
 * 检测可疑活动
 */
export async function handleSuspiciousActivity(
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // 记录可疑活动
    await securityManager.logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity,
      description,
      {
        ...metadata,
        timestamp: new Date().toISOString(),
        detected_by: 'security_monitor'
      }
    );

    // 如果是高危活动，记录审计事件
    if (severity === 'high' || severity === 'critical') {
      await securityManager.logAuditEvent(
        'suspicious_activity_detected',
        'security_system',
        {
          description,
          severity,
          ...metadata
        }
      );
    }
  } catch (error) {
    console.error('处理可疑活动失败:', error);
  }
}

/**
 * 获取安全仪表板数据
 */
export async function getSecurityDashboardData() {
  try {
    const status = await getSecurityStatus();
    
    return {
      securityStatus: status,
      authManager: securityManager.getAuthManager(),
      securityMonitor: securityManager.getSecurityMonitor(),
      recommendations: [
        '定期更新密码',
        '启用双因素认证',
        '监控异常登录活动',
        '定期检查权限设置'
      ]
    };
  } catch (error) {
    console.error('获取安全仪表板数据失败:', error);
    throw error;
  }
}

/**
 * 安全中间件示例（用于API路由）
 */
export function createSecurityMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      // 验证CSRF令牌
      const csrfToken = req.headers['x-csrf-token'];
      const csrfCookie = req.cookies['csrf-token'];
      
      if (csrfToken && csrfCookie) {
        const isValidCsrf = securityManager.validateCsrfToken(csrfToken, csrfCookie);
        if (!isValidCsrf) {
          await securityManager.logSecurityEvent(
            SecurityEventType.CSRF_VIOLATION,
            'high',
            'CSRF令牌验证失败',
            {
              url: req.url,
              method: req.method,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            }
          );
          return res.status(403).json({ error: 'CSRF令牌无效' });
        }
      }

      // 记录API访问
      await securityManager.logAuditEvent(
        'api_access',
        'api_endpoint',
        {
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      next();
    } catch (error) {
      console.error('安全中间件错误:', error);
      res.status(500).json({ error: '安全检查失败' });
    }
  };
}

/**
 * 应用关闭时的安全清理
 */
export function cleanupSecurity(): void {
  try {
    securityManager.destroy();
    console.log('安全系统已清理');
  } catch (error) {
    console.error('安全系统清理失败:', error);
  }
}

// 导出便捷函数
export {
  securityManager,
  initializeSecurity,
  getSecurityStatus
};