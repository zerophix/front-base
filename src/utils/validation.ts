/**
 * 服务端数据验证工具
 * 提供统一的数据验证接口，确保前后端验证一致性
 */

import { validateInput, ValidationRule, securityValidationRules } from '@/utils/security';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData?: Record<string, any>;
}

/**
 * 字段验证配置
 */
export interface FieldValidation {
  rules: ValidationRule;
  sanitize?: boolean; // 是否需要清理数据
  transform?: (value: any) => any; // 数据转换函数
}

/**
 * 表单验证配置
 */
export interface FormValidationSchema {
  [fieldName: string]: FieldValidation;
}

/**
 * 数据清理选项
 */
export interface SanitizeOptions {
  trim?: boolean; // 去除首尾空格
  toLowerCase?: boolean; // 转换为小写
  toUpperCase?: boolean; // 转换为大写
  removeSpecialChars?: boolean; // 移除特殊字符
  maxLength?: number; // 截断到最大长度
}

/**
 * 清理字符串数据
 */
export const sanitizeString = (value: string, options: SanitizeOptions = {}): string => {
  let result = value;
  
  if (options.trim) {
    result = result.trim();
  }
  
  if (options.toLowerCase) {
    result = result.toLowerCase();
  }
  
  if (options.toUpperCase) {
    result = result.toUpperCase();
  }
  
  if (options.removeSpecialChars) {
    result = result.replace(/[^\w\s\u4e00-\u9fff]/g, ''); // 保留字母、数字、空格、中文
  }
  
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }
  
  return result;
};

/**
 * 验证单个字段
 */
export const validateField = (
  fieldName: string,
  value: any,
  validation: FieldValidation
): { valid: boolean; message?: string; sanitizedValue?: any } => {
  // 类型转换
  let processedValue = value;
  if (validation.transform) {
    processedValue = validation.transform(value);
  }
  
  // 字符串处理
  if (typeof processedValue === 'string') {
    processedValue = processedValue.trim();
  }
  
  // 验证
  const result = validateInput(processedValue, validation.rules);
  
  // 数据清理
  let sanitizedValue = processedValue;
  if (result.valid && validation.sanitize && typeof processedValue === 'string') {
    // 基础清理：去除首尾空格，防止XSS
    sanitizedValue = sanitizeString(processedValue, { trim: true });
  }
  
  return {
    valid: result.valid,
    message: result.message,
    sanitizedValue: result.valid ? sanitizedValue : undefined,
  };
};

/**
 * 验证整个表单
 */
export const validateForm = (
  data: Record<string, any>,
  schema: FormValidationSchema
): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  let isValid = true;
  
  // 验证每个字段
  for (const [fieldName, validation] of Object.entries(schema)) {
    const fieldValue = data[fieldName];
    const fieldResult = validateField(fieldName, fieldValue, validation);
    
    if (!fieldResult.valid) {
      errors[fieldName] = fieldResult.message || '验证失败';
      isValid = false;
    } else if (fieldResult.sanitizedValue !== undefined) {
      sanitizedData[fieldName] = fieldResult.sanitizedValue;
    } else {
      sanitizedData[fieldName] = fieldValue;
    }
  }
  
  return {
    valid: isValid,
    errors,
    sanitizedData: isValid ? sanitizedData : undefined,
  };
};

/**
 * 预定义的表单验证模式
 */
export const formValidationSchemas = {
  // 用户注册表单
  userRegistration: {
    username: {
      rules: securityValidationRules.username,
      sanitize: true,
      transform: (value: string) => value?.toLowerCase(),
    },
    email: {
      rules: securityValidationRules.email,
      sanitize: true,
      transform: (value: string) => value?.toLowerCase(),
    },
    password: {
      rules: securityValidationRules.password,
      sanitize: false, // 密码不清理，保持原样
    },
    confirmPassword: {
      rules: {
        required: true,
        custom: (_value: string) => {
          // 这里需要在实际使用时传入原密码进行比较
          return true; // 占位符，实际实现需要访问其他字段
        },
        message: '两次密码输入不一致',
      },
    },
  },
  
  // 用户登录表单
  userLogin: {
    username: {
      rules: {
        required: true,
        maxLength: 100,
        preventXSS: true,
        preventSQLInjection: true,
      },
      sanitize: true,
      transform: (value: string) => value?.toLowerCase(),
    },
    password: {
      rules: {
        required: true,
        maxLength: 128,
        preventXSS: true,
      },
      sanitize: false,
    },
  },
  
  // 个人信息表单
  userProfile: {
    name: {
      rules: {
        required: true,
        maxLength: 50,
        preventXSS: true,
        preventSQLInjection: true,
        allowedCharacters: 'a-zA-Z0-9\u4e00-\u9fff\\s',
      },
      sanitize: true,
    },
    phone: {
      rules: {
        pattern: /^1[3-9]\d{9}$/,
        preventXSS: true,
        preventSQLInjection: true,
      },
      sanitize: true,
    },
    bio: {
      rules: securityValidationRules.text,
      sanitize: true,
    },
  },
  
  // 文件上传表单
  fileUpload: {
    filename: {
      rules: securityValidationRules.filename,
      sanitize: true,
    },
    description: {
      rules: securityValidationRules.text,
      sanitize: true,
    },
  },
} as const;

/**
 * API请求数据验证中间件工具
 */
export const createValidationMiddleware = (schema: FormValidationSchema) => {
  return (data: Record<string, any>) => {
    const result = validateForm(data, schema);
    
    if (!result.valid) {
      throw new Error(`验证失败: ${Object.values(result.errors).join(', ')}`);
    }
    
    return result.sanitizedData;
  };
};

/**
 * 批量验证工具
 */
export const validateBatch = (
  items: Record<string, any>[],
  schema: FormValidationSchema
): { valid: boolean; results: ValidationResult[]; validItems: Record<string, any>[] } => {
  const results = items.map(item => validateForm(item, schema));
  const validItems = results
    .filter(result => result.valid)
    .map(result => result.sanitizedData!)
    .filter(Boolean);
  
  return {
    valid: results.every(result => result.valid),
    results,
    validItems,
  };
};