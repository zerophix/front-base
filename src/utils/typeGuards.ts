/**
 * 运行时类型保护工具
 * 提供类型检查和验证功能
 */

import { createError, globalErrorHandler } from './errorHandler';

/**
 * 基础类型检查
 */
export const is = {
  string: (value: unknown): value is string => typeof value === 'string',
  number: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  boolean: (value: unknown): value is boolean => typeof value === 'boolean',
  object: (value: unknown): value is object => value !== null && typeof value === 'object',
  array: (value: unknown): value is unknown[] => Array.isArray(value),
  function: (value: unknown): value is (...args: any[]) => any => typeof value === 'function',
  undefined: (value: unknown): value is undefined => value === undefined,
  null: (value: unknown): value is null => value === null,
  nullish: (value: unknown): value is null | undefined => value == null,
  date: (value: unknown): value is Date => value instanceof Date && !isNaN(value.getTime()),
  error: (value: unknown): value is Error => value instanceof Error,
  promise: (value: unknown): value is Promise<unknown> => value instanceof Promise,
};

/**
 * 复合类型检查
 */
export const isNonEmptyString = (value: unknown): value is string => 
  is.string(value) && value.trim().length > 0;

export const isPositiveNumber = (value: unknown): value is number => 
  is.number(value) && value > 0;

export const isNonNegativeNumber = (value: unknown): value is number => 
  is.number(value) && value >= 0;

export const isInteger = (value: unknown): value is number => 
  is.number(value) && Number.isInteger(value);

export const isNonEmptyArray = <T>(value: unknown): value is T[] => 
  is.array(value) && value.length > 0;

export const isPlainObject = (value: unknown): value is Record<string, unknown> => 
  is.object(value) && value.constructor === Object;

/**
 * 类型断言函数
 */
export function assert(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    const error = createError.validation(message, 'assertion');
    globalErrorHandler.handle(error);
    throw error;
  }
}

export function assertType<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  message?: string
): asserts value is T {
  if (!typeGuard(value)) {
    const error = createError.validation(
      message || `Type assertion failed for value: ${String(value)}`,
      'type'
    );
    globalErrorHandler.handle(error, { value });
    throw error;
  }
}

/**
 * 安全类型转换
 */
export function safeParseInt(value: unknown, defaultValue = 0): number {
  if (is.number(value)) return Math.floor(value);
  if (is.string(value)) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeParseFloat(value: unknown, defaultValue = 0): number {
  if (is.number(value)) return value;
  if (is.string(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeParseBoolean(value: unknown, defaultValue = false): boolean {
  if (is.boolean(value)) return value;
  if (is.string(value)) {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  if (is.number(value)) {
    return value !== 0;
  }
  return defaultValue;
}

export function safeParseDate(value: unknown, defaultValue?: Date): Date | undefined {
  if (is.date(value)) return value;
  if (is.string(value) || is.number(value)) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  }
  return defaultValue;
}

/**
 * 对象属性类型检查
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return is.object(obj) && key in obj;
}

export function hasStringProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return hasProperty(obj, key) && is.string((obj as any)[key]);
}

export function hasNumberProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, number> {
  return hasProperty(obj, key) && is.number((obj as any)[key]);
}

export function hasBooleanProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, boolean> {
  return hasProperty(obj, key) && is.boolean((obj as any)[key]);
}

/**
 * 数组类型检查
 */
export function isArrayOf<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return is.array(value) && value.every(itemGuard);
}

export function isStringArray(value: unknown): value is string[] {
  return isArrayOf(value, is.string);
}

export function isNumberArray(value: unknown): value is number[] {
  return isArrayOf(value, is.number);
}

/**
 * 联合类型检查
 */
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  options: T
): value is T[number] {
  return options.includes(value);
}

/**
 * 深度类型检查
 */
export function validateObjectShape<T extends Record<string, unknown>>(
  obj: unknown,
  shape: { [K in keyof T]: (value: unknown) => value is T[K] }
): obj is T {
  if (!is.object(obj)) return false;
  
  for (const [key, validator] of Object.entries(shape)) {
    if (!hasProperty(obj, key) || !validator((obj as any)[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * 可选属性验证
 */
export function validateOptionalObjectShape<T extends Record<string, unknown>>(
  obj: unknown,
  shape: { [K in keyof T]?: (value: unknown) => value is T[K] }
): obj is Partial<T> {
  if (!is.object(obj)) return false;
  
  for (const [key, validator] of Object.entries(shape)) {
    if (hasProperty(obj, key) && validator && !validator((obj as any)[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * 运行时类型检查装饰器（用于方法参数验证）
 */
export function validateParams<T extends any[]>(
  validators: { [K in keyof T]: (value: unknown) => value is T[K] }
) {
  return function <TTarget, TKey extends string | symbol>(
    target: TTarget,
    propertyKey: TKey,
    descriptor: TypedPropertyDescriptor<(...args: T) => any>
  ) {
    const originalMethod = descriptor.value;
    
    if (originalMethod) {
      descriptor.value = function (this: TTarget, ...args: T) {
        // 验证参数
        for (let i = 0; i < validators.length; i++) {
          if (!validators[i](args[i])) {
            const error = createError.validation(
              `Parameter ${i} validation failed in method ${String(propertyKey)}`,
              'parameter'
            );
            globalErrorHandler.handle(error, { 
              methodName: String(propertyKey),
              parameterIndex: i,
              parameterValue: args[i]
            });
            throw error;
          }
        }
        
        return originalMethod.apply(this, args);
      } as any;
    }
    
    return descriptor;
  };
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T = unknown>(
  json: string,
  validator?: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    
    if (validator && !validator(parsed)) {
      globalErrorHandler.handle(
        createError.validation('JSON解析后类型验证失败', 'json'),
        { json, parsed }
      );
      return null;
    }
    
    return parsed;
  } catch (error) {
    globalErrorHandler.handle(
      createError.validation('JSON解析失败', 'json'),
      { json, originalError: error }
    );
    return null;
  }
}