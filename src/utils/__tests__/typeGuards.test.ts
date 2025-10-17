/**
 * @jest-environment jsdom
 */

import {
  is,
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  isNonEmptyArray,
  isPlainObject,
  safeParseInt,
  safeParseFloat,
  safeParseBoolean,
  safeParseDate,
  hasProperty,
  hasStringProperty,
  hasNumberProperty,
  hasBooleanProperty,
  isArrayOf,
  isStringArray,
  isNumberArray,
  isOneOf,
  validateObjectShape,
  validateOptionalObjectShape,
  safeJsonParse
} from '../typeGuards';

// Mock errorHandler to avoid dependencies
jest.mock('../errorHandler', () => ({
  createError: {
    validation: jest.fn((message: string, type: string) => new Error(message))
  },
  globalErrorHandler: {
    handle: jest.fn()
  }
}));

describe('typeGuards', () => {
  describe('basic type guards (is)', () => {
    describe('is.string', () => {
      it('should return true for strings', () => {
        expect(is.string('hello')).toBe(true);
        expect(is.string('')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(is.string(123)).toBe(false);
        expect(is.string(null)).toBe(false);
        expect(is.string(undefined)).toBe(false);
      });
    });

    describe('is.number', () => {
      it('should return true for valid numbers', () => {
        expect(is.number(123)).toBe(true);
        expect(is.number(0)).toBe(true);
        expect(is.number(-123)).toBe(true);
        expect(is.number(3.14)).toBe(true);
      });

      it('should return false for NaN and non-numbers', () => {
        expect(is.number(NaN)).toBe(false);
        expect(is.number('123')).toBe(false);
        expect(is.number(null)).toBe(false);
      });
    });

    describe('is.boolean', () => {
      it('should return true for booleans', () => {
        expect(is.boolean(true)).toBe(true);
        expect(is.boolean(false)).toBe(true);
      });

      it('should return false for non-booleans', () => {
        expect(is.boolean(1)).toBe(false);
        expect(is.boolean('true')).toBe(false);
      });
    });

    describe('is.array', () => {
      it('should return true for arrays', () => {
        expect(is.array([])).toBe(true);
        expect(is.array([1, 2, 3])).toBe(true);
      });

      it('should return false for non-arrays', () => {
        expect(is.array({})).toBe(false);
        expect(is.array('array')).toBe(false);
      });
    });

    describe('is.date', () => {
      it('should return true for valid dates', () => {
        expect(is.date(new Date())).toBe(true);
        expect(is.date(new Date('2023-01-01'))).toBe(true);
      });

      it('should return false for invalid dates', () => {
        expect(is.date(new Date('invalid'))).toBe(false);
        expect(is.date('2023-01-01')).toBe(false);
      });
    });
  });

  describe('compound type guards', () => {
    describe('isNonEmptyString', () => {
      it('should return true for non-empty strings', () => {
        expect(isNonEmptyString('hello')).toBe(true);
        expect(isNonEmptyString(' a ')).toBe(true);
      });

      it('should return false for empty or whitespace strings', () => {
        expect(isNonEmptyString('')).toBe(false);
        expect(isNonEmptyString('   ')).toBe(false);
        expect(isNonEmptyString(123)).toBe(false);
      });
    });

    describe('isPositiveNumber', () => {
      it('should return true for positive numbers', () => {
        expect(isPositiveNumber(1)).toBe(true);
        expect(isPositiveNumber(3.14)).toBe(true);
      });

      it('should return false for zero, negative, or non-numbers', () => {
        expect(isPositiveNumber(0)).toBe(false);
        expect(isPositiveNumber(-1)).toBe(false);
        expect(isPositiveNumber('1')).toBe(false);
      });
    });

    describe('isInteger', () => {
      it('should return true for integers', () => {
        expect(isInteger(1)).toBe(true);
        expect(isInteger(0)).toBe(true);
        expect(isInteger(-5)).toBe(true);
      });

      it('should return false for floats and non-numbers', () => {
        expect(isInteger(3.14)).toBe(false);
        expect(isInteger('1')).toBe(false);
      });
    });
  });

  describe('safe parsing functions', () => {
    describe('safeParseInt', () => {
      it('should parse valid integers', () => {
        expect(safeParseInt(123)).toBe(123);
        expect(safeParseInt('456')).toBe(456);
        expect(safeParseInt(3.14)).toBe(3);
      });

      it('should return default value for invalid input', () => {
        expect(safeParseInt('invalid')).toBe(0);
        expect(safeParseInt('invalid', 10)).toBe(10);
        expect(safeParseInt(null)).toBe(0);
      });
    });

    describe('safeParseFloat', () => {
      it('should parse valid floats', () => {
        expect(safeParseFloat(123)).toBe(123);
        expect(safeParseFloat('3.14')).toBe(3.14);
      });

      it('should return default value for invalid input', () => {
        expect(safeParseFloat('invalid')).toBe(0);
        expect(safeParseFloat('invalid', 5.5)).toBe(5.5);
      });
    });

    describe('safeParseBoolean', () => {
      it('should parse boolean values', () => {
        expect(safeParseBoolean(true)).toBe(true);
        expect(safeParseBoolean(false)).toBe(false);
        expect(safeParseBoolean('true')).toBe(true);
        expect(safeParseBoolean('false')).toBe(false);
        expect(safeParseBoolean('1')).toBe(true);
        expect(safeParseBoolean('0')).toBe(false);
        expect(safeParseBoolean(1)).toBe(true);
        expect(safeParseBoolean(0)).toBe(false);
      });

      it('should return default value for invalid input', () => {
        expect(safeParseBoolean('invalid')).toBe(false);
        expect(safeParseBoolean('invalid', true)).toBe(true);
      });
    });

    describe('safeParseDate', () => {
      it('should parse valid dates', () => {
        const date = new Date('2023-01-01');
        expect(safeParseDate(date)).toBe(date);
        expect(safeParseDate('2023-01-01')).toEqual(new Date('2023-01-01'));
        expect(safeParseDate(1672531200000)).toEqual(new Date(1672531200000));
      });

      it('should return default value for invalid input', () => {
        const defaultDate = new Date('2020-01-01');
        expect(safeParseDate('invalid')).toBeUndefined();
        expect(safeParseDate('invalid', defaultDate)).toBe(defaultDate);
      });
    });
  });

  describe('object property checks', () => {
    const testObj = {
      name: 'test',
      age: 25,
      active: true
    };

    describe('hasProperty', () => {
      it('should return true for existing properties', () => {
        expect(hasProperty(testObj, 'name')).toBe(true);
        expect(hasProperty(testObj, 'age')).toBe(true);
      });

      it('should return false for non-existing properties', () => {
        expect(hasProperty(testObj, 'missing')).toBe(false);
        expect(hasProperty(null, 'name')).toBe(false);
      });
    });

    describe('hasStringProperty', () => {
      it('should return true for string properties', () => {
        expect(hasStringProperty(testObj, 'name')).toBe(true);
      });

      it('should return false for non-string properties', () => {
        expect(hasStringProperty(testObj, 'age')).toBe(false);
      });
    });

    describe('hasNumberProperty', () => {
      it('should return true for number properties', () => {
        expect(hasNumberProperty(testObj, 'age')).toBe(true);
      });

      it('should return false for non-number properties', () => {
        expect(hasNumberProperty(testObj, 'name')).toBe(false);
      });
    });
  });

  describe('array type checks', () => {
    describe('isArrayOf', () => {
      it('should validate array of specific type', () => {
        expect(isArrayOf([1, 2, 3], is.number)).toBe(true);
        expect(isArrayOf(['a', 'b'], is.string)).toBe(true);
        expect(isArrayOf([1, 'a'], is.number)).toBe(false);
      });
    });

    describe('isStringArray', () => {
      it('should validate string arrays', () => {
        expect(isStringArray(['a', 'b', 'c'])).toBe(true);
        expect(isStringArray([1, 2, 3])).toBe(false);
        expect(isStringArray([])).toBe(true);
      });
    });

    describe('isNumberArray', () => {
      it('should validate number arrays', () => {
        expect(isNumberArray([1, 2, 3])).toBe(true);
        expect(isNumberArray(['a', 'b'])).toBe(false);
        expect(isNumberArray([])).toBe(true);
      });
    });
  });

  describe('union type checks', () => {
    describe('isOneOf', () => {
      it('should validate union types', () => {
        const options = ['red', 'green', 'blue'] as const;
        expect(isOneOf('red', options)).toBe(true);
        expect(isOneOf('yellow', options)).toBe(false);
      });
    });
  });

  describe('object shape validation', () => {
    describe('validateObjectShape', () => {
      it('should validate object shape', () => {
        const shape = {
          name: is.string,
          age: is.number
        };
        
        expect(validateObjectShape({ name: 'John', age: 30 }, shape)).toBe(true);
        expect(validateObjectShape({ name: 'John', age: '30' }, shape)).toBe(false);
        expect(validateObjectShape({ name: 'John' }, shape)).toBe(false);
      });
    });

    describe('validateOptionalObjectShape', () => {
      it('should validate optional object shape', () => {
        const shape = {
          name: is.string,
          age: is.number
        };
        
        expect(validateOptionalObjectShape({ name: 'John' }, shape)).toBe(true);
        expect(validateOptionalObjectShape({ age: 30 }, shape)).toBe(true);
        expect(validateOptionalObjectShape({ name: 'John', age: '30' }, shape)).toBe(false);
      });
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"name": "test"}');
      expect(result).toEqual({ name: 'test' });
    });

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json');
      expect(result).toBeNull();
    });

    it('should validate parsed JSON with validator', () => {
      const validator = (value: unknown): value is { name: string } =>
        is.object(value) && hasStringProperty(value, 'name');
      
      const validResult = safeJsonParse('{"name": "test"}', validator);
      expect(validResult).toEqual({ name: 'test' });
      
      const invalidResult = safeJsonParse('{"age": 30}', validator);
      expect(invalidResult).toBeNull();
    });
  });
});