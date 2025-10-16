/**
 * 加密工具
 * 提供敏感数据的加密和解密功能
 */

import crypto from 'crypto';

/**
 * 加密配置
 */
interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

/**
 * 默认加密配置
 */
const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
};

/**
 * 加密结果
 */
interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag?: string; // GCM模式的认证标签
}

/**
 * 环境变量管理器
 */
class EnvironmentManager {
  private static instance: EnvironmentManager;
  private encryptionKey: Buffer | null = null;
  
  private constructor() {
    this.initializeEncryptionKey();
  }
  
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }
  
  /**
   * 初始化加密密钥
   */
  private initializeEncryptionKey(): void {
    const keyString = process.env.ENCRYPTION_KEY;
    
    if (!keyString) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY environment variable is required in production');
      }
      // 开发环境使用默认密钥（不安全，仅用于开发）
      console.warn('⚠️  Using default encryption key in development mode');
      this.encryptionKey = crypto.scryptSync('default-dev-key', 'salt', 32);
      return;
    }
    
    if (keyString.length !== 64) { // 32字节的十六进制字符串
      throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)');
    }
    
    try {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } catch (error) {
      throw new Error('Invalid ENCRYPTION_KEY format. Must be a valid hex string');
    }
  }
  
  /**
   * 获取加密密钥
   */
  public getEncryptionKey(): Buffer {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }
    return this.encryptionKey;
  }
  
  /**
   * 生成新的加密密钥
   */
  public static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * 验证环境变量安全性
   */
  public validateEnvironmentSecurity(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 检查必需的安全环境变量
    const requiredSecurityVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'CSRF_SECRET',
      'SESSION_SECRET',
    ];
    
    for (const varName of requiredSecurityVars) {
      const value = process.env[varName];
      if (!value) {
        issues.push(`Missing required security variable: ${varName}`);
      } else if (value.length < 32) {
        issues.push(`Security variable ${varName} is too short (minimum 32 characters)`);
      } else if (value.includes('change-this') || value.includes('your-')) {
        issues.push(`Security variable ${varName} appears to use default/placeholder value`);
      }
    }
    
    // 检查生产环境特定要求
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ENCRYPTION_KEY) {
        issues.push('ENCRYPTION_KEY is required in production');
      }
      
      if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
        issues.push('JWT_SECRET and JWT_REFRESH_SECRET should be different');
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

/**
 * 加密工具类
 */
export class EncryptionUtils {
  private static envManager = EnvironmentManager.getInstance();
  
  /**
   * 加密数据
   */
  public static encrypt(
    data: string,
    config: Partial<EncryptionConfig> = {}
  ): EncryptionResult {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const key = this.envManager.getEncryptionKey();
    const iv = crypto.randomBytes(finalConfig.ivLength);
    
    const cipher = crypto.createCipheriv(finalConfig.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const result: EncryptionResult = {
      encrypted,
      iv: iv.toString('hex'),
    };
    
    // GCM模式需要认证标签
    if (finalConfig.algorithm.includes('gcm')) {
      result.tag = (cipher as any).getAuthTag().toString('hex');
    }
    
    return result;
  }
  
  /**
   * 解密数据
   */
  public static decrypt(
    encryptionResult: EncryptionResult,
    config: Partial<EncryptionConfig> = {}
  ): string {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const key = this.envManager.getEncryptionKey();
    const iv = Buffer.from(encryptionResult.iv, 'hex');
    
    const decipher = crypto.createDecipheriv(finalConfig.algorithm, key, iv);
    
    // GCM模式需要设置认证标签
    if (finalConfig.algorithm.includes('gcm') && encryptionResult.tag) {
      (decipher as any).setAuthTag(Buffer.from(encryptionResult.tag, 'hex'));
    }
    
    let decrypted = decipher.update(encryptionResult.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * 加密敏感的环境变量值
   */
  public static encryptEnvValue(value: string): string {
    const result = this.encrypt(value);
    return JSON.stringify(result);
  }
  
  /**
   * 解密敏感的环境变量值
   */
  public static decryptEnvValue(encryptedValue: string): string {
    try {
      const result: EncryptionResult = JSON.parse(encryptedValue);
      return this.decrypt(result);
    } catch (error) {
      throw new Error('Invalid encrypted environment value format');
    }
  }
  
  /**
   * 生成安全的随机密钥
   */
  public static generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * 哈希密码（用于存储）
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }
  
  /**
   * 验证密码
   */
  public static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
  
  /**
   * 生成安全的随机令牌
   */
  public static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }
}

/**
 * 安全的环境变量获取器
 */
export class SecureEnvLoader {
  private static cache = new Map<string, string>();
  
  /**
   * 安全地获取环境变量
   */
  public static get(key: string, defaultValue?: string): string {
    // 从缓存获取
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    const value = process.env[key];
    
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Required environment variable ${key} is not set`);
    }
    
    // 检查是否是加密值
    if (value.startsWith('{') && value.includes('encrypted')) {
      try {
        const decrypted = EncryptionUtils.decryptEnvValue(value);
        this.cache.set(key, decrypted);
        return decrypted;
      } catch (error) {
        throw new Error(`Failed to decrypt environment variable ${key}`);
      }
    }
    
    this.cache.set(key, value);
    return value;
  }
  
  /**
   * 获取数字类型的环境变量
   */
  public static getNumber(key: string, defaultValue?: number): number {
    const value = this.get(key, defaultValue?.toString());
    const parsed = parseInt(value, 10);
    
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} is not a valid number`);
    }
    
    return parsed;
  }
  
  /**
   * 获取布尔类型的环境变量
   */
  public static getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get(key, defaultValue?.toString());
    return value.toLowerCase() === 'true';
  }
  
  /**
   * 清除缓存
   */
  public static clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * 验证所有必需的环境变量
   */
  public static validateRequired(requiredVars: string[]): void {
    const missing: string[] = [];
    
    for (const varName of requiredVars) {
      try {
        this.get(varName);
      } catch (error) {
        missing.push(varName);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * 导出环境管理器实例
 */
export const envManager = EnvironmentManager.getInstance();

/**
 * 导出便捷函数
 */
export const generateEncryptionKey = EnvironmentManager.generateEncryptionKey;
export const validateEnvironmentSecurity = () => envManager.validateEnvironmentSecurity();