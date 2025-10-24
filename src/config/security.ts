/**
 * 安全配置管理
 * 集中管理所有安全相关的配置
 */

import { SecureEnvLoader } from '@/utils/encryption';

/**
 * JWT配置
 */
export const jwtConfig = {
  accessSecret: SecureEnvLoader.get('JWT_SECRET'),
  refreshSecret: SecureEnvLoader.get('JWT_REFRESH_SECRET'),
  accessExpiresIn: SecureEnvLoader.get('JWT_ACCESS_EXPIRES_IN', '15m'),
  refreshExpiresIn: SecureEnvLoader.get('JWT_REFRESH_EXPIRES_IN', '7d'),
  issuer: SecureEnvLoader.get('JWT_ISSUER', 'front-base-app'),
  audience: SecureEnvLoader.get('JWT_AUDIENCE', 'front-base-users'),
};

/**
 * CSRF配置
 */
export const csrfConfig = {
  secret: SecureEnvLoader.get('CSRF_SECRET'),
  cookieName: '_csrf',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
  maxAge: 3600000, // 1小时
};

/**
 * 会话配置
 */
export const sessionConfig = {
  secret: SecureEnvLoader.get('SESSION_SECRET'),
  maxAge: SecureEnvLoader.getNumber('SESSION_MAX_AGE', 86400000), // 24小时
  secure: SecureEnvLoader.getBoolean('SESSION_SECURE', process.env.NODE_ENV === 'production'),
  httpOnly: true,
  sameSite: 'strict' as const,
};

/**
 * 密码策略配置
 */
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&',
  maxAttempts: 5,
  lockoutDuration: 900000, // 15分钟
  historyCount: 5, // 记住最近5个密码
};

/**
 * 速率限制配置
 */
export const rateLimitConfig = {
  windowMs: SecureEnvLoader.getNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15分钟
  maxRequests: SecureEnvLoader.getNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  // 特定端点的限制
  endpoints: {
    login: {
      windowMs: 900000, // 15分钟
      maxRequests: 5, // 最多5次登录尝试
    },
    register: {
      windowMs: 3600000, // 1小时
      maxRequests: 3, // 最多3次注册尝试
    },
    passwordReset: {
      windowMs: 3600000, // 1小时
      maxRequests: 3, // 最多3次密码重置
    },
    api: {
      windowMs: 900000, // 15分钟
      maxRequests: 1000, // API调用限制
    },
  },
};

/**
 * 文件上传安全配置
 */
export const fileUploadConfig = {
  maxSize: SecureEnvLoader.getNumber('UPLOAD_MAX_SIZE', 10485760), // 10MB
  allowedTypes: SecureEnvLoader.get('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  uploadPath: SecureEnvLoader.get('UPLOAD_PATH', './uploads'),
  virusScanEnabled: SecureEnvLoader.getBoolean('VIRUS_SCAN_ENABLED', false),
  quarantinePath: SecureEnvLoader.get('QUARANTINE_PATH', './quarantine'),
  // 文件名安全配置
  sanitizeFilenames: true,
  maxFilenameLength: 255,
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'],
  blockedExtensions: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.jar'],
};

/**
 * 内容安全策略(CSP)配置
 */
export const cspConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // 开发环境需要，生产环境应移除
    "'unsafe-eval'", // 开发环境需要，生产环境应移除
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  imgSrc: [
    "'self'",
    'data:',
    'blob:',
    'https:',
  ],
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
  ],
  connectSrc: [
    "'self'",
    SecureEnvLoader.get('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3001'),
  ],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  manifestSrc: ["'self'"],
  workerSrc: ["'self'"],
  childSrc: ["'none'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  upgradeInsecureRequests: process.env.NODE_ENV === 'production',
  reportUri: SecureEnvLoader.get('SECURITY_CSP_REPORT_URI', ''),
};

/**
 * HTTPS安全配置
 */
export const httpsConfig = {
  hsts: {
    maxAge: SecureEnvLoader.getNumber('SECURITY_HSTS_MAX_AGE', 31536000), // 1年
    includeSubDomains: true,
    preload: true,
  },
  forceHttps: process.env.NODE_ENV === 'production',
  trustProxy: SecureEnvLoader.getBoolean('TRUST_PROXY', false),
};

/**
 * 跨域配置
 */
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [SecureEnvLoader.get('PRODUCTION_DOMAIN', 'https://front-base.vercel.app')]
    : [
        SecureEnvLoader.get('NEXT_PUBLIC_DEV_DOMAIN', 'http://localhost:3001'),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24小时
};

/**
 * 日志安全配置
 */
export const loggingConfig = {
  level: SecureEnvLoader.get('LOG_LEVEL', 'info'),
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
    'csrf',
    'ssn',
    'creditCard',
    'bankAccount',
  ],
  maxLogSize: '100MB',
  maxFiles: 30,
  auditLog: {
    enabled: true,
    events: [
      'login',
      'logout',
      'register',
      'password_change',
      'password_reset',
      'permission_change',
      'data_access',
      'data_modification',
      'security_violation',
    ],
  },
};

/**
 * 数据库安全配置
 */
export const databaseConfig = {
  ssl: SecureEnvLoader.getBoolean('DATABASE_SSL', process.env.NODE_ENV === 'production'),
  poolMin: SecureEnvLoader.getNumber('DATABASE_POOL_MIN', 2),
  poolMax: SecureEnvLoader.getNumber('DATABASE_POOL_MAX', 10),
  connectionTimeout: 30000,
  idleTimeout: 300000,
  // 查询超时
  queryTimeout: 30000,
  // 连接加密
  encrypt: process.env.NODE_ENV === 'production',
};

/**
 * 监控和告警配置
 */
export const monitoringConfig = {
  sentryDsn: SecureEnvLoader.get('SENTRY_DSN', ''),
  analyticsId: SecureEnvLoader.get('ANALYTICS_ID', ''),
  healthCheckInterval: 60000, // 1分钟
  alertThresholds: {
    errorRate: 0.05, // 5%错误率
    responseTime: 5000, // 5秒响应时间
    memoryUsage: 0.9, // 90%内存使用率
    cpuUsage: 0.8, // 80%CPU使用率
  },
};

/**
 * 安全头配置
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0', // 禁用，使用CSP代替
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
};

/**
 * 验证所有安全配置
 */
export const validateSecurityConfig = (): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // 验证JWT配置
  if (jwtConfig.accessSecret === jwtConfig.refreshSecret) {
    issues.push('JWT access and refresh secrets should be different');
  }
  
  // 验证生产环境配置
  if (process.env.NODE_ENV === 'production') {
    if (!httpsConfig.forceHttps) {
      issues.push('HTTPS should be enforced in production');
    }
    
    if (cspConfig.scriptSrc.includes("'unsafe-inline'") || cspConfig.scriptSrc.includes("'unsafe-eval'")) {
      issues.push('Unsafe CSP directives should not be used in production');
    }
    
    if (!sessionConfig.secure) {
      issues.push('Session cookies should be secure in production');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * 导出所有配置
 */
export const securityConfig = {
  jwt: jwtConfig,
  csrf: csrfConfig,
  session: sessionConfig,
  password: passwordPolicy,
  rateLimit: rateLimitConfig,
  fileUpload: fileUploadConfig,
  csp: cspConfig,
  https: httpsConfig,
  cors: corsConfig,
  logging: loggingConfig,
  database: databaseConfig,
  monitoring: monitoringConfig,
  headers: securityHeaders,
};