# 安全系统使用指南

本项目实现了一套完整的安全系统，包括认证、授权、日志记录、监控和审计等功能。

## 🔒 安全功能概览

### 1. 依赖安全
- ✅ 修复了npm audit发现的ESLint相关安全漏洞
- ✅ 升级到ESLint 9.37.0，消除了所有已知漏洞

### 2. 安全响应头和CSP
- ✅ 实现了严格的Content Security Policy (CSP)
- ✅ 添加了完整的安全响应头配置
- ✅ 支持CSP nonce生成和动态内容安全

### 3. 现代化认证系统
- ✅ JWT token刷新机制
- ✅ 安全的token存储
- ✅ 自动过期处理
- ✅ 权限和角色管理

### 4. CSRF保护
- ✅ 双重提交cookie模式
- ✅ 时间戳验证
- ✅ 自动token生成和验证

### 5. 输入验证和XSS防护
- ✅ DOMPurify集成
- ✅ 服务端数据验证
- ✅ XSS、SQL注入、路径遍历检测
- ✅ 预定义验证规则

### 6. 环境变量安全
- ✅ 敏感数据加密
- ✅ 安全的环境变量加载
- ✅ 生产环境安全检查

### 7. 安全日志和审计
- ✅ 结构化安全日志
- ✅ 审计追踪
- ✅ 安全事件监控
- ✅ 实时威胁检测

## 🚀 快速开始

### 1. 初始化安全系统

```typescript
import { initializeAppSecurity } from '@/utils/securityIntegration';

// 在应用启动时调用
async function startApp() {
  try {
    await initializeAppSecurity();
    console.log('安全系统初始化完成');
  } catch (error) {
    console.error('安全系统初始化失败:', error);
  }
}
```

### 2. 使用认证系统

```typescript
import { authManager } from '@/utils/auth';

// 用户登录
const authState = await authManager.login('username', 'password');

// 检查认证状态
const isAuth = authManager.isAuthenticated();

// 获取有效的访问令牌
const token = await authManager.getValidAccessToken();

// 检查权限
const hasPermission = authManager.hasPermission('read:users');

// 用户登出
await authManager.logout();
```

### 3. 输入验证

```typescript
import { validateForm, sanitizeHtml } from '@/utils/validation';

// 表单验证
const result = await validateForm(formData, 'userRegistration');
if (!result.isValid) {
  console.log('验证错误:', result.errors);
}

// HTML内容清理
const cleanHtml = await sanitizeHtml(userInput);
```

### 4. 安全日志记录

```typescript
import { securityManager } from '@/utils/securityManager';
import { SecurityEventType } from '@/utils/logger';

// 记录安全事件
await securityManager.logSecurityEvent(
  SecurityEventType.LOGIN_SUCCESS,
  'low',
  '用户登录成功',
  { userId: 'user123' }
);

// 记录审计事件
await securityManager.logAuditEvent(
  'data_update',
  'user_profile',
  { userId: 'user123', changes: {...} }
);
```

### 5. CSRF保护

```typescript
import { validateCsrfToken } from '@/utils/security';

// 验证CSRF令牌
const isValid = validateCsrfToken(tokenFromHeader, tokenFromCookie);
```

## 📁 文件结构

```
src/
├── utils/
│   ├── auth.ts                 # JWT认证系统
│   ├── security.ts             # CSRF保护和输入验证
│   ├── validation.ts           # 数据验证工具
│   ├── encryption.ts           # 加密和环境变量安全
│   ├── logger.ts               # 安全日志系统
│   ├── monitoring.ts           # 安全监控和威胁检测
│   ├── securityManager.ts      # 安全管理器（统一接口）
│   └── securityIntegration.ts  # 安全集成示例
├── config/
│   └── security.ts             # 安全配置
├── middleware.ts               # 安全中间件
└── .env.example                # 环境变量示例
```

## ⚙️ 配置说明

### 环境变量配置

复制 `.env.example` 到 `.env` 并配置以下关键变量：

```bash
# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 加密配置
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-gcm

# CSRF配置
CSRF_SECRET=your-csrf-secret-key

# 安全配置
SECURITY_LEVEL=high
ENABLE_SECURITY_HEADERS=true
ENABLE_CSRF_PROTECTION=true
```

### 安全配置

在 `src/config/security.ts` 中可以调整各种安全设置：

```typescript
export const securityConfig = {
  jwt: {
    secret: SecureEnvLoader.get('JWT_SECRET'),
    expiresIn: SecureEnvLoader.get('JWT_EXPIRES_IN', '15m'),
    // ...
  },
  csrf: {
    secret: SecureEnvLoader.get('CSRF_SECRET'),
    // ...
  },
  // ...
};
```

## 🛡️ 安全最佳实践

### 1. 认证和授权
- 使用强密码策略
- 实施双因素认证
- 定期轮换JWT密钥
- 最小权限原则

### 2. 数据保护
- 所有敏感数据加密存储
- 使用HTTPS传输
- 实施数据脱敏
- 定期备份和恢复测试

### 3. 输入验证
- 服务端验证所有输入
- 使用白名单验证
- 防止SQL注入和XSS攻击
- 文件上传安全检查

### 4. 监控和日志
- 记录所有安全相关事件
- 实时监控异常行为
- 定期安全审计
- 建立事件响应流程

### 5. 环境安全
- 生产环境使用强加密
- 定期更新依赖
- 安全配置检查
- 访问控制和网络隔离

## 🔍 安全监控

### 实时威胁检测

系统会自动检测以下安全威胁：

- 异常登录模式
- 暴力破解攻击
- 权限提升尝试
- 数据访问异常
- 可疑的API调用
- 地理位置异常

### 安全仪表板

```typescript
import { getSecurityDashboardData } from '@/utils/securityIntegration';

const dashboardData = await getSecurityDashboardData();
console.log('安全状态:', dashboardData.securityStatus);
```

## 🚨 事件响应

当检测到安全威胁时，系统会：

1. 记录详细的安全事件日志
2. 根据威胁级别触发相应响应
3. 发送安全警报（如配置）
4. 自动阻止可疑活动（如配置）

## 📊 审计和合规

系统提供完整的审计追踪功能：

- 用户行为记录
- 数据访问日志
- 权限变更历史
- 系统配置变更
- 安全事件时间线

## 🔧 故障排除

### 常见问题

1. **JWT令牌过期**
   - 检查系统时间同步
   - 验证JWT配置
   - 确认刷新令牌机制

2. **CSRF验证失败**
   - 检查令牌生成和传递
   - 验证cookie设置
   - 确认时间戳有效性

3. **加密错误**
   - 验证加密密钥配置
   - 检查算法兼容性
   - 确认环境变量设置

### 调试模式

设置环境变量启用调试：

```bash
DEBUG_SECURITY=true
LOG_LEVEL=debug
```

## 📞 支持和维护

- 定期更新安全依赖
- 监控安全漏洞公告
- 执行安全代码审查
- 进行渗透测试
- 更新安全文档

---

**注意**: 这是一个基础的安全实现，生产环境中可能需要根据具体需求进行调整和增强。建议定期进行安全评估和更新。