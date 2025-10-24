/**
 * API配置文件
 * 统一管理所有API端点和URL配置，避免硬编码
 */

/**
 * 获取API基础URL
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // 服务端渲染时使用的URL
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  }

  // 客户端根据环境变量或当前域名配置
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
};

/**
 * 获取内网穿透地址
 */
export const getNatappBaseUrl = (): string => {
  return process.env.NATAPP_BASE_URL || 'http://dolphinmind.natapp1.cc';
};

/**
 * API版本配置
 */
export const API_VERSION = {
  V1: 'v1',
  V2: 'v2',
} as const;

/**
 * API端点配置
 */
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    ACCOUNT_LOGIN: '/v1/login/account', // 账号密码登录
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // 微信登录相关
  WECHAT: {
    QR_CODE: `/v1/login/wechat_qrcode_url`,
    CHECK_LOGIN: `/v1/login/wechat_check_login`,
    BIND: `/v1/wechat/bind`,
    UNBIND: `/v1/wechat/unbind`,
  },
  
  // 用户管理
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // 项目管理
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  
  // 设备管理
  EQUIPMENT: {
    LIST: '/equipment',
    DETAIL: (id: string) => `/equipment/${id}`,
    CREATE: '/equipment',
    UPDATE: (id: string) => `/equipment/${id}`,
    DELETE: (id: string) => `/equipment/${id}`,
    MAINTENANCE: (id: string) => `/equipment/${id}/maintenance`,
  },
  
  // 人员管理
  PERSONNEL: {
    LIST: '/personnel',
    DETAIL: (id: string) => `/personnel/${id}`,
    CREATE: '/personnel',
    UPDATE: (id: string) => `/personnel/${id}`,
    DELETE: (id: string) => `/personnel/${id}`,
    TRAINING: (id: string) => `/personnel/${id}/training`,
  },
  
  // 质量管理
  QUALITY: {
    LIST: '/quality',
    DETAIL: (id: string) => `/quality/${id}`,
    CREATE: '/quality',
    UPDATE: (id: string) => `/quality/${id}`,
    DELETE: (id: string) => `/quality/${id}`,
    REPORTS: '/quality/reports',
  },
  
  // 记录管理
  RECORDS: {
    LIST: '/records',
    DETAIL: (id: string) => `/records/${id}`,
    CREATE: '/records',
    UPDATE: (id: string) => `/records/${id}`,
    DELETE: (id: string) => `/records/${id}`,
    EXPORT: '/records/export',
  },
  
  // 数据分析
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    PERFORMANCE: '/analytics/performance',
    TRENDS: '/analytics/trends',
    REPORTS: '/analytics/reports',
  },
  
  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
  },
  
  // 系统配置
  SYSTEM: {
    CONFIG: '/system/config',
    HEALTH: '/system/health',
    VERSION: '/system/version',
  },
} as const;

/**
 * 构建完整的API URL
 */
export const buildApiUrl = (endpoint: string, version: string = API_VERSION.V1): string => {
  const baseUrl = getApiBaseUrl();
  const versionPrefix = version ? `/${version}` : '';
  
  // 如果endpoint已经包含版本号，则不添加
  if (endpoint.startsWith('/v1/') || endpoint.startsWith('/v2/')) {
    return `${baseUrl}${endpoint}`;
  }
  
  return `${baseUrl}${versionPrefix}${endpoint}`;
};

/**
 * 获取微信登录相关URL
 */
export const getWeChatUrls = () => ({
  qrCode: buildApiUrl(API_ENDPOINTS.WECHAT.QR_CODE, ''),
  checkLogin: buildApiUrl(API_ENDPOINTS.WECHAT.CHECK_LOGIN, ''),
  bind: buildApiUrl(API_ENDPOINTS.WECHAT.BIND, ''),
  unbind: buildApiUrl(API_ENDPOINTS.WECHAT.UNBIND, ''),
});

/**
 * 环境配置
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API配置
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  enableMockApi: process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true',
  
  // 功能开关
  enableWeChatLogin: process.env.NEXT_PUBLIC_ENABLE_WECHAT_LOGIN === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  
  // 外部服务
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
} as const;

/**
 * 默认请求配置
 */
export const DEFAULT_REQUEST_CONFIG = {
  timeout: ENV_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
} as const;