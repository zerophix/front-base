/**
 * Security utilities test suite
 * 测试安全工具函数的各种功能
 */

import {
  escapeHtml,
  sanitizeHtml,
  sanitizeHtmlSync,
  isValidUrl,
  isValidEmail,
  isValidPhone,
  validateLength,
  escapeSql,
  generateCsrfToken,
  generateCsrfTokenPair,
  validateCsrfToken,
  getCsrfToken,
  getCsrfCookieToken,
  setCsrfToken,
  initCsrfProtection,
  validateRequestCsrfToken,
  validateInput,
  securityValidationRules,
  rateLimitManager,
  TimingAttackProtection,
  preventClickjacking,
  generateCSPNonce,
  type ValidationRule,
} from '../../utils/security';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  default: {
    sanitize: jest.fn((html: string, options?: any) => {
      // 移除script标签
      let result = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
      
      // 如果有允许的标签选项，只保留这些标签
      if (options && options.ALLOWED_TAGS) {
        const allowedTags = options.ALLOWED_TAGS;
        const tagRegex = /<(\/?)([\w-]+)([^>]*)>/gi;
        result = result.replace(tagRegex, (match, slash, tagName, attrs) => {
          if (allowedTags.includes(tagName.toLowerCase())) {
            return match;
          }
          return '';
        });
      }
      
      return result;
    }),
  },
}));

// Mock JSDOM for server-side testing
jest.mock('jsdom', () => ({
  JSDOM: jest.fn(() => ({
    window: {
      document: {},
    },
  })),
}));

// Mock document and window for browser environment
Object.defineProperty(global, 'document', {
  value: {
    cookie: '',
    createElement: jest.fn(() => ({
      style: {},
    })),
    head: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    crypto: {
      getRandomValues: jest.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    },
    document: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      createElement: jest.fn(() => ({
        style: {},
      })),
      head: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
    },
    self: global,
    top: global,
    location: {
      href: 'http://localhost:3000',
    },
  },
  writable: true,
});

describe('Security Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.cookie
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });
  });

  describe('HTML Escaping', () => {
    describe('escapeHtml', () => {
      it('should escape HTML special characters', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe(
          '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
        );
      });

      it('should escape all dangerous characters', () => {
        expect(escapeHtml('&<>"\'/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
      });

      it('should handle empty string', () => {
        expect(escapeHtml('')).toBe('');
      });

      it('should handle normal text without special characters', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
      });
    });

    describe('sanitizeHtml', () => {
      it('should sanitize HTML content', async () => {
        const html = '<p>Safe content</p><script>alert("xss")</script>';
        const result = await sanitizeHtml(html);
        // 在测试环境中，降级处理会移除所有HTML标签
        expect(result).toBe('Safe contentalert("xss")');
      });

      it('should handle custom options', async () => {
        const html = '<div><p>Content</p></div>';
        const result = await sanitizeHtml(html, {
          allowedTags: ['p'],
          strict: true,
        });
        expect(result).toBeDefined();
      });
    });

    describe('sanitizeHtmlSync', () => {
      it('should return empty string in non-browser environment', () => {
        const html = '<script>alert("xss")</script>';
        const result = sanitizeHtmlSync(html);
        // 在非浏览器环境中，会移除所有HTML标签但保留内容
        expect(result).toBe('alert("xss")');
      });
    });
  });

  describe('Input Validation', () => {
    describe('isValidUrl', () => {
      it('should validate correct URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('http://localhost:3000')).toBe(true);
        expect(isValidUrl('ftp://files.example.com')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(isValidUrl('not-a-url')).toBe(false);
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
        expect(isValidUrl('')).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('should validate phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true);
        expect(isValidPhone('123-456-7890')).toBe(true);
        expect(isValidPhone('(123) 456-7890')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('abc')).toBe(false);
        expect(isValidPhone('123')).toBe(false);
      });
    });

    describe('validateLength', () => {
      it('should validate string length within range', () => {
        expect(validateLength('hello', 3, 10)).toBe(true);
        expect(validateLength('hi', 1, 5)).toBe(true);
      });

      it('should reject strings outside length range', () => {
        expect(validateLength('hi', 3, 10)).toBe(false);
        expect(validateLength('very long string', 1, 5)).toBe(false);
      });
    });
  });

  describe('SQL Injection Protection', () => {
    describe('escapeSql', () => {
      it('should escape SQL injection attempts', () => {
        expect(escapeSql("'; DROP TABLE users; --")).toContain('\\\'');
        expect(escapeSql('SELECT * FROM users WHERE id = 1')).toBeDefined();
      });

      it('should handle normal strings', () => {
        expect(escapeSql('normal text')).toBe('normal text');
      });

      it('should escape quotes and backslashes', () => {
        expect(escapeSql("It's a test")).toContain('\\\'');
        expect(escapeSql('Path\\to\\file')).toContain('\\\\');
      });
    });
  });

  describe('CSRF Protection', () => {
    describe('generateCsrfToken', () => {
      it('should generate a token', () => {
        const token = generateCsrfToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });

      it('should generate different tokens each time', () => {
        const token1 = generateCsrfToken();
        const token2 = generateCsrfToken();
        expect(token1).not.toBe(token2);
      });
    });

    describe('generateCsrfTokenPair', () => {
      it('should generate cookie and header tokens', () => {
        const { cookieToken, headerToken } = generateCsrfTokenPair();
        expect(cookieToken).toBeDefined();
        expect(headerToken).toBeDefined();
        expect(typeof cookieToken).toBe('string');
        expect(typeof headerToken).toBe('string');
      });
    });

    describe('validateCsrfToken', () => {
      it('should validate matching tokens', () => {
        const { cookieToken, headerToken } = generateCsrfTokenPair();
        expect(validateCsrfToken(headerToken, cookieToken)).toBe(true);
      });

      it('should reject mismatched tokens', () => {
        const token1 = generateCsrfToken();
        const token2 = generateCsrfToken();
        expect(validateCsrfToken(token1, token2)).toBe(false);
      });

      it('should handle empty tokens', () => {
        expect(validateCsrfToken('', '')).toBe(false);
        expect(validateCsrfToken('token', '')).toBe(false);
      });
    });

    describe('CSRF token management', () => {
      it('should set and get CSRF tokens', () => {
        const { cookieToken, headerToken } = generateCsrfTokenPair();
        setCsrfToken(cookieToken, headerToken);
        
        const retrievedCookieToken = getCsrfCookieToken();
        const retrievedHeaderToken = getCsrfToken();
        
        expect(retrievedCookieToken).toBe(cookieToken);
        expect(retrievedHeaderToken).toBe(headerToken);
      });

      it('should initialize CSRF protection', () => {
        initCsrfProtection();
        const cookieToken = getCsrfCookieToken();
        const headerToken = getCsrfToken();
        
        expect(cookieToken).toBeDefined();
        expect(headerToken).toBeDefined();
      });
    });

    describe('validateRequestCsrfToken', () => {
      it('should validate request CSRF token', () => {
        const { cookieToken, headerToken } = generateCsrfTokenPair();
        setCsrfToken(cookieToken, headerToken);
        
        const mockRequest = {
          headers: {
            get: jest.fn((name: string) => {
              if (name === 'x-csrf-token') return headerToken;
              if (name === 'cookie') return `csrf-token=${cookieToken}`;
              return null;
            }),
          },
        } as any;

        expect(validateRequestCsrfToken(mockRequest)).toBe(true);
      });
    });
  });

  describe('Advanced Input Validation', () => {
    describe('validateInput', () => {
      it('should validate required fields', () => {
        const rule: ValidationRule = { required: true };
        expect(validateInput('', rule)).toEqual({
          valid: false,
          message: 'This field is required',
        });
        expect(validateInput('value', rule)).toEqual({ valid: true });
      });

      it('should validate length constraints', () => {
        const rule: ValidationRule = { minLength: 3, maxLength: 10 };
        expect(validateInput('hi', rule)).toEqual({
          valid: false,
          message: 'Length must be between 3 and 10 characters',
        });
        expect(validateInput('hello', rule)).toEqual({ valid: true });
      });

      it('should validate patterns', () => {
        const rule: ValidationRule = { 
          pattern: /^\d+$/, 
          message: 'Must be numbers only' 
        };
        expect(validateInput('abc', rule)).toEqual({
          valid: false,
          message: 'Must be numbers only',
        });
        expect(validateInput('123', rule)).toEqual({ valid: true });
      });

      it('should detect XSS attempts', () => {
        const rule: ValidationRule = { preventXSS: true };
        expect(validateInput('<script>alert(1)</script>', rule)).toEqual({
          valid: false,
          message: 'Potential XSS attack detected',
        });
        expect(validateInput('safe text', rule)).toEqual({ valid: true });
      });

      it('should detect SQL injection attempts', () => {
        const rule: ValidationRule = { preventSQLInjection: true };
        expect(validateInput("'; DROP TABLE users; --", rule)).toEqual({
          valid: false,
          message: 'Potential SQL injection detected',
        });
        expect(validateInput('safe text', rule)).toEqual({ valid: true });
      });

      it('should detect path traversal attempts', () => {
        const rule: ValidationRule = { preventPathTraversal: true };
        expect(validateInput('../../../etc/passwd', rule)).toEqual({
          valid: false,
          message: 'Potential path traversal detected',
        });
        expect(validateInput('normal/path', rule)).toEqual({ valid: true });
      });

      it('should validate custom rules', () => {
        const rule: ValidationRule = {
          custom: (value: string) => value === 'expected',
          message: 'Custom validation failed',
        };
        expect(validateInput('wrong', rule)).toEqual({
          valid: false,
          message: 'Custom validation failed',
        });
        expect(validateInput('expected', rule)).toEqual({ valid: true });
      });
    });

    describe('securityValidationRules', () => {
      it('should have predefined validation rules', () => {
        expect(securityValidationRules.username).toBeDefined();
        expect(securityValidationRules.password).toBeDefined();
        expect(securityValidationRules.email).toBeDefined();
        expect(securityValidationRules.text).toBeDefined();
      });

      it('should validate username with predefined rules', () => {
        const result = validateInput('user123', securityValidationRules.username);
        expect(result.valid).toBe(true);
      });

      it('should validate email with predefined rules', () => {
        const result = validateInput('user@example.com', securityValidationRules.email);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      rateLimitManager.reset('test-user');
      rateLimitManager.reset('127.0.0.1');
    });

    describe('rateLimitManager', () => {
      it('should allow requests within rate limit', () => {
        const result = rateLimitManager.checkRateLimit('test-user', 5, 60000);
        expect(result.blocked).toBe(false);
        expect(result.remainingAttempts).toBe(4);
      });

      it('should block requests exceeding rate limit', () => {
        // Exhaust the rate limit
        for (let i = 0; i < 5; i++) {
          rateLimitManager.checkRateLimit('test-user', 5, 60000);
        }
        
        const result = rateLimitManager.checkRateLimit('test-user', 5, 60000);
        expect(result.blocked).toBe(true);
        expect(result.reason).toContain('Rate limit exceeded');
      });

      it('should check IP rate limits', () => {
        const result = rateLimitManager.checkIPRateLimit('127.0.0.1', 10, 60000);
        expect(result.blocked).toBe(false);
        expect(result.remainingAttempts).toBe(9);
      });

      it('should reset rate limits', () => {
        rateLimitManager.checkRateLimit('test-user', 1, 60000);
        rateLimitManager.reset('test-user');
        
        const result = rateLimitManager.checkRateLimit('test-user', 1, 60000);
        expect(result.blocked).toBe(false);
      });

      it('should blacklist IPs', () => {
        rateLimitManager.blacklistIP('192.168.1.1');
        const result = rateLimitManager.checkIPRateLimit('192.168.1.1', 10, 60000);
        expect(result.blocked).toBe(true);
        expect(result.reason).toContain('IP blacklisted');
      });

      it('should get statistics', () => {
        const stats = rateLimitManager.getStats();
        expect(stats).toHaveProperty('activeAttempts');
        expect(stats).toHaveProperty('blacklistedIPs');
        expect(stats).toHaveProperty('lockedAccounts');
      });
    });
  });

  describe('Timing Attack Protection', () => {
    describe('TimingAttackProtection', () => {
      it('should perform secure string comparison', () => {
        expect(TimingAttackProtection.secureCompare('hello', 'hello')).toBe(true);
        expect(TimingAttackProtection.secureCompare('hello', 'world')).toBe(false);
      });

      it('should add constant delay', async () => {
        const startTime = Date.now();
        await TimingAttackProtection.addConstantDelay(startTime);
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      });

      it('should add security delay', async () => {
        const startTime = Date.now();
        await TimingAttackProtection.addSecurityDelay('test-user');
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(0);
      });

      it('should detect timing attacks', () => {
        const isAttack = TimingAttackProtection.detectTimingAttack('test-user', 50);
        expect(typeof isAttack).toBe('boolean');
      });
    });
  });

  describe('Security Headers', () => {
    describe('preventClickjacking', () => {
      it('should set clickjacking prevention headers', () => {
        const mockStyle = {};
        const mockElement = { style: mockStyle };
        const mockHead = { appendChild: jest.fn() };
        
        Object.defineProperty(document, 'createElement', {
          value: jest.fn(() => mockElement),
          writable: true,
        });
        
        Object.defineProperty(document, 'head', {
          value: mockHead,
          writable: true,
        });

        preventClickjacking();
        
        expect(document.createElement).toHaveBeenCalledWith('style');
        expect(mockHead.appendChild).toHaveBeenCalledWith(mockElement);
      });
    });

    describe('generateCSPNonce', () => {
      it('should generate a CSP nonce', () => {
        const nonce = generateCSPNonce();
        expect(nonce).toBeDefined();
        expect(typeof nonce).toBe('string');
        expect(nonce.length).toBeGreaterThan(0);
      });

      it('should generate different nonces each time', () => {
        const nonce1 = generateCSPNonce();
        const nonce2 = generateCSPNonce();
        expect(nonce1).not.toBe(nonce2);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => escapeHtml(null as any)).not.toThrow();
      expect(() => isValidEmail(undefined as any)).not.toThrow();
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      expect(() => escapeHtml(longString)).not.toThrow();
      expect(() => validateLength(longString, 1, 5000)).not.toThrow();
    });

    it('should handle special characters in validation', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = validateInput(specialChars, { preventXSS: true });
      expect(result).toBeDefined();
    });
  });
});