/**
 * 安全工具函数
 * 提供XSS、CSRF防护和输入验证
 */

/**
 * XSS 防护 - HTML 转义
 */
export const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * XSS 防护 - 清理 HTML（使用DOMPurify）
 */
let DOMPurify: any = null;

// 动态导入DOMPurify（支持SSR）
const getDOMPurify = async () => {
  if (typeof window === 'undefined') {
    // 服务端环境
    const { JSDOM } = await import('jsdom');
    const createDOMPurify = (await import('dompurify')).default;
    const window = new JSDOM('').window;
    return createDOMPurify(window as any);
  } else {
    // 客户端环境
    if (!DOMPurify) {
      DOMPurify = (await import('dompurify')).default;
    }
    return DOMPurify;
  }
};

/**
 * 清理HTML内容
 */
export const sanitizeHtml = async (html: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
  strict?: boolean;
}): Promise<string> => {
  try {
    const purify = await getDOMPurify();
    
    const config: any = {
      ALLOWED_TAGS: options?.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'span'],
      ALLOWED_ATTR: options?.allowedAttributes || ['class'],
      KEEP_CONTENT: !options?.strict,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
    };
    
    if (options?.strict) {
      // 严格模式：只允许纯文本
      config.ALLOWED_TAGS = [];
      config.ALLOWED_ATTR = [];
    }
    
    return purify.sanitize(html, config);
  } catch {
    // 降级处理：移除所有HTML标签
    return html.replace(/<[^>]*>/g, '');
  }
};

/**
 * 同步版本的HTML清理（仅客户端，降级处理）
 */
export const sanitizeHtmlSync = (html: string): string => {
  if (typeof window !== 'undefined' && DOMPurify) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
      ALLOWED_ATTR: ['class'],
    });
  }
  // 降级处理
  return html.replace(/<[^>]*>/g, '');
};

/**
 * URL 验证
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * 邮箱验证
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 手机号验证（中国大陆）
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 输入长度限制
 */
export const validateLength = (str: string, min: number, max: number): boolean => {
  const len = str.trim().length;
  return len >= min && len <= max;
};

/**
 * SQL 注入防护 - 转义特殊字符
 */
export const escapeSql = (str: string): string => {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0';
      case '\x08':
        return '\\b';
      case '\x09':
        return '\\t';
      case '\x1a':
        return '\\z';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
};

/**
 * 增强的CSRF保护 - 双重提交cookie模式
 */

/**
 * CSRF Token 生成（增强版）
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 生成CSRF Token对（用于双重提交）
 */
export const generateCsrfTokenPair = (): { cookieToken: string; headerToken: string } => {
  const baseToken = generateCsrfToken();
  const timestamp = Date.now().toString();
  
  // Cookie中的token（由服务端设置为HttpOnly）
  const cookieToken = baseToken;
  
  // Header中的token（客户端可访问）
  const headerToken = btoa(`${baseToken}:${timestamp}`);
  
  return { cookieToken, headerToken };
};

/**
 * CSRF Token 验证（增强版）
 */
export const validateCsrfToken = (headerToken: string, cookieToken: string): boolean => {
  try {
    if (!headerToken || !cookieToken) return false;
    
    // 解码header token
    const decoded = atob(headerToken);
    const [token, timestamp] = decoded.split(':');
    
    // 验证token匹配
    if (token !== cookieToken) return false;
    
    // 验证时间戳（5分钟内有效）
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (now - tokenTime) <= fiveMinutes;
  } catch {
    return false;
  }
};

/**
 * 获取当前 CSRF Token（双重提交模式）
 */
export const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 从localStorage读取header token
  return localStorage.getItem('csrfHeaderToken');
};

/**
 * 获取Cookie中的CSRF Token
 */
export const getCsrfCookieToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookieMatch = document.cookie.match(/csrfToken=([^;]+)/);
  return cookieMatch ? cookieMatch[1] : null;
};

/**
 * 设置 CSRF Token（双重提交模式）
 */
export const setCsrfToken = (cookieToken: string, headerToken: string): void => {
  if (typeof window === 'undefined') return;
  
  // 设置cookie token（实际应由服务端设置为HttpOnly）
  document.cookie = `csrfToken=${cookieToken}; path=/; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
  
  // 设置header token到localStorage
  localStorage.setItem('csrfHeaderToken', headerToken);
};

/**
 * 初始化CSRF保护
 */
export const initCsrfProtection = (): void => {
  if (typeof window === 'undefined') return;
  
  const existingHeaderToken = getCsrfToken();
  const existingCookieToken = getCsrfCookieToken();
  
  // 如果没有token或token无效，生成新的
  if (!existingHeaderToken || !existingCookieToken || 
      !validateCsrfToken(existingHeaderToken, existingCookieToken)) {
    const { cookieToken, headerToken } = generateCsrfTokenPair();
    setCsrfToken(cookieToken, headerToken);
  }
};

/**
 * 验证请求的CSRF Token
 */
export const validateRequestCsrfToken = (request: Request): boolean => {
  const headerToken = request.headers.get('X-CSRF-Token');
  const cookieToken = parseCookieHeader(request.headers.get('Cookie') || '')['csrfToken'];
  
  if (!headerToken || !cookieToken) return false;
  
  return validateCsrfToken(headerToken, cookieToken);
};

/**
 * 解析Cookie头
 */
const parseCookieHeader = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
};

/**
 * 增强的输入验证器
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
  // 新增安全检查选项
  preventXSS?: boolean;
  preventSQLInjection?: boolean;
  preventPathTraversal?: boolean;
  preventCommandInjection?: boolean;
  preventHeaderInjection?: boolean;
  preventJWTManipulation?: boolean;
  preventParameterPollution?: boolean;
  allowedCharacters?: string; // 允许的字符集
  blacklistedWords?: string[]; // 黑名单词汇
}

/**
 * 检测潜在的XSS攻击
 */
const detectXSS = (value: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(value));
};

/**
 * 检测潜在的SQL注入
 */
const detectSQLInjection = (value: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b)\s+\w+\s*=\s*\w+/gi,
    /1\s*=\s*1/gi,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(value));
};

/**
  * 检测路径遍历攻击
  */
 const detectPathTraversal = (value: string): boolean => {
   const pathPatterns = [
     /\.\.\//g,
     /\.\.\\\//g,
     /%2e%2e%2f/gi,
     /%2e%2e%5c/gi,
     /\.\..%2f/gi,
     /\.\..%5c/gi,
   ];
   
   return pathPatterns.some(pattern => pattern.test(value));
 };

/**
 * 检测命令注入攻击
 */
const detectCommandInjection = (value: string): boolean => {
  const commandInjectionPatterns = [
    /[;&|`$(){}]/,             // 命令分隔符和执行符
    /\|\s*\w+/,                // 管道命令
    /&&\s*\w+/,                // AND命令链
    /;\s*\w+/,                 // 分号命令分隔
    /`[^`]*`/,                 // 反引号命令执行
    /\$\([^)]*\)/,             // $()命令替换
    /\bcat\b|\bls\b|\bwhoami\b|\bpwd\b/i, // 常见系统命令
    /\brm\b|\bdel\b|\bmkdir\b|\brmdir\b/i, // 文件操作命令
    /\bping\b|\bcurl\b|\bwget\b|\bnc\b/i,  // 网络命令
    /\becho\b|\bprintf\b|\beval\b/i,       // 输出和执行命令
  ];
  
  return commandInjectionPatterns.some(pattern => pattern.test(value));
};

/**
 * 检测HTTP头部注入
 */
const detectHeaderInjection = (value: string): boolean => {
  const headerInjectionPatterns = [
    /\r\n/,  // CRLF注入
    /\n/,    // LF注入
    /\r/,    // CR注入
    /\x0a/,  // 十六进制LF
    /\x0d/,  // 十六进制CR
    /\x0d\x0a/,  // 十六进制CRLF
    /%0a/i,  // URL编码的LF
    /%0d/i,  // URL编码的CR
    /%0d%0a/i,  // URL编码的CRLF
    /\u000a/,  // Unicode LF
    /\u000d/,  // Unicode CR
    // 检测常见的HTTP头部注入载荷
    /set-cookie:/i,
    /location:/i,
    /content-type:/i,
    /content-length:/i,
    /x-forwarded-for:/i,
    /x-real-ip:/i,
    /authorization:/i,
    /www-authenticate:/i,
  ];
  
  return headerInjectionPatterns.some(pattern => pattern.test(value));
};

/**
 * 检测JWT操作攻击
 */
const detectJWTManipulation = (token: string): boolean => {
  try {
    // 移除Bearer前缀
    const jwtToken = token.replace(/^Bearer\s+/i, '');
    
    // 检测明显的恶意载荷
    const maliciousPatterns = [
      /^null$/i,
      /^undefined$/i,
      /^true$/i,
      /^false$/i,
      /^admin$/i,
      /^root$/i,
      /^1$/,
      /^0$/,
    ];
    
    if (maliciousPatterns.some(pattern => pattern.test(jwtToken))) {
      return true;
    }
    
    // 检查JWT结构
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return true; // 无效的JWT结构
    }
    
    try {
      // 解析header
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      
      // 检测"none"算法攻击
      if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE') {
        return true;
      }
      
      // 检测空签名（"none"算法的变种）
      if (!parts[2] || parts[2] === '') {
        return true;
      }
      
      // 检测明显无效的签名
      const invalidSignatures = [
        'invalid',
        'fake',
        'test',
        'null',
        'undefined',
        'admin',
        'root',
        '123',
        'abc',
        'xxx',
      ];
      
      if (invalidSignatures.includes(parts[2].toLowerCase())) {
        return true;
      }
      
      // 检测过短的签名（正常的JWT签名应该比较长）
      if (parts[2].length < 10) {
        return true;
      }
      
      // 解析payload检测可疑内容
      try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // 检测可疑的用户身份
        if (payload.sub && typeof payload.sub === 'string') {
          const suspiciousUsers = ['admin', 'root', 'administrator', 'system'];
          if (suspiciousUsers.includes(payload.sub.toLowerCase())) {
            return true;
          }
        }
        
        // 检测异常的时间戳（过大或过小）
        if (payload.iat && typeof payload.iat === 'number') {
          const now = Math.floor(Date.now() / 1000);
          const maxFutureTime = now + (365 * 24 * 60 * 60); // 1年后
          const minPastTime = now - (10 * 365 * 24 * 60 * 60); // 10年前
          
          if (payload.iat > maxFutureTime || payload.iat < minPastTime) {
            return true;
          }
        }
        
      } catch {
          // 无法解析payload，可能是恶意构造的
          return true;
        }
        
      } catch {
        // 无法解析header，可能是恶意构造的
        return true;
      }
      
      return false;
    } catch {
      // 解析失败，认为是恶意的
      return true;
    }
};

/**
 * 检测参数污染攻击
 */
const detectParameterPollution = (value: string): boolean => {
  const pollutionPatterns = [
    /&.*=.*&.*=/,  // 重复参数模式
    /username=.*&username=/i,
    /user_id=.*&user_id=/i,
    /role=.*&role=/i,
    /auth=.*&auth=/i,
    /admin=.*&admin=/i,
    /privilege=.*&privilege=/i,
  ];
  
  return pollutionPatterns.some(pattern => pattern.test(value));
};

/**
 * 增强的速率限制管理器
 * 支持账户锁定、IP黑名单、渐进式延迟等高级保护功能
 */
class RateLimitManager {
  private attempts: Map<string, { 
    count: number; 
    firstAttempt: number; 
    blocked: boolean;
    lockoutUntil?: number;
    consecutiveFailures: number;
  }> = new Map();
  
  private ipBlacklist: Set<string> = new Set();
  private accountLockouts: Map<string, number> = new Map(); // username -> lockout until timestamp
  private suspiciousIPs: Map<string, { count: number; firstSeen: number }> = new Map();
  private globalAttackCounter: Map<string, { count: number; firstAttempt: number }> = new Map();
  
  /**
   * 检查纯IP级别的速率限制
   */
  checkIPRateLimit(ip: string, maxAttempts: number = 20, windowMs: number = 900000): {
    blocked: boolean;
    remainingAttempts: number;
    reason?: string;
  } {
    const now = Date.now();
    
    // 检查IP黑名单
    if (this.ipBlacklist.has(ip)) {
      return { 
        blocked: true, 
        remainingAttempts: 0, 
        reason: 'IP已被列入黑名单' 
      };
    }
    
    // 跟踪可疑IP活动
    this.trackSuspiciousIP(ip);
    if (this.isSuspiciousIP(ip)) {
      this.ipBlacklist.add(ip);
      return { 
        blocked: true, 
        remainingAttempts: 0, 
        reason: 'IP因可疑活动被阻止' 
      };
    }
    
    const record = this.attempts.get(ip);
    
    if (!record) {
      this.attempts.set(ip, { 
        count: 1, 
        firstAttempt: now, 
        blocked: false,
        consecutiveFailures: 1
      });
      return { blocked: false, remainingAttempts: maxAttempts - 1 };
    }
    
    // 检查时间窗口是否已过期
    if (now - record.firstAttempt > windowMs) {
      this.attempts.set(ip, { 
        count: 1, 
        firstAttempt: now, 
        blocked: false,
        consecutiveFailures: record.consecutiveFailures + 1
      });
      return { blocked: false, remainingAttempts: maxAttempts - 1 };
    }
    
    // 增加尝试次数
    record.count++;
    record.consecutiveFailures++;
    
    // 检查是否超过限制
    if (record.count > maxAttempts) {
      record.blocked = true;
      return { 
        blocked: true, 
        remainingAttempts: 0,
        reason: '超过IP级速率限制'
      };
    }
    
    return { blocked: false, remainingAttempts: maxAttempts - record.count };
  }

  /**
   * 检查是否应该阻止请求
   */
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 900000): { 
    blocked: boolean; 
    remainingAttempts: number;
    reason?: string;
    lockoutUntil?: number;
  } {
    const now = Date.now();
    const [ip, username] = identifier.split(':');
    
    // 1. 检查IP黑名单
    if (this.ipBlacklist.has(ip)) {
      return { 
        blocked: true, 
        remainingAttempts: 0, 
        reason: 'IP已被列入黑名单' 
      };
    }
    
    // 2. 检查账户锁定
    if (username && this.accountLockouts.has(username)) {
      const lockoutUntil = this.accountLockouts.get(username)!;
      if (now < lockoutUntil) {
        return { 
          blocked: true, 
          remainingAttempts: 0, 
          reason: '账户已被锁定',
          lockoutUntil 
        };
      } else {
        // 锁定期已过，移除锁定
        this.accountLockouts.delete(username);
      }
    }
    
    // 3. 检查IP级别的可疑活动
    this.trackSuspiciousIP(ip);
    if (this.isSuspiciousIP(ip)) {
      this.ipBlacklist.add(ip);
      return { 
        blocked: true, 
        remainingAttempts: 0, 
        reason: 'IP因可疑活动被阻止' 
      };
    }
    
    // 4. 常规速率限制检查
    const record = this.attempts.get(identifier);
    
    if (!record) {
      this.attempts.set(identifier, { 
        count: 1, 
        firstAttempt: now, 
        blocked: false,
        consecutiveFailures: 1
      });
      return { blocked: false, remainingAttempts: maxAttempts - 1 };
    }
    
    // 检查时间窗口是否已过期
    if (now - record.firstAttempt > windowMs) {
      // 重置计数，但保留连续失败记录用于渐进式惩罚
      this.attempts.set(identifier, { 
        count: 1, 
        firstAttempt: now, 
        blocked: false,
        consecutiveFailures: record.consecutiveFailures + 1
      });
      return { blocked: false, remainingAttempts: maxAttempts - 1 };
    }
    
    // 增加尝试次数
    record.count++;
    record.consecutiveFailures++;
    
    // 5. 渐进式惩罚：连续失败次数越多，限制越严格
    const adjustedMaxAttempts = Math.max(1, maxAttempts - Math.floor(record.consecutiveFailures / 5));
    
    // 检查是否超过限制
    if (record.count > adjustedMaxAttempts) {
      record.blocked = true;
      
      // 6. 实施账户锁定（如果有用户名）
      if (username && record.consecutiveFailures >= 10) {
        const lockoutDuration = this.calculateLockoutDuration(record.consecutiveFailures);
        const lockoutUntil = now + lockoutDuration;
        this.accountLockouts.set(username, lockoutUntil);
        
        return { 
          blocked: true, 
          remainingAttempts: 0,
          reason: '账户因多次失败尝试被锁定',
          lockoutUntil
        };
      }
      
      return { 
        blocked: true, 
        remainingAttempts: 0,
        reason: '超过速率限制'
      };
    }
    
    return { blocked: false, remainingAttempts: adjustedMaxAttempts - record.count };
  }
  
  /**
   * 跟踪可疑IP活动
   */
  private trackSuspiciousIP(ip: string): void {
    const now = Date.now();
    const record = this.suspiciousIPs.get(ip);
    
    if (!record) {
      this.suspiciousIPs.set(ip, { count: 1, firstSeen: now });
    } else {
      // 如果在1小时内
      if (now - record.firstSeen < 3600000) {
        record.count++;
      } else {
        // 重置计数
        this.suspiciousIPs.set(ip, { count: 1, firstSeen: now });
      }
    }
  }
  
  /**
   * 判断IP是否可疑
   */
  private isSuspiciousIP(ip: string): boolean {
    const record = this.suspiciousIPs.get(ip);
    if (!record) return false;
    
    const now = Date.now();
    // 1小时内超过50次请求认为可疑
    return (now - record.firstSeen < 3600000) && record.count > 50;
  }
  
  /**
   * 计算锁定持续时间（渐进式增加）
   */
  private calculateLockoutDuration(consecutiveFailures: number): number {
    // 基础锁定时间：15分钟
    const baseLockout = 15 * 60 * 1000;
    
    // 渐进式增加：每10次失败，锁定时间翻倍，最大24小时
    const multiplier = Math.min(Math.pow(2, Math.floor(consecutiveFailures / 10)), 96);
    
    return baseLockout * multiplier;
  }
  
  /**
   * 重置特定标识符的限制
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
    const [, username] = identifier.split(':');
    if (username) {
      this.accountLockouts.delete(username);
    }
  }
  
  /**
   * 添加IP到黑名单
   */
  blacklistIP(ip: string): void {
    this.ipBlacklist.add(ip);
  }
  
  /**
   * 从黑名单移除IP
   */
  removeFromBlacklist(ip: string): void {
    this.ipBlacklist.delete(ip);
  }
  
  /**
   * 获取账户锁定状态
   */
  getAccountLockoutStatus(username: string): { locked: boolean; lockoutUntil?: number } {
    const lockoutUntil = this.accountLockouts.get(username);
    if (!lockoutUntil) {
      return { locked: false };
    }
    
    const now = Date.now();
    if (now >= lockoutUntil) {
      this.accountLockouts.delete(username);
      return { locked: false };
    }
    
    return { locked: true, lockoutUntil };
  }
  
  /**
   * 清理过期的记录
   */
  cleanup(windowMs: number = 900000): void {
    const now = Date.now();
    
    // 清理过期的尝试记录
    for (const [key, record] of this.attempts.entries()) {
      if (now - record.firstAttempt > windowMs) {
        this.attempts.delete(key);
      }
    }
    
    // 清理过期的账户锁定
    for (const [username, lockoutUntil] of this.accountLockouts.entries()) {
      if (now >= lockoutUntil) {
        this.accountLockouts.delete(username);
      }
    }
    
    // 清理过期的可疑IP记录
    for (const [ip, record] of this.suspiciousIPs.entries()) {
      if (now - record.firstSeen > 3600000) { // 1小时
        this.suspiciousIPs.delete(ip);
      }
    }
  }
  
  /**
   * 检查分布式攻击
   */
  checkDistributedAttack(username: string, windowMs: number = 900000): {
    blocked: boolean;
    reason?: string;
  } {
    const now = Date.now();
    const record = this.globalAttackCounter.get(username);
    
    if (!record) {
      this.globalAttackCounter.set(username, { count: 1, firstAttempt: now });
      return { blocked: false };
    }
    
    // 检查时间窗口是否已过期
    if (now - record.firstAttempt > windowMs) {
      this.globalAttackCounter.set(username, { count: 1, firstAttempt: now });
      return { blocked: false };
    }
    
    // 增加尝试次数
    record.count++;
    
    // 如果同一用户在短时间内从多个IP尝试登录，视为分布式攻击
    if (record.count > 5) {
      return { 
        blocked: true, 
        reason: '检测到分布式暴力破解攻击' 
      };
    }
    
    return { blocked: false };
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    activeAttempts: number;
    blacklistedIPs: number;
    lockedAccounts: number;
    suspiciousIPs: number;
    globalAttacks: number;
  } {
    return {
      activeAttempts: this.attempts.size,
      blacklistedIPs: this.ipBlacklist.size,
      lockedAccounts: this.accountLockouts.size,
      suspiciousIPs: this.suspiciousIPs.size,
      globalAttacks: this.globalAttackCounter.size,
    };
  }
}

// 全局速率限制管理器实例
export const rateLimitManager = new RateLimitManager();

/**
 * 时序攻击防护
 */
export class TimingAttackProtection {
  private static readonly BASE_TIME_MS = 100; // 基础响应时间
  private static readonly RANDOM_RANGE_MS = 50; // 随机延迟范围
  
  /**
   * 安全的字符串比较，防止时序攻击
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
  
  /**
   * 添加随机化延迟以防止时序攻击
   */
  static async addConstantDelay(startTime: number): Promise<void> {
    const elapsed = Date.now() - startTime;
    
    // 添加随机延迟，使响应时间更难预测
    const randomDelay = Math.random() * this.RANDOM_RANGE_MS;
    const targetTime = this.BASE_TIME_MS + randomDelay;
    const delay = Math.max(0, targetTime - elapsed);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  /**
   * 为高风险操作添加额外延迟
   */
  static async addSecurityDelay(username: string): Promise<void> {
    const highRiskUsernames = [
      /^admin$/i, /^administrator$/i, /^root$/i, /^system$/i,
      /^test$/i, /^user$/i, /^guest$/i, /^demo$/i
    ];
    
    // 高风险用户名需要额外延迟
    if (highRiskUsernames.some(pattern => pattern.test(username))) {
      const extraDelay = 50 + Math.random() * 100; // 50-150ms额外延迟
      await new Promise(resolve => setTimeout(resolve, extraDelay));
    }
  }
  
  /**
   * 检测可能的时序攻击
   */
  static detectTimingAttack(username: string, responseTime: number): boolean {
    // 检测常见的时序攻击用户名模式
    const allRiskUsernames = [
      /^admin$/i,
      /^administrator$/i,
      /^root$/i,
      /^system$/i,
      /^test$/i,
      /^user$/i,
      /^guest$/i,
      /^demo$/i,
      /^sa$/i,
      /^postgres$/i,
      /^mysql$/i,
      /^oracle$/i,
      /^support$/i,
      /^service$/i,
      /^operator$/i,
      /^manager$/i,
      /^supervisor$/i,
    ];
    
    // 检测是否为风险用户名
    const isRiskUsername = allRiskUsernames.some(pattern => pattern.test(username));
    
    // 检测数字用户名（常见的枚举攻击）
    const isNumericUsername = /^\d+$/.test(username);
    
    // 检测单字符用户名（枚举攻击）
    const isSingleChar = username.length === 1;
    
    // 检测常见攻击模式
    const isSuspiciousPattern = isRiskUsername || isNumericUsername || isSingleChar;
    
    // 如果是可疑模式且响应时间快，判定为时序攻击
    if (isSuspiciousPattern && responseTime < 50) {
      return true;
    }
    
    // 对于非常快的响应时间，即使用户名看起来正常也要警惕
    if (responseTime < 5) {
      return true;
    }
    
    return false;
  }
}

/**
 * 增强的输入验证
 */
export const validateInput = (value: string, rules: ValidationRule): { valid: boolean; message?: string } => {
  // 基础验证
  if (rules.required && !value.trim()) {
    return { valid: false, message: rules.message || '此字段为必填项' };
  }
  
  // 如果值为空且非必填，直接通过
  if (!value.trim() && !rules.required) {
    return { valid: true };
  }
  
  // 长度验证
  if (rules.minLength && value.length < rules.minLength) {
    return { valid: false, message: rules.message || `最少${rules.minLength}个字符` };
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return { valid: false, message: rules.message || `最多${rules.maxLength}个字符` };
  }
  
  // 安全检查
  if (rules.preventXSS && detectXSS(value)) {
    return { valid: false, message: '输入内容包含潜在的安全风险' };
  }
  
  if (rules.preventSQLInjection && detectSQLInjection(value)) {
    return { valid: false, message: '输入内容包含非法字符' };
  }
  
  if (rules.preventPathTraversal && detectPathTraversal(value)) {
    return { valid: false, message: '输入内容包含非法路径字符' };
  }
  
  if (rules.preventCommandInjection && detectCommandInjection(value)) {
    return { valid: false, message: '输入内容包含潜在的命令注入风险' };
  }
  
  if (rules.preventHeaderInjection && detectHeaderInjection(value)) {
    return { valid: false, message: '输入内容包含HTTP头部注入风险' };
  }
  
  if (rules.preventJWTManipulation && detectJWTManipulation(value)) {
    return { valid: false, message: '输入内容包含JWT操作攻击风险' };
  }
  
  if (rules.preventParameterPollution && detectParameterPollution(value)) {
    return { valid: false, message: '输入内容包含参数污染攻击风险' };
  }
  
  // 字符集验证
  if (rules.allowedCharacters) {
    const allowedRegex = new RegExp(`^[${rules.allowedCharacters}]*$`);
    if (!allowedRegex.test(value)) {
      return { valid: false, message: '输入内容包含不允许的字符' };
    }
  }
  
  // 黑名单词汇检查
  if (rules.blacklistedWords && rules.blacklistedWords.length > 0) {
    const lowerValue = value.toLowerCase();
    const foundBlacklisted = rules.blacklistedWords.find(word => 
      lowerValue.includes(word.toLowerCase())
    );
    if (foundBlacklisted) {
      return { valid: false, message: '输入内容包含禁用词汇' };
    }
  }
  
  // 正则验证
  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: rules.message || '格式不正确' };
  }
  
  // 自定义验证
  if (rules.custom && !rules.custom(value)) {
    return { valid: false, message: rules.message || '验证失败' };
  }
  
  return { valid: true };
};

/**
 * 预定义的安全验证规则
 */
export const securityValidationRules = {
  // 用户名：只允许字母、数字、下划线、连字符
  username: {
    minLength: 3,
    maxLength: 20,
    allowedCharacters: 'a-zA-Z0-9_-',
    preventXSS: true,
    preventSQLInjection: true,
  },
  
  // 密码：强密码要求
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    preventXSS: true,
    message: '密码必须包含大小写字母、数字和特殊字符',
  },
  
  // 邮箱
  email: {
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    preventXSS: true,
    preventSQLInjection: true,
  },
  
  // 一般文本输入
  text: {
    maxLength: 1000,
    preventXSS: true,
    preventSQLInjection: true,
    preventPathTraversal: true,
    preventCommandInjection: true,
    preventHeaderInjection: true,
  },
  
  // 富文本内容
  richText: {
    maxLength: 10000,
    preventSQLInjection: true,
    preventPathTraversal: true,
    // 注意：富文本不阻止XSS，而是通过DOMPurify清理
  },
  
  // 文件名
  filename: {
    maxLength: 255,
    allowedCharacters: 'a-zA-Z0-9._-',
    preventPathTraversal: true,
    blacklistedWords: ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'lpt1', 'lpt2'],
  },

  // HTTP头部验证规则
  httpHeader: {
    maxLength: 1000,
    preventXSS: true,
    preventSQLInjection: true,
    preventPathTraversal: true,
    preventCommandInjection: true,
    preventHeaderInjection: true,
  },

  // JWT令牌验证规则
  jwtToken: {
    required: true,
    maxLength: 2048,
    preventJWTManipulation: true,
    preventXSS: true,
    preventSQLInjection: true,
  },

  // 认证参数验证规则
  authParameter: {
    maxLength: 500,
    preventParameterPollution: true,
    preventXSS: true,
    preventSQLInjection: true,
    preventCommandInjection: true,
  },
} as const;

/**
 * 防止点击劫持 - 检查是否在 iframe 中
 */
export const preventClickjacking = (): void => {
  if (typeof window === 'undefined') return;
  
  if (window.self !== window.top) {
    // 页面在 iframe 中，跳转到顶层

  }
};

/**
 * Content Security Policy 辅助函数
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

