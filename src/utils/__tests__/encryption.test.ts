import {
  EncryptionUtils,
  SecureEnvLoader,
  envManager,
  generateEncryptionKey,
  validateEnvironmentSecurity
} from '../encryption';

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn((size: number) => Buffer.alloc(size, 'a')),
  createCipher: jest.fn(),
  createDecipher: jest.fn(),
  createCipheriv: jest.fn(() => ({
    update: jest.fn(() => Buffer.from('encrypted')),
    final: jest.fn(() => Buffer.from('final')),
    getAuthTag: jest.fn(() => Buffer.from('tag')),
  })),
  createDecipheriv: jest.fn(() => ({
    setAuthTag: jest.fn(),
    update: jest.fn(() => Buffer.from('decrypted')),
    final: jest.fn(() => Buffer.from('final')),
  })),
  scrypt: jest.fn((password, salt, keylen, callback) => {
    callback(null, Buffer.alloc(keylen, 'key'));
  }),
  pbkdf2Sync: jest.fn(() => Buffer.from('hashedpassword')),
  timingSafeEqual: jest.fn(() => true),
}));

// Mock process.env
const originalEnv = process.env;

describe('Encryption Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('EncryptionUtils', () => {
    it('should encrypt data', () => {
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      const data = 'sensitive data';
      const result = EncryptionUtils.encrypt(data);
      
      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('tag');
    });

    it('should decrypt data', () => {
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      const encryptionResult = {
        encrypted: 'encrypted_data',
        iv: 'initialization_vector',
        tag: 'auth_tag'
      };
      
      const decrypted = EncryptionUtils.decrypt(encryptionResult);
      expect(typeof decrypted).toBe('string');
    });

    it('should encrypt environment value', () => {
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      const value = 'secret_value';
      const encrypted = EncryptionUtils.encryptEnvValue(value);
      
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(value);
    });

    it('should decrypt environment value', () => {
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      const encryptedValue = 'encrypted:eyJlbmNyeXB0ZWQiOiJkYXRhIiwiaXYiOiJpdiIsInRhZyI6InRhZyJ9';
      
      // Mock JSON.parse to return expected structure
      const originalParse = JSON.parse;
      JSON.parse = jest.fn().mockReturnValue({
        encrypted: 'data',
        iv: 'iv',
        tag: 'tag'
      });
      
      const decrypted = EncryptionUtils.decryptEnvValue(encryptedValue);
      expect(typeof decrypted).toBe('string');
      
      JSON.parse = originalParse;
    });

    it('should generate secure key', () => {
      const key = EncryptionUtils.generateSecureKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should hash password', async () => {
      const password = 'test_password';
      const hashed = await EncryptionUtils.hashPassword(password);
      
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
    });

    it('should verify password', async () => {
      const password = 'test_password';
      const hashedPassword = 'hashed_password';
      
      const isValid = await EncryptionUtils.verifyPassword(password, hashedPassword);
      expect(typeof isValid).toBe('boolean');
    });

    it('should generate secure token', () => {
      const token = EncryptionUtils.generateSecureToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('SecureEnvLoader', () => {
    it('should get environment variable', () => {
      process.env.TEST_VAR = 'test_value';
      
      const value = SecureEnvLoader.get('TEST_VAR');
      expect(value).toBe('test_value');
    });

    it('should return default value when env var not found', () => {
      const value = SecureEnvLoader.get('NON_EXISTENT_VAR', 'default');
      expect(value).toBe('default');
    });

    it('should get number from environment', () => {
      process.env.TEST_NUMBER = '42';
      
      const value = SecureEnvLoader.getNumber('TEST_NUMBER');
      expect(value).toBe(42);
    });

    it('should return default number when env var not found', () => {
      const value = SecureEnvLoader.getNumber('NON_EXISTENT_NUMBER', 100);
      expect(value).toBe(100);
    });

    it('should get boolean from environment', () => {
      process.env.TEST_BOOLEAN = 'true';
      
      const value = SecureEnvLoader.getBoolean('TEST_BOOLEAN');
      expect(value).toBe(true);
    });

    it('should return default boolean when env var not found', () => {
      const value = SecureEnvLoader.getBoolean('NON_EXISTENT_BOOLEAN', false);
      expect(value).toBe(false);
    });

    it('should clear cache', () => {
      process.env.TEST_CACHE = 'cached_value';
      SecureEnvLoader.get('TEST_CACHE'); // Load into cache
      
      SecureEnvLoader.clearCache();
      
      // After clearing cache, should reload from env
      process.env.TEST_CACHE = 'new_value';
      const value = SecureEnvLoader.get('TEST_CACHE');
      expect(value).toBe('new_value');
    });

    it('should validate required environment variables', () => {
      process.env.REQUIRED_VAR1 = 'value1';
      process.env.REQUIRED_VAR2 = 'value2';
      
      expect(() => {
        SecureEnvLoader.validateRequired(['REQUIRED_VAR1', 'REQUIRED_VAR2']);
      }).not.toThrow();
    });

    it('should throw error for missing required variables', () => {
      expect(() => {
        SecureEnvLoader.validateRequired(['MISSING_VAR']);
      }).toThrow();
    });
  });

  describe('Environment Manager', () => {
    it('should generate encryption key', () => {
      const key = generateEncryptionKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should validate environment security', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      const validation = validateEnvironmentSecurity();
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
      
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, writable: true });
    });

    it('should detect security issues in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      delete process.env.ENCRYPTION_KEY;
      
      const validation = validateEnvironmentSecurity();
      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, writable: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption errors gracefully', () => {
      // Test that encryption works in development mode even without key
      delete process.env.ENCRYPTION_KEY;
      
      // In development mode, it should use default key and not throw
      expect(() => {
        EncryptionUtils.encrypt('test data');
      }).not.toThrow();
    });

    it('should handle decryption errors gracefully', () => {
      process.env.ENCRYPTION_KEY = 'test_key_32_characters_long_123456';
      
      // Mock createDecipheriv to throw an error
      const crypto = require('crypto');
      crypto.createDecipheriv.mockImplementationOnce(() => {
        throw new Error('Decryption failed');
      });
      
      const invalidResult = {
        encrypted: 'invalid_data',
        iv: 'invalid_iv',
        tag: 'invalid_tag'
      };
      
      expect(() => {
        EncryptionUtils.decrypt(invalidResult);
      }).toThrow('Decryption failed');
    });

    it('should handle invalid encrypted environment values', () => {
      const invalidEncryptedValue = 'invalid:format';
      
      expect(() => {
        EncryptionUtils.decryptEnvValue(invalidEncryptedValue);
      }).toThrow();
    });
  });
});