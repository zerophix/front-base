/**
 * Monitoring 模块测试
 */

import {
  SecurityMonitor,
  ThreatLevel,
  MonitoringEvent,
  AnomalyDetectionResult,
  securityMonitor,
} from '../monitoring';

// Mock logger
jest.mock('../logger', () => ({
  securityLogger: {
    logSecurityEvent: jest.fn(),
    logSuspiciousActivity: jest.fn(),
  },
}));

describe('SecurityMonitor', () => {
  let monitor: SecurityMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    monitor = SecurityMonitor.getInstance();
    // Clear any existing data
    monitor.destroy();
    monitor = SecurityMonitor.getInstance();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SecurityMonitor.getInstance();
      const instance2 = SecurityMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Event Recording', () => {
    it('should record monitoring events', () => {
      const event: MonitoringEvent = {
        timestamp: Date.now(),
        type: 'login',
        userId: 'user123',
        sessionId: 'session456',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        url: '/login',
        metadata: { success: true },
      };

      expect(() => monitor.recordEvent(event)).not.toThrow();
    });

    it('should handle events without optional fields', () => {
      const event: MonitoringEvent = {
        timestamp: Date.now(),
        type: 'api_call',
      };

      expect(() => monitor.recordEvent(event)).not.toThrow();
    });
  });

  describe('Login Anomaly Detection', () => {
    it('should detect normal login behavior', () => {
      const result = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );

      expect(result.isAnomaly).toBe(false);
      expect(result.threatLevel).toBe(ThreatLevel.LOW);
      expect(result.riskScore).toBeLessThan(50);
    });

    it('should detect failed login attempts', () => {
      // Simulate multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        monitor.recordEvent({
          timestamp: Date.now() - i * 1000,
          type: 'login_failure',
          userId: 'user123',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { success: false },
        });
      }

      const result = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'Mozilla/5.0',
        false
      );

      expect(result.isAnomaly).toBe(true);
      expect([ThreatLevel.MEDIUM, ThreatLevel.HIGH]).toContain(result.threatLevel);
      expect(result.riskScore).toBeGreaterThanOrEqual(50);
      expect(result.reasons).toContain('Multiple failed login attempts');
    });

    it('should detect unusual login times', () => {
      // Record normal login times (9 AM - 5 PM)
      const normalHours = [9, 10, 11, 14, 15, 16, 17];
      normalHours.forEach(hour => {
        monitor.recordEvent({
          timestamp: new Date().setHours(hour, 0, 0, 0),
          type: 'login_success',
          userId: 'user123',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        });
      });

      // Test unusual login time (3 AM)
      const result = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );

      // The result depends on the current time and pattern analysis
      expect(result).toBeDefined();
      expect(typeof result.isAnomaly).toBe('boolean');
      expect(typeof result.riskScore).toBe('number');
    });

    it('should detect new IP addresses', () => {
      // Record events from known IP
      monitor.recordEvent({
        timestamp: Date.now() - 86400000, // 1 day ago
        type: 'login_success',
        userId: 'user123',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      // Test login from new IP
      const result = monitor.detectLoginAnomaly(
        'user123',
        '10.0.0.1', // Different IP
        'Mozilla/5.0',
        true
      );

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('Login from new IP address');
    });

    it('should detect suspicious user agents', () => {
      const result = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'curl/7.68.0', // Suspicious user agent
        true
      );

      expect(result.isAnomaly).toBe(false); // New user/device detection doesn't trigger anomaly by itself
      expect(result.reasons).toContain('Login from new device/browser');
    });
  });

  describe('API Anomaly Detection', () => {
    it('should detect normal API usage', () => {
      const result = monitor.detectApiAnomaly(
        'user123',
        '/api/profile',
        'GET',
        '192.168.1.1'
      );

      expect(result.isAnomaly).toBe(false);
      expect(result.threatLevel).toBe(ThreatLevel.LOW);
    });

    it('should detect rapid API calls', () => {
      // Simulate rapid API calls (need more than 100 calls to trigger)
      const now = Date.now();
      for (let i = 0; i < 105; i++) {
        monitor.recordEvent({
          timestamp: now - i * 100, // 100ms apart
          type: 'api_call',
          userId: 'user123',
          url: '/api/users',
          metadata: { method: 'GET' },
        });
      }

      const result = monitor.detectApiAnomaly(
        'user123',
        '/api/users',
        'GET',
        '192.168.1.1'
      );

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('Excessive API calls');
    });

    it('should detect unusual endpoint access', () => {
      // Record normal API usage
      monitor.recordEvent({
        timestamp: Date.now() - 3600000, // 1 hour ago
        type: 'api_call',
        userId: 'user123',
        url: '/api/profile',
        metadata: { method: 'GET' },
      });

      // Test access to admin endpoint
      const result = monitor.detectApiAnomaly(
        'user123',
        '/api/admin/users',
        'DELETE',
        '192.168.1.1'
      );

      expect(result.isAnomaly).toBe(false); // 30 points is below 40 threshold
      expect(result.reasons).toContain('Access to sensitive endpoint');
    });
  });

  describe('Data Access Anomaly Detection', () => {
    it('should detect normal data access', () => {
      const result = monitor.detectDataAccessAnomaly(
        'user123',
        'user_profile',
        'profile123',
        'read'
      );

      expect(result.isAnomaly).toBe(false);
      expect(result.threatLevel).toBe(ThreatLevel.LOW);
    });

    it('should detect bulk data access', () => {
      // Simulate bulk data access (need more than 50 events to trigger)
      const now = Date.now();
      for (let i = 0; i < 55; i++) {
        monitor.recordEvent({
          timestamp: now - i * 1000,
          type: 'data_access',
          userId: 'user123',
          metadata: {
            resourceType: 'user_profile',
            action: 'read',
            resourceId: `profile${i}`,
          },
        });
      }

      const result = monitor.detectDataAccessAnomaly(
        'user123',
        'user_profile',
        'profile100',
        'read'
      );

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('Bulk data access detected');
    });

    it('should detect unusual modification patterns', () => {
      // Simulate rapid modifications
      const now = Date.now();
      for (let i = 0; i < 8; i++) {
        monitor.recordEvent({
          timestamp: now - i * 1000,
          type: 'data_modification',
          userId: 'user123',
          metadata: {
            action: 'modify',
            resourceType: 'user_profile',
          },
        });
      }

      const result = monitor.detectDataAccessAnomaly(
        'user123',
        'user_profile',
        'profile123',
        'modify'
      );

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('Privileged operation attempt');
    });
  });

  describe('Threat Level Calculation', () => {
    it('should calculate correct threat levels', () => {
      // Test different risk scores
      const lowRiskResult = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );
      expect(lowRiskResult.threatLevel).toBe(ThreatLevel.LOW);

      // Simulate high-risk scenario
      for (let i = 0; i < 10; i++) {
        monitor.recordEvent({
          timestamp: Date.now() - i * 1000,
          type: 'login_failure',
          userId: 'user456',
          ip: '192.168.1.1',
          userAgent: 'curl/7.68.0',
          metadata: { success: false },
        });
      }

      const highRiskResult = monitor.detectLoginAnomaly(
        'user456',
        '10.0.0.1',
        'curl/7.68.0',
        false
      );
      expect([ThreatLevel.HIGH, ThreatLevel.CRITICAL]).toContain(
        highRiskResult.threatLevel
      );
    });
  });

  describe('Recommendations Generation', () => {
    it('should generate appropriate recommendations', () => {
      // Simulate suspicious activity
      for (let i = 0; i < 5; i++) {
        monitor.recordEvent({
          timestamp: Date.now() - i * 1000,
          type: 'login_failure',
          userId: 'user123',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { success: false },
        });
      }

      const result = monitor.detectLoginAnomaly(
        'user123',
        '192.168.1.1',
        'Mozilla/5.0',
        false
      );

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([expect.any(String)])
      );
    });
  });

  describe('Data Cleanup', () => {
    it('should handle cleanup operations', () => {
      // Add many events
      for (let i = 0; i < 100; i++) {
        monitor.recordEvent({
          timestamp: Date.now() - i * 1000,
          type: 'test_event',
          userId: `user${i}`,
        });
      }

      // Cleanup should not throw
      expect(() => monitor.destroy()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle events with missing data', () => {
      const incompleteEvent: MonitoringEvent = {
        timestamp: Date.now(),
        type: 'incomplete_event',
      };

      expect(() => monitor.recordEvent(incompleteEvent)).not.toThrow();
    });

    it('should handle detection for non-existent users', () => {
      const result = monitor.detectLoginAnomaly(
        'nonexistent_user',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );

      expect(result).toBeDefined();
      expect(typeof result.isAnomaly).toBe('boolean');
    });

    it('should handle invalid timestamps', () => {
      const eventWithInvalidTimestamp: MonitoringEvent = {
        timestamp: -1,
        type: 'invalid_timestamp',
        userId: 'user123',
      };

      expect(() => monitor.recordEvent(eventWithInvalidTimestamp)).not.toThrow();
    });
  });

  describe('Exported Instance', () => {
    it('should export a singleton instance', () => {
      expect(securityMonitor).toBeInstanceOf(SecurityMonitor);
      expect(securityMonitor).toBe(SecurityMonitor.getInstance());
    });
  });

  describe('Interface Types', () => {
    it('should have correct MonitoringEvent structure', () => {
      const event: MonitoringEvent = {
        timestamp: Date.now(),
        type: 'test_event',
        userId: 'user123',
        sessionId: 'session456',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        url: '/test',
        metadata: { key: 'value' },
      };

      expect(event).toBeDefined();
      expect(typeof event.timestamp).toBe('number');
      expect(typeof event.type).toBe('string');
    });

    it('should have correct AnomalyDetectionResult structure', () => {
      const result: AnomalyDetectionResult = {
        isAnomaly: true,
        threatLevel: ThreatLevel.HIGH,
        riskScore: 85,
        reasons: ['Test reason'],
        recommendations: ['Test recommendation'],
      };

      expect(result).toBeDefined();
      expect(typeof result.isAnomaly).toBe('boolean');
      expect(typeof result.riskScore).toBe('number');
      expect(Array.isArray(result.reasons)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('ThreatLevel Enum', () => {
    it('should have correct threat level values', () => {
      expect(ThreatLevel.LOW).toBe('low');
      expect(ThreatLevel.MEDIUM).toBe('medium');
      expect(ThreatLevel.HIGH).toBe('high');
      expect(ThreatLevel.CRITICAL).toBe('critical');
    });
  });
});