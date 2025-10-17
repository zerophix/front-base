// Mock dependencies first
jest.mock('../auth', () => ({
  authManager: {
    getAuthState: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
  isAuthenticated: jest.fn(),
}));

jest.mock('../security', () => ({
  initCsrfProtection: jest.fn(),
  validateCsrfToken: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  securityLogger: {
    logSecurityEvent: jest.fn(),
    logAuditEvent: jest.fn(),
  },
  auditLogger: {
    logResourceAccess: jest.fn(),
  },
  SecurityEventType: {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILURE: 'login_failure',
    SECURITY_VIOLATION: 'security_violation',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  },
}));

jest.mock('../monitoring', () => ({
  securityMonitor: {
    threatsDetected: 0,
    isActive: true,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    getCurrentThreatLevel: jest.fn(),
  },
}));

jest.mock('../encryption', () => ({
  validateEnvironmentSecurity: jest.fn(),
}));

// Mock setInterval
const mockSetInterval = jest.fn();
(global as any).setInterval = mockSetInterval;

// Import after mocking
import {
  SecurityManager,
  securityManager,
  initializeSecurity,
  getSecurityStatus,
  logSecurityEvent,
  logAuditEvent,
  SecurityManagerConfig,
  SecurityStatus,
} from '../securityManager';
import { SecurityEventType } from '../logger';

// Get mocked dependencies
const { authManager, isAuthenticated } = require('../auth');
const { initCsrfProtection, validateCsrfToken } = require('../security');
const { logger, securityLogger, auditLogger } = require('../logger');
const { securityMonitor } = require('../monitoring');
const { validateEnvironmentSecurity } = require('../encryption');

describe('SecurityManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset singleton instance
    (SecurityManager as any).instance = undefined;
    
    // Setup default mocks
    isAuthenticated.mockResolvedValue(true);
    authManager.getAuthState.mockReturnValue({ user: { id: 'test-user' } });
    validateEnvironmentSecurity.mockReturnValue({ valid: true, issues: [] });
    initCsrfProtection.mockResolvedValue(true);
    validateCsrfToken.mockReturnValue(true);
    securityMonitor.startMonitoring.mockResolvedValue(undefined);
    mockSetInterval.mockImplementation((fn, interval) => {
      return setTimeout(fn, interval);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SecurityManager.getInstance();
      const instance2 = SecurityManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export the same instance as securityManager', () => {
      const instance = SecurityManager.getInstance();
      expect(securityManager).toBeInstanceOf(SecurityManager);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid environment', async () => {
      const manager = SecurityManager.getInstance();
      await manager.initialize();

      expect(validateEnvironmentSecurity).toHaveBeenCalled();
      expect(initCsrfProtection).toHaveBeenCalled();
      expect(mockSetInterval).toHaveBeenCalled();
    });

    it('should handle environment validation failure', async () => {
      validateEnvironmentSecurity.mockReturnValue({ 
        valid: false, 
        issues: ['Invalid environment', 'Missing security headers'] 
      });

      const manager = SecurityManager.getInstance();
      
      // The initialize method should throw when environment validation fails
      await expect(manager.initialize()).rejects.toThrow('环境安全验证失败: Invalid environment');

      expect(logger.error).toHaveBeenCalledWith(
        '安全系统初始化失败',
        expect.any(Error)
      );
    });

    it('should handle CSRF protection initialization failure', async () => {
      initCsrfProtection.mockImplementation(() => {
        throw new Error('CSRF init failed');
      });

      const manager = SecurityManager.getInstance();
      
      // The initialize method should throw when CSRF initialization fails
      await expect(manager.initialize()).rejects.toThrow('CSRF init failed');

      expect(logger.error).toHaveBeenCalledWith(
        '安全系统初始化失败',
        expect.any(Error)
      );
    });

    it('should handle authentication system initialization failure', async () => {
      isAuthenticated.mockImplementation(() => {
        throw new Error('Auth init failed');
      });

      const manager = SecurityManager.getInstance();
      
      // The initialize method should throw when authentication initialization fails
      await expect(manager.initialize()).rejects.toThrow('Auth init failed');

      expect(logger.error).toHaveBeenCalledWith(
        '认证系统初始化失败',
        expect.any(Error)
      );
    });
  });

  describe('Security Status', () => {
    it('should return security status with low threat level', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.2);
      isAuthenticated.mockResolvedValue(true);

      const manager = SecurityManager.getInstance();
      await manager.initialize();
      const status = await manager.getSecurityStatus();

      expect(status.securityLevel).toBe('low');
      expect(status.authStatus).toBe('authenticated');
      expect(status.isInitialized).toBe(true);
    });

    it('should return security status with medium threat level', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.8); // 0.8 * 0.5 = 0.4, which is >= 0.3 and < 0.6 (medium)
      isAuthenticated.mockReturnValue(true);

      const manager = SecurityManager.getInstance();
      await manager.initialize();
      const status = await manager.getSecurityStatus();

      expect(status.securityLevel).toBe('medium');
      expect(status.authStatus).toBe('authenticated');
      expect(status.isInitialized).toBe(true);
    });

    it('should return security status with unauthenticated user', async () => {
      isAuthenticated.mockReturnValue(false);

      const manager = SecurityManager.getInstance();
      const status = await manager.getSecurityStatus();

      expect(status.authStatus).toBe('unauthenticated');
    });
  });

  describe('High Threat Level Handling', () => {
    it('should handle high threat level in performSecurityCheck', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(1.6);
      
      const manager = SecurityManager.getInstance();
      await (manager as any).performSecurityCheck();
      
      expect(securityLogger.logSecurityEvent).toHaveBeenCalledWith(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        expect.stringContaining('检测到高威胁级别'),
        'critical',
        'blocked',
        expect.objectContaining({
          threatLevel: 0.8,
          timestamp: expect.any(String)
        })
      );
    });

    it('should return critical security level for threat level >= 0.8', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(1.6);
      
      const manager = SecurityManager.getInstance();
      await manager.initialize();
      const status = await manager.getSecurityStatus();
      
      expect(status.securityLevel).toBe('critical');
    });

    it('should return high security level for threat level between 0.6-0.8', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(1.4);
      
      const manager = SecurityManager.getInstance();
      await manager.initialize();
      const status = await manager.getSecurityStatus();
      
      expect(status.securityLevel).toBe('high');
    });
  });

  describe('Authentication Failure Scenarios', () => {
    it('should handle authentication check failure in initializeAuthentication', async () => {
      const authError = new Error('Auth service unavailable');
      isAuthenticated.mockImplementation(() => {
        throw authError;
      });

      const manager = SecurityManager.getInstance();
      
      // The initialize method should throw when authentication fails
      await expect(manager.initialize()).rejects.toThrow('Auth service unavailable');

      expect(logger.error).toHaveBeenCalledWith(
        '认证系统初始化失败',
        expect.any(Error)
      );
    });

    it('should handle authentication state retrieval failure', async () => {
      const authError = new Error('Cannot retrieve auth state');
      isAuthenticated.mockImplementation(() => {
        throw authError;
      });

      const manager = SecurityManager.getInstance();
      const status = await manager.getSecurityStatus();

      expect(status.authStatus).toBe('unauthenticated');
      expect(logger.error).toHaveBeenCalledWith(
        '检查认证状态失败',
        authError
      );
    });

    it('should handle performSecurityCheck authentication errors', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.4);
      const authError = new Error('Auth check failed');
      isAuthenticated.mockImplementation(() => {
        throw authError;
      });
      
      const mockLoggerError = jest.spyOn(logger, 'error');

      const manager = SecurityManager.getInstance();
      await (manager as any).performSecurityCheck();

      expect(mockLoggerError).toHaveBeenCalledWith(
        '检查认证状态失败',
        expect.any(Error)
      );
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', async () => {
      const manager = SecurityManager.getInstance();
      
      await manager.logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS, 
        'medium', 
        'User login successful'
      );
      
      expect(securityLogger.logSecurityEvent).toHaveBeenCalledWith(
        SecurityEventType.LOGIN_SUCCESS,
        'User login successful',
        'medium',
        'success',
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should log audit events', async () => {
      const manager = SecurityManager.getInstance();
      
      await manager.logAuditEvent('file_access', 'document.pdf');
      
      expect(auditLogger.logResourceAccess).toHaveBeenCalledWith(
        'document.pdf',
        'unknown',
        'file_access',
        'test-user',
        undefined
      );
    });
  });

  describe('CSRF Token Validation', () => {
    it('should validate CSRF token successfully', () => {
      const manager = SecurityManager.getInstance();
      const result = manager.validateCsrfToken('valid-token', 'valid-cookie');
      
      expect(validateCsrfToken).toHaveBeenCalledWith('valid-token', 'valid-cookie');
      expect(result).toBe(true);
    });

    it('should reject invalid CSRF token', () => {
      validateCsrfToken.mockReturnValue(false);
      
      const manager = SecurityManager.getInstance();
      const result = manager.validateCsrfToken('invalid-token', 'valid-cookie');
      
      expect(result).toBe(false);
    });
  });

  describe('Manager Access', () => {
    it('should return auth manager', () => {
      const manager = SecurityManager.getInstance();
      const result = manager.getAuthManager();
      
      expect(result).toBe(authManager);
    });

    it('should return security monitor', () => {
      const manager = SecurityManager.getInstance();
      const result = manager.getSecurityMonitor();
      
      expect(result).toBe(securityMonitor);
    });
  });

  describe('Cleanup', () => {
    it('should destroy manager instance', () => {
      const manager = SecurityManager.getInstance();
      
      expect(() => manager.destroy()).not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('安全管理器已销毁');
    });
  });

  describe('Exported Functions', () => {
    it('should initialize security through exported function', async () => {
      const config: SecurityManagerConfig = { enableLogging: true };
      
      await initializeSecurity(config);
      
      expect(validateEnvironmentSecurity).toHaveBeenCalled();
    });

    it('should get security status through exported function', async () => {
      const status = await getSecurityStatus();
      
      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('authStatus');
    });

    it('should log security event through exported function', async () => {
      await logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, 'low', 'Test event');
      
      expect(securityLogger.logSecurityEvent).toHaveBeenCalled();
    });

    it('should log audit event through exported function', async () => {
      await logAuditEvent('test_action', 'test_resource');
      
      expect(auditLogger.logResourceAccess).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle authentication check error', async () => {
      isAuthenticated.mockImplementation(() => {
        throw new Error('Auth check failed');
      });

      const manager = SecurityManager.getInstance();
      const status = await manager.getSecurityStatus();

      expect(status.authStatus).toBe('unauthenticated');
      expect(logger.error).toHaveBeenCalledWith(
        '检查认证状态失败',
        expect.any(Error)
      );
    });

    it('should handle getCurrentUserId with valid user', async () => {
      authManager.getAuthState.mockReturnValue({
        user: { id: 'user123' }
      });

      const manager = SecurityManager.getInstance();
      await manager.logAuditEvent('test', 'resource');

      expect(auditLogger.logResourceAccess).toHaveBeenCalledWith(
        'resource',
        'unknown',
        'test',
        'user123',
        undefined
      );
    });

    it('should handle getCurrentUserId with auth error', async () => {
      authManager.getAuthState.mockImplementation(() => {
        throw new Error('Auth state error');
      });

      const manager = SecurityManager.getInstance();
      await manager.logAuditEvent('test', 'resource');

      expect(auditLogger.logResourceAccess).toHaveBeenCalledWith(
        'resource',
        'unknown',
        'test',
        undefined,
        undefined
      );
    });

    it('should handle performSecurityCheck with non-Error exception', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.4);
      isAuthenticated.mockImplementation(() => {
        throw 'String error';
      });

      const mockLoggerError = jest.spyOn(logger, 'error');

      const manager = SecurityManager.getInstance();
      await (manager as any).performSecurityCheck();

      expect(mockLoggerError).toHaveBeenCalledWith(
        '检查认证状态失败',
        expect.any(Error)
      );
    });

    it('should handle destroy when not initialized', () => {
      const manager = SecurityManager.getInstance();
      
      expect(() => manager.destroy()).not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('安全管理器已销毁');
    });

    it('should handle multiple getInstance calls with different configs', () => {
      const config1: SecurityManagerConfig = { enableLogging: true };
      const config2: SecurityManagerConfig = { enableMonitoring: true };

      const instance1 = SecurityManager.getInstance(config1);
      const instance2 = SecurityManager.getInstance(config2);

      expect(instance1).toBe(instance2);
    });

    it('should handle logSecurityEvent with metadata', async () => {
      const manager = SecurityManager.getInstance();
      const metadata = { userId: 'test123', action: 'login' };
      
      await manager.logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS, 
        'medium', 
        'User login successful',
        metadata
      );
      
      expect(securityLogger.logSecurityEvent).toHaveBeenCalledWith(
        SecurityEventType.LOGIN_SUCCESS,
        'User login successful',
        'medium',
        'success',
        expect.objectContaining({
          ...metadata,
          timestamp: expect.any(String)
        })
      );
    });

    it('should handle logAuditEvent with metadata', async () => {
      const manager = SecurityManager.getInstance();
      const metadata = { fileSize: 1024, operation: 'read' };
      
      await manager.logAuditEvent('file_access', 'document.pdf', metadata);
      
      expect(auditLogger.logResourceAccess).toHaveBeenCalledWith(
        'document.pdf',
        'unknown',
        'file_access',
        'test-user',
        metadata
      );
    });
  });
});