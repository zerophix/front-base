/**
 * Security Integration test suite
 * 测试安全集成工具的各种功能
 */

jest.mock('../securityManager', () => ({
  securityManager: {
    logSecurityEvent: jest.fn(),
    logAuditEvent: jest.fn(),
    getAuthManager: jest.fn(),
    getSecurityMonitor: jest.fn(),
    validateCsrfToken: jest.fn(),
    destroy: jest.fn(),
  },
  initializeSecurity: jest.fn(),
  getSecurityStatus: jest.fn(),
}));

import {
  initializeAppSecurity,
  handleUserLogin,
  handleDataAccess,
  handleFileUpload,
  handleSuspiciousActivity,
  getSecurityDashboardData,
  createSecurityMiddleware,
  cleanupSecurity,
} from '../securityIntegration';

// Get mocked functions for use in tests
const { securityManager: mockSecurityManager, initializeSecurity: mockInitializeSecurity, getSecurityStatus: mockGetSecurityStatus } = jest.requireMock('../securityManager');

// Mock SecurityEventType
jest.mock('../logger', () => ({
  SecurityEventType: {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILURE: 'login_failure',
    DATA_ACCESS: 'data_access',
    FILE_UPLOAD: 'file_upload',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    CSRF_VIOLATION: 'csrf_violation',
  },
}));

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
};

Object.assign(console, mockConsole);

describe('Security Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeAppSecurity', () => {
    it('should initialize security system successfully', async () => {
      mockInitializeSecurity.mockResolvedValue(undefined);
      mockGetSecurityStatus.mockResolvedValue({
        isInitialized: true,
        status: 'active',
      });

      await initializeAppSecurity();

      expect(mockInitializeSecurity).toHaveBeenCalledWith({
        enableLogging: true,
        enableMonitoring: true,
        enableAuditTrail: true,
        logLevel: 'info',
        monitoringInterval: 60000,
      });
      expect(mockGetSecurityStatus).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith('正在初始化应用安全系统...');
      expect(mockConsole.log).toHaveBeenCalledWith('应用安全系统初始化完成');
    });

    it('should handle initialization failure', async () => {
      const error = new Error('Initialization failed');
      mockInitializeSecurity.mockRejectedValue(error);

      await expect(initializeAppSecurity()).rejects.toThrow('Initialization failed');
      expect(mockConsole.error).toHaveBeenCalledWith('安全系统初始化失败:', error);
    });
  });

  describe('handleUserLogin', () => {
    it('should handle successful login', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);

      await handleUserLogin('testuser', true);

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'login_success',
        'medium',
        '用户 testuser 登录成功',
        expect.objectContaining({
          username: 'testuser',
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          ip: 'unknown',
        })
      );
    });

    it('should handle failed login', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await handleUserLogin('testuser', false);

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'login_failure',
        'high',
        '用户 testuser 登录失败',
        expect.objectContaining({
          username: 'testuser',
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          ip: 'unknown',
        })
      );

      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'login_attempt_failed',
        'user_authentication',
        {
          username: 'testuser',
          reason: 'invalid_credentials',
        }
      );
    });

    it('should handle logging errors gracefully', async () => {
      const error = new Error('Logging failed');
      mockSecurityManager.logSecurityEvent.mockRejectedValue(error);

      await handleUserLogin('testuser', true);

      expect(mockConsole.error).toHaveBeenCalledWith('处理登录安全事件失败:', error);
    });
  });

  describe('handleDataAccess', () => {
    it('should log data access events', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await handleDataAccess('user123', 'document', 'doc456', 'read');

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'data_access',
        'low',
        '用户 user123 访问了 document',
        expect.objectContaining({
          userId: 'user123',
          resourceType: 'document',
          resourceId: 'doc456',
          action: 'read',
          timestamp: expect.any(String),
        })
      );

      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'data_read',
        'document',
        {
          resourceId: 'doc456',
          userId: 'user123',
          action: 'read',
        }
      );
    });

    it('should handle data access logging errors', async () => {
      const error = new Error('Data access logging failed');
      mockSecurityManager.logSecurityEvent.mockRejectedValue(error);

      await handleDataAccess('user123', 'document', 'doc456', 'read');

      expect(mockConsole.error).toHaveBeenCalledWith('处理数据访问安全事件失败:', error);
    });
  });

  describe('handleFileUpload', () => {
    it('should log file upload events', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await handleFileUpload('user123', 'test.pdf', 1024, 'application/pdf');

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'file_upload',
        'medium',
        '用户 user123 上传文件 test.pdf',
        expect.objectContaining({
          userId: 'user123',
          fileName: 'test.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          timestamp: expect.any(String),
        })
      );

      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'file_upload',
        'file_system',
        {
          fileName: 'test.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          userId: 'user123',
        }
      );
    });

    it('should handle file upload logging errors', async () => {
      const error = new Error('File upload logging failed');
      mockSecurityManager.logSecurityEvent.mockRejectedValue(error);

      await handleFileUpload('user123', 'test.pdf', 1024, 'application/pdf');

      expect(mockConsole.error).toHaveBeenCalledWith('处理文件上传安全事件失败:', error);
    });
  });

  describe('handleSuspiciousActivity', () => {
    it('should log low severity suspicious activity', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);

      await handleSuspiciousActivity('Unusual login pattern', 'low', { ip: '192.168.1.1' });

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'suspicious_activity',
        'low',
        'Unusual login pattern',
        expect.objectContaining({
          ip: '192.168.1.1',
          timestamp: expect.any(String),
          detected_by: 'security_monitor',
        })
      );

      expect(mockSecurityManager.logAuditEvent).not.toHaveBeenCalled();
    });

    it('should log high severity suspicious activity with audit event', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await handleSuspiciousActivity('Multiple failed login attempts', 'high', { ip: '192.168.1.1' });

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'suspicious_activity',
        'high',
        'Multiple failed login attempts',
        expect.objectContaining({
          ip: '192.168.1.1',
          timestamp: expect.any(String),
          detected_by: 'security_monitor',
        })
      );

      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'suspicious_activity_detected',
        'security_system',
        {
          description: 'Multiple failed login attempts',
          severity: 'high',
          ip: '192.168.1.1',
        }
      );
    });

    it('should log critical severity suspicious activity with audit event', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await handleSuspiciousActivity('SQL injection attempt', 'critical');

      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'suspicious_activity_detected',
        'security_system',
        {
          description: 'SQL injection attempt',
          severity: 'critical',
        }
      );
    });

    it('should handle suspicious activity logging errors', async () => {
      const error = new Error('Suspicious activity logging failed');
      mockSecurityManager.logSecurityEvent.mockRejectedValue(error);

      await handleSuspiciousActivity('Test activity', 'medium');

      expect(mockConsole.error).toHaveBeenCalledWith('处理可疑活动失败:', error);
    });
  });

  describe('getSecurityDashboardData', () => {
    it('should return security dashboard data', async () => {
      const mockStatus = { isInitialized: true, status: 'active' };
      const mockAuthManager = { isAuthenticated: true };
      const mockSecurityMonitor = { threatsDetected: 0 };

      mockGetSecurityStatus.mockResolvedValue(mockStatus);
      mockSecurityManager.getAuthManager.mockReturnValue(mockAuthManager);
      mockSecurityManager.getSecurityMonitor.mockReturnValue(mockSecurityMonitor);

      const result = await getSecurityDashboardData();

      expect(result).toEqual({
        securityStatus: mockStatus,
        authManager: mockAuthManager,
        securityMonitor: mockSecurityMonitor,
        recommendations: [
          '定期更新密码',
          '启用双因素认证',
          '监控异常登录活动',
          '定期检查权限设置',
        ],
      });
    });

    it('should handle dashboard data retrieval errors', async () => {
      const error = new Error('Dashboard data retrieval failed');
      mockGetSecurityStatus.mockRejectedValue(error);

      await expect(getSecurityDashboardData()).rejects.toThrow('Dashboard data retrieval failed');
      expect(mockConsole.error).toHaveBeenCalledWith('获取安全仪表板数据失败:', error);
    });
  });

  describe('createSecurityMiddleware', () => {
    let middleware: any;
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      middleware = createSecurityMiddleware();
      mockReq = {
        headers: {
          'x-csrf-token': 'valid-token',
          'user-agent': 'test-agent',
        },
        cookies: {
          'csrf-token': 'valid-cookie',
        },
        url: '/api/test',
        method: 'POST',
        ip: '192.168.1.1',
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should validate CSRF token and proceed', async () => {
      mockSecurityManager.validateCsrfToken.mockReturnValue(true);
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await middleware(mockReq, mockRes, mockNext);

      expect(mockSecurityManager.validateCsrfToken).toHaveBeenCalledWith('valid-token', 'valid-cookie');
      expect(mockSecurityManager.logAuditEvent).toHaveBeenCalledWith(
        'api_access',
        'api_endpoint',
        {
          url: '/api/test',
          method: 'POST',
          ip: '192.168.1.1',
          userAgent: 'test-agent',
        }
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid CSRF token', async () => {
      mockSecurityManager.validateCsrfToken.mockReturnValue(false);
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);

      await middleware(mockReq, mockRes, mockNext);

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'csrf_violation',
        'high',
        'CSRF令牌验证失败',
        expect.objectContaining({
          url: '/api/test',
          method: 'POST',
          ip: '192.168.1.1',
          userAgent: 'test-agent',
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'CSRF令牌无效' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should proceed when CSRF tokens are missing', async () => {
      mockReq.headers['x-csrf-token'] = undefined;
      mockReq.cookies['csrf-token'] = undefined;
      mockSecurityManager.logAuditEvent.mockResolvedValue(undefined);

      await middleware(mockReq, mockRes, mockNext);

      expect(mockSecurityManager.validateCsrfToken).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle middleware errors', async () => {
      const error = new Error('Middleware error');
      mockSecurityManager.validateCsrfToken.mockReturnValue(true); // 确保CSRF验证通过
      mockSecurityManager.logAuditEvent.mockRejectedValue(error);

      await middleware(mockReq, mockRes, mockNext);

      expect(mockConsole.error).toHaveBeenCalledWith('安全中间件错误:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: '安全检查失败' });
    });
  });

  describe('cleanupSecurity', () => {
    it('should cleanup security system successfully', () => {
      mockSecurityManager.destroy.mockImplementation(() => {});

      cleanupSecurity();

      expect(mockSecurityManager.destroy).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith('安全系统已清理');
    });

    it('should handle cleanup errors', () => {
      const error = new Error('Cleanup failed');
      mockSecurityManager.destroy.mockImplementation(() => {
        throw error;
      });

      cleanupSecurity();

      expect(mockConsole.error).toHaveBeenCalledWith('安全系统清理失败:', error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing metadata in handleSuspiciousActivity', async () => {
      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);

      await handleSuspiciousActivity('Test activity', 'medium');

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'suspicious_activity',
        'medium',
        'Test activity',
        expect.objectContaining({
          timestamp: expect.any(String),
          detected_by: 'security_monitor',
        })
      );
    });

    it('should handle window object not available in server environment', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      mockSecurityManager.logSecurityEvent.mockResolvedValue(undefined);

      await handleUserLogin('testuser', true);

      expect(mockSecurityManager.logSecurityEvent).toHaveBeenCalledWith(
        'login_success',
        'medium',
        '用户 testuser 登录成功',
        expect.objectContaining({
          userAgent: 'server',
        })
      );

      // Restore window object
      if (originalWindow) {
        (global as any).window = originalWindow;
      }
    });
  });
});