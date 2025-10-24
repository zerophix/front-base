# 性能监控使用指南

本文档介绍如何使用项目中的性能监控工具，包括性能数据收集、分析和优化建议。

## 📋 目录

- [快速开始](#快速开始)
- [性能监控组件](#性能监控组件)
- [API接口](#api接口)
- [性能指标说明](#性能指标说明)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

---

## 快速开始

### 1. 自动初始化

性能监控会在应用启动时自动初始化，无需手动配置：

```typescript
// 在 _app.tsx 或 layout.tsx 中自动加载
import '@/lib/performance-init';

// 性能监控将自动开始收集数据
```

### 2. 手动初始化

如果需要自定义配置，可以手动初始化：

```typescript
import { initializePerformanceMonitoring, configurePerformanceAlerts } from '@/lib/performance-init';

// 初始化性能监控
const monitor = initializePerformanceMonitoring({
  enableWebVitals: true,
  enableResourceMonitoring: true,
  enableMemoryMonitoring: true,
  enableErrorMonitoring: true,
  enableUserInteractionMonitoring: true,
  enableNetworkMonitoring: true,
  reportingInterval: 30000, // 30秒上报一次
  apiEndpoint: '/api/analytics/performance'
});

// 配置性能告警
configurePerformanceAlerts([
  {
    metric: 'LCP',
    threshold: 2500,
    severity: 'warning',
    message: 'LCP超过2.5秒，页面加载较慢'
  },
  {
    metric: 'FID',
    threshold: 100,
    severity: 'error',
    message: 'FID超过100ms，用户交互响应慢'
  }
]);
```

---

## 性能监控组件

### PerformanceDashboard

性能监控仪表板组件，提供可视化的性能数据展示。

#### 基本用法

```tsx
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

function PerformancePage() {
  return (
    <div>
      <h1>性能监控</h1>
      <PerformanceDashboard />
    </div>
  );
}
```

#### 自定义配置

```tsx
<PerformanceDashboard
  refreshInterval={10000} // 10秒刷新一次
  showAlerts={true}
  showOptimizationTips={true}
  timeRange="1h" // 显示最近1小时的数据
/>
```

#### 功能特性

- **实时数据更新** - 自动刷新性能指标
- **性能评分** - 基于Web Vitals的综合评分
- **告警展示** - 显示性能告警和建议
- **趋势分析** - 性能指标的时间趋势图表
- **优化建议** - 基于数据分析的优化建议

---

## API接口

### 性能数据上报

#### POST /api/analytics/performance

上报性能数据到服务器。

**请求体：**

```typescript
interface PerformanceMetric {
  name: string;           // 指标名称
  value: number;          // 指标值
  timestamp: number;      // 时间戳
  sessionId: string;      // 会话ID
  path: string;          // 页面路径
  userAgent?: string;     // 用户代理
  metadata?: Record<string, any>; // 额外元数据
}
```

**示例：**

```typescript
const metric = {
  name: 'LCP',
  value: 1234.5,
  timestamp: Date.now(),
  sessionId: 'session-123',
  path: '/dashboard',
  userAgent: navigator.userAgent,
  metadata: {
    element: 'main-content',
    url: window.location.href
  }
};

fetch('/api/analytics/performance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(metric)
});
```

### 性能数据查询

#### GET /api/analytics/performance

查询性能数据和统计信息。

**查询参数：**

- `startTime` - 开始时间（时间戳）
- `endTime` - 结束时间（时间戳）
- `metric` - 指标名称过滤
- `sessionId` - 会话ID过滤
- `path` - 页面路径过滤

**示例：**

```typescript
// 查询最近1小时的LCP数据
const response = await fetch('/api/analytics/performance?' + new URLSearchParams({
  startTime: (Date.now() - 3600000).toString(),
  endTime: Date.now().toString(),
  metric: 'LCP'
}));

const data = await response.json();
console.log('性能数据:', data.metrics);
console.log('统计信息:', data.stats);
```

---

## 性能指标说明

### Core Web Vitals

#### LCP (Largest Contentful Paint)
- **定义**: 最大内容绘制时间
- **衡量**: 页面主要内容的加载速度
- **良好标准**: < 2.5秒
- **需要改进**: 2.5-4.0秒
- **较差**: > 4.0秒

#### FID (First Input Delay)
- **定义**: 首次输入延迟
- **衡量**: 用户首次交互的响应速度
- **良好标准**: < 100毫秒
- **需要改进**: 100-300毫秒
- **较差**: > 300毫秒

#### CLS (Cumulative Layout Shift)
- **定义**: 累积布局偏移
- **衡量**: 页面布局稳定性
- **良好标准**: < 0.1
- **需要改进**: 0.1-0.25
- **较差**: > 0.25

### 其他重要指标

#### FCP (First Contentful Paint)
- **定义**: 首次内容绘制时间
- **衡量**: 页面开始显示内容的时间

#### TTFB (Time to First Byte)
- **定义**: 首字节时间
- **衡量**: 服务器响应速度

#### TTI (Time to Interactive)
- **定义**: 可交互时间
- **衡量**: 页面完全可交互的时间

---

## 使用示例

### 1. 手动记录性能标记

```typescript
import { markPerformance, measurePerformance } from '@/lib/performance-init';

// 标记开始时间
markPerformance('api-call-start');

// 执行API调用
try {
  const response = await fetch('/api/data');
  const data = await response.json();
  
  // 标记结束时间并测量
  markPerformance('api-call-end');
  measurePerformance('api-call-duration', 'api-call-start', 'api-call-end');
} catch (error) {
  console.error('API调用失败:', error);
}
```

### 2. 记录用户交互

```typescript
import { recordUserInteraction } from '@/lib/performance-init';

function handleButtonClick() {
  // 记录用户交互
  recordUserInteraction('button-click', {
    buttonId: 'submit-btn',
    timestamp: Date.now(),
    path: window.location.pathname
  });
  
  // 执行业务逻辑
  submitForm();
}
```

### 3. 记录错误信息

```typescript
import { recordError } from '@/lib/performance-init';

try {
  // 可能出错的代码
  riskyOperation();
} catch (error) {
  // 记录错误
  recordError(error, {
    context: 'user-form-submission',
    userId: getCurrentUserId(),
    additionalInfo: {
      formData: getFormData()
    }
  });
  
  // 处理错误
  handleError(error);
}
```

### 4. 生成性能报告

```typescript
import { generatePerformanceReport } from '@/lib/performance-init';

async function generateReport() {
  const report = await generatePerformanceReport({
    timeRange: '24h',
    includeOptimizationTips: true,
    includeAlerts: true
  });
  
  console.log('性能报告:', report);
  
  // 发送报告到管理员
  if (report.alerts.length > 0) {
    notifyAdministrators(report);
  }
}
```

### 5. 监控特定页面

```typescript
import { getPerformanceMonitor } from '@/lib/performance-init';

function MonitoredPage() {
  useEffect(() => {
    const monitor = getPerformanceMonitor();
    
    // 页面加载完成时记录
    monitor?.mark('page-loaded');
    
    return () => {
      // 页面卸载时清理
      monitor?.measure('page-duration', 'navigationStart', 'page-loaded');
    };
  }, []);

  return (
    <div>
      {/* 页面内容 */}
    </div>
  );
}
```

---

## 最佳实践

### 1. 性能监控策略

#### 分层监控
```typescript
// 应用层监控
const appMonitor = {
  // 路由变化监控
  onRouteChange: (route) => {
    markPerformance(`route-${route}-start`);
  },
  
  // 组件渲染监控
  onComponentMount: (componentName) => {
    markPerformance(`${componentName}-mount`);
  }
};

// 业务层监控
const businessMonitor = {
  // API调用监控
  onApiCall: (endpoint, duration) => {
    recordUserInteraction('api-call', {
      endpoint,
      duration,
      timestamp: Date.now()
    });
  },
  
  // 用户操作监控
  onUserAction: (action, metadata) => {
    recordUserInteraction(action, metadata);
  }
};
```

#### 采样策略
```typescript
// 生产环境采样配置
const samplingConfig = {
  // Web Vitals 100% 采样
  webVitals: 1.0,
  
  // 资源监控 50% 采样
  resources: 0.5,
  
  // 用户交互 10% 采样
  interactions: 0.1,
  
  // 错误监控 100% 采样
  errors: 1.0
};

function shouldSample(type: string): boolean {
  return Math.random() < samplingConfig[type];
}
```

### 2. 性能优化建议

#### 代码分割
```typescript
// 使用动态导入进行代码分割
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### 资源预加载
```typescript
// 预加载关键资源
function preloadCriticalResources() {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/critical-font.woff2';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
```

#### 图片优化
```typescript
// 使用 Next.js Image 组件
import Image from 'next/image';

function OptimizedImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority // 关键图片优先加载
      placeholder="blur" // 模糊占位符
    />
  );
}
```

### 3. 监控告警配置

#### 告警规则
```typescript
const alertRules = [
  {
    metric: 'LCP',
    threshold: 2500,
    severity: 'warning',
    message: 'LCP超过2.5秒，建议优化图片和关键资源加载'
  },
  {
    metric: 'FID',
    threshold: 100,
    severity: 'error',
    message: 'FID超过100ms，建议优化JavaScript执行'
  },
  {
    metric: 'CLS',
    threshold: 0.1,
    severity: 'warning',
    message: 'CLS超过0.1，建议为图片和广告预留空间'
  },
  {
    metric: 'error-rate',
    threshold: 0.05, // 5%
    severity: 'critical',
    message: '错误率超过5%，需要立即处理'
  }
];
```

#### 告警处理
```typescript
function handlePerformanceAlert(alert) {
  // 记录告警
  console.warn('性能告警:', alert);
  
  // 发送通知
  if (alert.severity === 'critical') {
    sendSlackNotification(alert);
    sendEmailAlert(alert);
  }
  
  // 自动优化尝试
  if (alert.metric === 'LCP') {
    enableImageOptimization();
  }
}
```

### 4. 数据分析

#### 性能趋势分析
```typescript
function analyzePerformanceTrends(metrics) {
  const trends = {
    improving: [],
    degrading: [],
    stable: []
  };
  
  metrics.forEach(metric => {
    const trend = calculateTrend(metric.values);
    if (trend > 0.1) {
      trends.degrading.push(metric);
    } else if (trend < -0.1) {
      trends.improving.push(metric);
    } else {
      trends.stable.push(metric);
    }
  });
  
  return trends;
}
```

#### 用户体验评分
```typescript
function calculateUserExperienceScore(metrics) {
  const weights = {
    LCP: 0.25,
    FID: 0.25,
    CLS: 0.25,
    TTFB: 0.15,
    FCP: 0.1
  };
  
  let score = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric]) {
      score += getMetricScore(metric, metrics[metric]) * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? score / totalWeight : 0;
}
```

---

## 故障排除

### 常见问题

#### 1. 性能数据未上报

**可能原因：**
- 网络连接问题
- API端点配置错误
- 浏览器兼容性问题

**解决方案：**
```typescript
// 检查网络连接
if (!navigator.onLine) {
  console.warn('网络连接断开，性能数据将缓存到本地');
  cacheMetricsLocally(metrics);
}

// 检查API端点
try {
  const response = await fetch('/api/analytics/performance', {
    method: 'HEAD'
  });
  if (!response.ok) {
    console.error('性能API端点不可用');
  }
} catch (error) {
  console.error('无法连接到性能API:', error);
}
```

#### 2. 内存泄漏

**可能原因：**
- 事件监听器未清理
- 定时器未清除
- 大量性能数据缓存

**解决方案：**
```typescript
// 正确清理资源
useEffect(() => {
  const monitor = getPerformanceMonitor();
  
  return () => {
    // 清理监控器
    monitor?.cleanup();
    
    // 清理本地缓存
    clearPerformanceCache();
  };
}, []);
```

#### 3. 性能监控影响应用性能

**解决方案：**
```typescript
// 使用 requestIdleCallback 进行性能数据处理
function processPerformanceData(data) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      sendPerformanceData(data);
    });
  } else {
    // 降级到 setTimeout
    setTimeout(() => {
      sendPerformanceData(data);
    }, 0);
  }
}
```

### 调试工具

#### 开发环境调试
```typescript
if (process.env.NODE_ENV === 'development') {
  // 启用详细日志
  window.performanceDebug = true;
  
  // 暴露性能监控器到全局
  window.performanceMonitor = getPerformanceMonitor();
  
  // 添加性能数据可视化
  import('./performance-devtools').then(devtools => {
    devtools.init();
  });
}
```

#### 性能分析工具
```typescript
// 使用 Performance API 进行详细分析
function analyzePerformance() {
  const entries = performance.getEntriesByType('navigation');
  const navigation = entries[0] as PerformanceNavigationTiming;
  
  console.log('DNS查询时间:', navigation.domainLookupEnd - navigation.domainLookupStart);
  console.log('TCP连接时间:', navigation.connectEnd - navigation.connectStart);
  console.log('请求响应时间:', navigation.responseEnd - navigation.requestStart);
  console.log('DOM解析时间:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
}
```

---

## 总结

性能监控是确保应用用户体验的重要工具。通过：

1. **自动化监控** - 无需手动配置即可开始收集数据
2. **全面的指标** - 覆盖Web Vitals和自定义指标
3. **实时告警** - 及时发现和处理性能问题
4. **可视化分析** - 直观的性能数据展示
5. **优化建议** - 基于数据的具体优化方案

可以有效提升应用性能和用户体验。建议在开发过程中持续关注性能指标，并根据监控数据进行针对性优化。