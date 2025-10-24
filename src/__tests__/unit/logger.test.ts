/**
 * Logger 模块测试
 */

import {
  Logger,
  SecurityLogger,
  AuditLogger,
  LogLevel,
  SecurityEventType,
  LogEntry,
  SecurityEvent,
  AuditLog,
  logger,
  securityLogger,
  auditLogger,
  logError,
  logWarn,
  logInfo,
  logDebug,
} from '../../utils/logger';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock loggingConfig
jest.mock('../../config/security', () => ({
  loggingConfig: {
    sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization'],
    enableConsoleOutput: true,
    enableFileOutput: false,
    logLevel: 'info',
  },
}));

describe('Logger', () => {
  let loggerInstance: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    // Replace console methods
    Object.assign(console, mockConsole);
    loggerInstance = Logger.getInstance();
    loggerInstance.clearContext();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Context Management', () => {
    it('should set context', () => {
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        ip: '192.168.1.1',
      };

      loggerInstance.setContext(context);
      loggerInstance.info('Test message');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.objectContaining({
          userId: 'user123',
          sessionId: 'session456',
          ip: '192.168.1.1',
        })
      );
    });

    it('should clear context', () => {
      loggerInstance.setContext({ userId: 'user123' });
      loggerInstance.clearContext();
      loggerInstance.info('Test message');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.objectContaining({
          userId: undefined,
        })
      );
    });
  });

  describe('Log Levels', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      loggerInstance.error('Error message', error, { extra: 'data' });

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        expect.objectContaining({
          extra: 'data'
        }),
        error
      );
    });

    it('should log warning messages', () => {
      loggerInstance.warn('Warning message', { extra: 'data' });

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
        expect.objectContaining({
          extra: 'data'
        })
      );
    });

    it('should log info messages', () => {
      loggerInstance.info('Info message', { extra: 'data' });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Info message'),
        expect.objectContaining({
          extra: 'data'
        })
      );
    });

    it('should log debug messages', () => {
      loggerInstance.debug('Debug message', { extra: 'data' });

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('Debug message'),
        expect.objectContaining({
          extra: 'data'
        })
      );
    });
  });

  describe('Sensitive Data Sanitization', () => {
    it('should sanitize sensitive fields in metadata', () => {
      loggerInstance.info('Test message', {
        username: 'john',
        password: 'secret123',
        token: 'abc123',
        normalField: 'value',
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.objectContaining({
          username: 'john',
          password: 'se*****23',
          token: 'ab**23',
          normalField: 'value',
        })
      );
    });
  });
});

describe('SecurityLogger', () => {
  let securityLoggerInstance: SecurityLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
    securityLoggerInstance = SecurityLogger.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SecurityLogger.getInstance();
      const instance2 = SecurityLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', () => {
      securityLoggerInstance.logSecurityEvent(
        SecurityEventType.LOGIN_SUCCESS,
        'User logged in successfully',
        'low',
        'success',
        { userId: 'user123' }
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('User logged in successfully'),
        expect.objectContaining({
          eventType: 'login_success',
          severity: 'low',
          outcome: 'success',
          userId: 'user123',
        })
      );
    });

    it('should log login events', () => {
      securityLoggerInstance.logLogin(true, 'user123', { ip: '192.168.1.1' });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('User login successful'),
        expect.objectContaining({
          eventType: 'login_success',
          severity: 'low',
          outcome: 'success',
          ip: '192.168.1.1',
          userId: 'user123'
        })
      );
    });

    it('should log failed login events', () => {
      securityLoggerInstance.logLogin(false, undefined, { ip: '192.168.1.1' });

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('User login failed'),
        expect.objectContaining({
          eventType: 'login_failure',
          severity: 'medium',
          outcome: 'failure',
          ip: '192.168.1.1',
          userId: undefined
        })
      );
    });

    it('should log unauthorized access', () => {
      securityLoggerInstance.logUnauthorizedAccess('/admin', 'user123');

      // 期望console.error被调用两次：一次是正常日志，一次是告警
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
      
      // 第一次调用：正常的错误日志
      expect(mockConsole.error).toHaveBeenNthCalledWith(1,
        expect.stringContaining('Unauthorized access attempt to /admin'),
        expect.objectContaining({
          resource: '/admin',
          eventType: 'unauthorized_access',
          severity: 'high',
          outcome: 'blocked',
        }),
        undefined
      );
      
      // 第二次调用：安全告警
      expect(mockConsole.error).toHaveBeenNthCalledWith(2,
        '🚨 SECURITY ALERT:',
        expect.objectContaining({
          eventType: 'unauthorized_access',
          severity: 'high',
          outcome: 'blocked',
          message: 'Unauthorized access attempt to /admin'
        })
      );
    });

    it('should log security violations', () => {
      securityLoggerInstance.logSecurityViolation('CSRF', 'Invalid token', {
        token: 'invalid',
      });

      // 期望console.error被调用两次：一次是正常日志，一次是告警
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
      
      // 第一次调用：正常的错误日志
      expect(mockConsole.error).toHaveBeenNthCalledWith(1,
        expect.stringContaining('Security violation detected: CSRF - Invalid token'),
        expect.objectContaining({
          violationType: 'CSRF',
          details: 'Invalid token',
          eventType: 'security_violation',
          severity: 'high',
          outcome: 'blocked',
          token: 'in***id'
        }),
        undefined
      );
      
      // 第二次调用：安全告警
      expect(mockConsole.error).toHaveBeenNthCalledWith(2,
        '🚨 SECURITY ALERT:',
        expect.objectContaining({
          eventType: 'security_violation',
          severity: 'high',
          outcome: 'blocked',
          message: 'Security violation detected: CSRF - Invalid token'
        })
      );
    });

    it('should log suspicious activity', () => {
      securityLoggerInstance.logSuspiciousActivity('Multiple failed logins', 85);

      // 期望console.error被调用两次：一次是正常日志，一次是告警
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
      
      // 第一次调用：正常的错误日志
      expect(mockConsole.error).toHaveBeenNthCalledWith(1,
        expect.stringContaining('Suspicious activity detected: Multiple failed logins'),
        expect.objectContaining({
          activity: 'Multiple failed logins',
          eventType: 'suspicious_activity',
          severity: 'critical',
          outcome: 'blocked',
          riskScore: 85,
        }),
        undefined
      );
      
      // 第二次调用：安全告警
      expect(mockConsole.error).toHaveBeenNthCalledWith(2,
        '🚨 SECURITY ALERT:',
        expect.objectContaining({
          eventType: 'suspicious_activity',
          severity: 'critical',
          outcome: 'blocked',
          message: 'Suspicious activity detected: Multiple failed logins'
        })
      );
    });
  });
});

describe('AuditLogger', () => {
  let auditLoggerInstance: AuditLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
    auditLoggerInstance = AuditLogger.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuditLogger.getInstance();
      const instance2 = AuditLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Audit Logging', () => {
    it('should log data changes', () => {
      const oldValue = { name: 'John', age: 30 };
      const newValue = { name: 'John Doe', age: 31 };

      auditLoggerInstance.logDataChange(
        'update',
        'user',
        'user123',
        oldValue,
        newValue,
        'admin456'
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] Data update on user'),
        expect.objectContaining({
          action: 'update',
          resource: 'user',
          resourceId: 'user123',
          changes: {
            name: { from: 'John', to: 'John Doe' },
            age: { from: 30, to: 31 },
          },
        })
      );
    });

    it('should log resource access', () => {
      auditLoggerInstance.logResourceAccess(
        'user',
        'user123',
        'read',
        'admin456',
        { reason: 'user profile view' }
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT] Resource access: read on user'),
        expect.objectContaining({
          action: 'read',
          resource: 'user',
          resourceId: 'user123',
          userId: 'admin456',
          reason: 'user profile view',
        })
      );
    });
  });
});

describe('Exported Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  it('should export logger instances', () => {
    expect(logger).toBeInstanceOf(Logger);
    expect(securityLogger).toBeInstanceOf(SecurityLogger);
    expect(auditLogger).toBeInstanceOf(AuditLogger);
  });

  it('should export convenience functions', () => {
    logError('Error message');
    expect(mockConsole.error).toHaveBeenCalled();

    logWarn('Warning message');
    expect(mockConsole.warn).toHaveBeenCalled();

    logInfo('Info message');
    expect(mockConsole.info).toHaveBeenCalled();

    logDebug('Debug message');
    expect(mockConsole.debug).toHaveBeenCalled();
  });
});

describe('Log Entry Interfaces', () => {
  it('should have correct LogEntry structure', () => {
    const logEntry: LogEntry = {
      timestamp: '2023-01-01T00:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Test message',
      category: 'test',
      userId: 'user123',
      sessionId: 'session456',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      url: '/test',
      method: 'GET',
      statusCode: 200,
      duration: 100,
      metadata: { key: 'value' },
      stackTrace: 'Error stack trace',
    };

    expect(logEntry).toBeDefined();
    expect(logEntry.level).toBe(LogLevel.INFO);
  });

  it('should have correct SecurityEvent structure', () => {
    const securityEvent: SecurityEvent = {
      timestamp: '2023-01-01T00:00:00.000Z',
      level: LogLevel.WARN,
      message: 'Security event',
      eventType: SecurityEventType.LOGIN_FAILURE,
      severity: 'medium',
      source: 'web',
      target: 'user123',
      outcome: 'failure',
      riskScore: 50,
      geolocation: {
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        coordinates: [37.7749, -122.4194],
      },
    };

    expect(securityEvent).toBeDefined();
    expect(securityEvent.eventType).toBe(SecurityEventType.LOGIN_FAILURE);
  });

  it('should have correct AuditLog structure', () => {
    const auditLog: AuditLog = {
      timestamp: '2023-01-01T00:00:00.000Z',
      level: LogLevel.INFO,
      message: 'Audit log',
      action: 'update',
      resource: 'user',
      resourceId: 'user123',
      oldValue: { name: 'John' },
      newValue: { name: 'John Doe' },
      changes: {
        name: { from: 'John', to: 'John Doe' },
      },
    };

    expect(auditLog).toBeDefined();
    expect(auditLog.action).toBe('update');
  });
});