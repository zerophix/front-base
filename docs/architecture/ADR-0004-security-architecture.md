# ADR-0004: 安全架构设计

## 状态
已采用

## 背景

企业级应用面临多种安全威胁，包括但不限于：

1. **身份认证攻击** - 暴力破解、凭证填充、会话劫持
2. **注入攻击** - SQL注入、XSS、CSRF
3. **数据泄露** - 敏感信息暴露、未授权访问
4. **拒绝服务** - DDoS、资源耗尽攻击
5. **供应链攻击** - 依赖包漏洞、第三方服务风险

传统的安全措施往往是事后补救，缺乏系统性的安全架构设计。

## 决策

采用**纵深防御**的安全架构，在应用的各个层次实施安全控制：

### 安全架构层次

```
┌─────────────────────────────────────────┐
│           用户界面层                      │
│  • CSP策略  • XSS防护  • 输入验证        │
├─────────────────────────────────────────┤
│           应用逻辑层                      │
│  • 身份认证  • 授权控制  • 会话管理       │
├─────────────────────────────────────────┤
│           API接口层                      │
│  • 速率限制  • CSRF防护  • 参数验证      │
├─────────────────────────────────────────┤
│           基础设施层                      │
│  • HTTPS强制  • 安全头  • 环境隔离       │
└─────────────────────────────────────────┘
```

### 核心安全组件

#### 1. 身份认证系统
```typescript
// src/config/security.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '24h',
    algorithm: 'HS256' as const,
    issuer: 'front-base-app',
    audience: 'front-base-users'
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15分钟
  }
};
```

#### 2. 速率限制系统
```typescript
// 渐进式惩罚机制
export class ProgressivePenaltyRateLimit {
  private attempts = new Map<string, number>();
  private lockouts = new Map<string, number>();
  
  async checkLimit(identifier: string): Promise<boolean> {
    const now = Date.now();
    const attemptCount = this.attempts.get(identifier) || 0;
    
    // 检查是否在锁定期
    const lockoutUntil = this.lockouts.get(identifier);
    if (lockoutUntil && now < lockoutUntil) {
      return false;
    }
    
    // 渐进式延迟
    const delay = this.calculateDelay(attemptCount);
    if (delay > 0) {
      await this.sleep(delay);
    }
    
    return true;
  }
  
  private calculateDelay(attempts: number): number {
    return Math.min(Math.pow(2, attempts) * 1000, 30000); // 最大30秒
  }
}
```

#### 3. CSRF防护
```typescript
export const csrfConfig = {
  enabled: true,
  tokenLength: 32,
  cookieName: '__csrf-token',
  headerName: 'X-CSRF-Token',
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production'
};
```

#### 4. 内容安全策略 (CSP)
```typescript
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://trusted-cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    connectSrc: ["'self'", 'https://api.example.com'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"]
  },
  reportUri: '/api/csp-report'
};
```

#### 5. 安全监控系统
```typescript
// src/utils/monitoring.ts
export class SecurityMonitor {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity,
      source: event.source,
      details: event.details,
      userAgent: event.userAgent,
      ip: event.ip
    };
    
    // 记录到安全日志
    await this.writeToSecurityLog(logEntry);
    
    // 高危事件实时告警
    if (event.severity === 'high') {
      await this.sendAlert(logEntry);
    }
  }
  
  async detectAnomalies(ip: string): Promise<boolean> {
    // 检测异常行为模式
    const recentEvents = await this.getRecentEvents(ip);
    return this.analyzePatterns(recentEvents);
  }
}
```

#### 6. 输入验证和XSS防护
```typescript
// 输入验证中间件
export function validateInput(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.issues
      });
    }
    req.body = result.data;
    next();
  };
}

// XSS防护
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}
```

### 安全配置集成

#### 1. Next.js安全头配置
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

#### 2. 环境变量安全
```typescript
// 敏感配置验证
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ENCRYPTION_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## 后果

### 积极后果

1. **全面防护** - 多层次安全控制，降低攻击成功率
2. **主动防御** - 实时监控和异常检测
3. **合规支持** - 满足企业安全合规要求
4. **可审计性** - 完整的安全日志和审计跟踪
5. **开发友好** - 安全功能集成到开发流程中

### 消极后果

1. **性能开销** - 安全检查增加响应时间
2. **复杂度增加** - 安全配置和维护成本
3. **用户体验** - 某些安全措施可能影响用户体验

### 风险缓解

1. **性能优化** - 使用缓存和异步处理减少开销
2. **配置管理** - 统一的安全配置管理
3. **用户教育** - 提供安全使用指南

## 替代方案

### 方案1：第三方安全服务
- **优点** - 专业安全团队维护
- **缺点** - 依赖外部服务，成本较高

### 方案2：最小安全实现
- **优点** - 简单快速，开发成本低
- **缺点** - 安全风险高，不适合企业应用

### 方案3：安全框架集成
- **优点** - 功能完整，社区支持
- **缺点** - 学习成本高，定制困难

## 相关决策
- [ADR-0002: 模块化API服务设计](./ADR-0002-modular-api-service-design.md) - API安全集成
- [ADR-0005: 状态管理策略](./ADR-0005-state-management-strategy.md) - 安全状态管理

## 实施检查

### 安全测试
```typescript
// 安全测试套件
describe('Security Tests', () => {
  test('should prevent XSS attacks', () => {
    // XSS防护测试
  });
  
  test('should enforce rate limits', () => {
    // 速率限制测试
  });
  
  test('should validate CSRF tokens', () => {
    // CSRF防护测试
  });
});
```

### 安全审计
- 定期依赖包安全扫描
- 代码安全审查
- 渗透测试
- 安全配置检查

## 更新历史
- 2024-01: 初始版本，确立纵深防御架构
- 2024-01: 添加渐进式惩罚和异常检测机制