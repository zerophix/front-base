/**
 * @jest-environment jsdom
 */

import {
  sanitizeString,
  validateField,
  validateForm,
  formValidationSchemas,
  createValidationMiddleware,
  validateBatch,
  ValidationResult,
  FieldValidation,
  SanitizeOptions
} from '../validation';

// Mock security module
jest.mock('../security', () => ({
  validateInput: jest.fn((value: any, rules: any) => {
    // Simple mock implementation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return { valid: false, message: '此字段为必填项' };
    }
    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      return { valid: false, message: `长度不能超过${rules.maxLength}个字符` };
    }
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return { valid: false, message: '格式不正确' };
    }
    return { valid: true };
  }),
  securityValidationRules: {
    username: {
      required: true,
      maxLength: 50,
      preventXSS: true,
      preventSQLInjection: true,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      preventXSS: true,
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 128,
      preventXSS: true,
    },
    text: {
      maxLength: 1000,
      preventXSS: true,
      preventSQLInjection: true,
    },
    filename: {
      required: true,
      maxLength: 255,
      preventXSS: true,
      allowedCharacters: 'a-zA-Z0-9._-',
    }
  }
}));

describe('validation utils', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace when trim option is true', () => {
      const options: SanitizeOptions = { trim: true };
      expect(sanitizeString('  hello  ', options)).toBe('hello');
    });

    it('should convert to lowercase when toLowerCase option is true', () => {
      const options: SanitizeOptions = { toLowerCase: true };
      expect(sanitizeString('HELLO', options)).toBe('hello');
    });

    it('should convert to uppercase when toUpperCase option is true', () => {
      const options: SanitizeOptions = { toUpperCase: true };
      expect(sanitizeString('hello', options)).toBe('HELLO');
    });

    it('should remove special characters when removeSpecialChars option is true', () => {
      const options: SanitizeOptions = { removeSpecialChars: true };
      expect(sanitizeString('hello@#$world', options)).toBe('helloworld');
      expect(sanitizeString('hello 世界', options)).toBe('hello 世界'); // Should keep Chinese characters
    });

    it('should truncate to maxLength when specified', () => {
      const options: SanitizeOptions = { maxLength: 5 };
      expect(sanitizeString('hello world', options)).toBe('hello');
    });

    it('should apply multiple options together', () => {
      const options: SanitizeOptions = {
        trim: true,
        toLowerCase: true,
        maxLength: 8
      };
      expect(sanitizeString('  HELLO WORLD  ', options)).toBe('hello wo');
    });

    it('should return original string when no options provided', () => {
      expect(sanitizeString('hello')).toBe('hello');
    });
  });

  describe('validateField', () => {
    it('should validate required field successfully', () => {
      const validation: FieldValidation = {
        rules: { required: true }
      };
      
      const result = validateField('username', 'john', validation);
      expect(result.valid).toBe(true);
      expect(result.sanitizedValue).toBe('john');
    });

    it('should fail validation for empty required field', () => {
      const validation: FieldValidation = {
        rules: { required: true }
      };
      
      const result = validateField('username', '', validation);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('此字段为必填项');
    });

    it('should apply transform function', () => {
      const validation: FieldValidation = {
        rules: { required: true },
        transform: (value: string) => value.toUpperCase()
      };
      
      const result = validateField('username', 'john', validation);
      expect(result.valid).toBe(true);
      expect(result.sanitizedValue).toBe('JOHN');
    });

    it('should sanitize string when sanitize option is true', () => {
      const validation: FieldValidation = {
        rules: { required: true },
        sanitize: true
      };
      
      const result = validateField('username', '  john  ', validation);
      expect(result.valid).toBe(true);
      expect(result.sanitizedValue).toBe('john');
    });

    it('should trim string input automatically', () => {
      const validation: FieldValidation = {
        rules: { required: true }
      };
      
      const result = validateField('username', '  john  ', validation);
      expect(result.valid).toBe(true);
      expect(result.sanitizedValue).toBe('john');
    });
  });

  describe('validateForm', () => {
    const schema = {
      username: {
        rules: { required: true, maxLength: 10 }
      },
      email: {
        rules: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      }
    };

    it('should validate form successfully with valid data', () => {
      const data = {
        username: 'john',
        email: 'john@example.com'
      };
      
      const result = validateForm(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toEqual({
        username: 'john',
        email: 'john@example.com'
      });
    });

    it('should fail validation with invalid data', () => {
      const data = {
        username: '', // Required field empty
        email: 'invalid-email' // Invalid email format
      };
      
      const result = validateForm(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.username).toBe('此字段为必填项');
      expect(result.errors.email).toBe('格式不正确');
      expect(result.sanitizedData).toBeUndefined();
    });

    it('should handle partial validation errors', () => {
      const data = {
        username: 'john',
        email: 'invalid-email'
      };
      
      const result = validateForm(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('格式不正确');
      expect(Object.keys(result.errors)).toHaveLength(1);
    });
  });

  describe('formValidationSchemas', () => {
    it('should have userRegistration schema', () => {
      expect(formValidationSchemas.userRegistration).toBeDefined();
      expect(formValidationSchemas.userRegistration.username).toBeDefined();
      expect(formValidationSchemas.userRegistration.email).toBeDefined();
      expect(formValidationSchemas.userRegistration.password).toBeDefined();
    });

    it('should have userLogin schema', () => {
      expect(formValidationSchemas.userLogin).toBeDefined();
      expect(formValidationSchemas.userLogin.username).toBeDefined();
      expect(formValidationSchemas.userLogin.password).toBeDefined();
    });

    it('should have userProfile schema', () => {
      expect(formValidationSchemas.userProfile).toBeDefined();
      expect(formValidationSchemas.userProfile.name).toBeDefined();
      expect(formValidationSchemas.userProfile.phone).toBeDefined();
    });

    it('should have fileUpload schema', () => {
      expect(formValidationSchemas.fileUpload).toBeDefined();
      expect(formValidationSchemas.fileUpload.filename).toBeDefined();
      expect(formValidationSchemas.fileUpload.description).toBeDefined();
    });
  });

  describe('createValidationMiddleware', () => {
    const schema = {
      username: {
        rules: { required: true }
      }
    };

    it('should return sanitized data for valid input', () => {
      const middleware = createValidationMiddleware(schema);
      const data = { username: 'john' };
      
      const result = middleware(data);
      expect(result).toEqual({ username: 'john' });
    });

    it('should throw error for invalid input', () => {
      const middleware = createValidationMiddleware(schema);
      const data = { username: '' };
      
      expect(() => middleware(data)).toThrow('验证失败: 此字段为必填项');
    });
  });

  describe('validateBatch', () => {
    const schema = {
      username: {
        rules: { required: true }
      }
    };

    it('should validate all items successfully', () => {
      const items = [
        { username: 'john' },
        { username: 'jane' }
      ];
      
      const result = validateBatch(items, schema);
      expect(result.valid).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.validItems).toHaveLength(2);
      expect(result.validItems[0]).toEqual({ username: 'john' });
      expect(result.validItems[1]).toEqual({ username: 'jane' });
    });

    it('should handle mixed valid and invalid items', () => {
      const items = [
        { username: 'john' },
        { username: '' }, // Invalid
        { username: 'jane' }
      ];
      
      const result = validateBatch(items, schema);
      expect(result.valid).toBe(false);
      expect(result.results).toHaveLength(3);
      expect(result.validItems).toHaveLength(2);
      expect(result.validItems[0]).toEqual({ username: 'john' });
      expect(result.validItems[1]).toEqual({ username: 'jane' });
    });

    it('should return empty validItems when all items are invalid', () => {
      const items = [
        { username: '' },
        { username: '' }
      ];
      
      const result = validateBatch(items, schema);
      expect(result.valid).toBe(false);
      expect(result.results).toHaveLength(2);
      expect(result.validItems).toHaveLength(0);
    });
  });
});