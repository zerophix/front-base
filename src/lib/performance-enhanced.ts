/**
 * 增强的性能监控系统
 * 提供完整的性能数据收集、分析、报告和告警功能
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  path?: string;
  url?: string;
  ua?: string;
  ts?: number;
  sessionId?: string;
  userId?: string;
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalPageViews: number;
    averageLoadTime: number;
    bounceRate: number;
    errorRate: number;
  };
  metrics: {
    [key: string]: {
      average: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
      samples: number;
      trend: 'improving' | 'stable' | 'degrading';
    };
  };
  slowestPages: Array<{
    path: string;
    averageLoadTime: number;
    visits: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: {
    [browser: string]: number;
  };
  recommendations: string[];
}

/**
 * 性能告警配置
 */
export interface PerformanceAlert {
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

/**
 * 资源性能指标
 */
export interface ResourceMetric {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

/**
 * 用户体验指标
 */
export interface UserExperienceMetric {
  sessionId: string;
  userId?: string;
  pageViews: number;
  sessionDuration: number;
  bounced: boolean;
  interactions: number;
  errors: number;
  timestamp: number;
}

/**
 * 性能阈值配置
 */
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  // 自定义指标
  BUNDLE_SIZE: { good: 250000, poor: 500000 }, // 250KB
  API_RESPONSE: { good: 1000, poor: 3000 }, // 1s
  MEMORY_USAGE: { good: 50, poor: 80 }, // 50MB
  CPU_USAGE: { good: 50, poor: 80 }, // 50%
};

/**
 * 增强的性能监控器
 */
export class EnhancedPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private resourceMetrics: ResourceMetric[] = [];
  private userExperienceMetrics: UserExperienceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private pageViews: number = 0;
  private interactions: number = 0;
  private errors: number = 0;

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
    this.startTime = Date.now();
    this.initializeDefaultAlerts();
    this.initializeMonitoring();
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化默认告警规则
   */
  private initializeDefaultAlerts(): void {
    this.alerts = [
      { metric: 'LCP', threshold: 4000, condition: 'above', severity: 'high', enabled: true },
      { metric: 'INP', threshold: 500, condition: 'above', severity: 'medium', enabled: true },
      { metric: 'CLS', threshold: 0.25, condition: 'above', severity: 'medium', enabled: true },
      { metric: 'FCP', threshold: 3000, condition: 'above', severity: 'medium', enabled: true },
      { metric: 'TTFB', threshold: 1800, condition: 'above', severity: 'high', enabled: true },
      { metric: 'API_RESPONSE', threshold: 3000, condition: 'above', severity: 'high', enabled: true },
      { metric: 'MEMORY_USAGE', threshold: 80, condition: 'above', severity: 'critical', enabled: true },
    ];
  }

  /**
   * 初始化性能监控
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    try {
      // Web Vitals 监控
      onLCP((metric) => this.handleWebVital(metric));
      onINP((metric) => this.handleWebVital(metric));
      onCLS((metric) => this.handleWebVital(metric));
      onFCP((metric) => this.handleWebVital(metric));
      onTTFB((metric) => this.handleWebVital(metric));

      // 资源性能监控
      this.monitorResources();

      // 内存监控
      this.monitorMemoryUsage();

      // 错误监控
      this.monitorErrors();

      // 用户交互监控
      this.monitorUserInteractions();

      // 页面可见性监控
      this.monitorPageVisibility();

      // 网络状态监控
      this.monitorNetworkStatus();

    } catch (error) {
      console.error('[Performance] Failed to initialize monitoring:', error);
    }
  }

  /**
   * 处理 Web Vitals 指标
   */
  private handleWebVital(metric: Metric): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
      path: typeof location !== 'undefined' ? location.pathname : undefined,
      url: typeof location !== 'undefined' ? location.href : undefined,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ts: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.metrics.push(performanceMetric);
    this.checkAlerts(performanceMetric);
    this.sendMetric(performanceMetric);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, {
        value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
        rating: performanceMetric.rating,
        delta: metric.delta,
      });
    }
  }

  /**
   * 监控资源性能
   */
  private monitorResources(): void {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          const resourceMetric: ResourceMetric = {
            name: resourceEntry.name,
            type: this.getResourceType(resourceEntry.name),
            size: resourceEntry.transferSize || 0,
            duration: resourceEntry.duration,
            startTime: resourceEntry.startTime,
            transferSize: resourceEntry.transferSize || 0,
            encodedBodySize: resourceEntry.encodedBodySize || 0,
            decodedBodySize: resourceEntry.decodedBodySize || 0,
          };
          this.resourceMetrics.push(resourceMetric);
          this.analyzeResourcePerformance(resourceMetric);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * 监控内存使用情况
   */
  private monitorMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

      const memoryMetric: PerformanceMetric = {
        name: 'MEMORY_USAGE',
        value: usedMB,
        rating: this.getRating('MEMORY_USAGE', usedMB),
        delta: 0,
        id: `memory_${Date.now()}`,
        ts: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
      };

      this.metrics.push(memoryMetric);
      this.checkAlerts(memoryMetric);

      if (usedMB > 50) {
        console.warn(`[Performance] High memory usage: ${usedMB.toFixed(2)}MB`);
      }
    };

    // 每30秒检查一次内存使用情况
    setInterval(checkMemory, 30000);
    checkMemory(); // 立即检查一次
  }

  /**
   * 监控错误
   */
  private monitorErrors(): void {
    window.addEventListener('error', (event) => {
      this.errors++;
      const errorMetric: PerformanceMetric = {
        name: 'ERROR',
        value: 1,
        rating: 'poor',
        delta: 1,
        id: `error_${Date.now()}`,
        ts: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        path: location.pathname,
        url: location.href,
      };
      this.metrics.push(errorMetric);
      this.sendMetric(errorMetric);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errors++;
      const errorMetric: PerformanceMetric = {
        name: 'UNHANDLED_REJECTION',
        value: 1,
        rating: 'poor',
        delta: 1,
        id: `rejection_${Date.now()}`,
        ts: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        path: location.pathname,
        url: location.href,
      };
      this.metrics.push(errorMetric);
      this.sendMetric(errorMetric);
    });
  }

  /**
   * 监控用户交互
   */
  private monitorUserInteractions(): void {
    const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.interactions++;
      }, { passive: true });
    });
  }

  /**
   * 监控页面可见性
   */
  private monitorPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pageViews++;
      } else {
        this.recordUserExperience();
      }
    });

    // 页面卸载时记录用户体验
    window.addEventListener('beforeunload', () => {
      this.recordUserExperience();
    });
  }

  /**
   * 监控网络状态
   */
  private monitorNetworkStatus(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const networkMetric: PerformanceMetric = {
        name: 'NETWORK_TYPE',
        value: this.getNetworkScore(connection.effectiveType),
        rating: this.getNetworkRating(connection.effectiveType),
        delta: 0,
        id: `network_${Date.now()}`,
        ts: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
      };

      this.metrics.push(networkMetric);
    }
  }

  /**
   * 记录用户体验指标
   */
  private recordUserExperience(): void {
    const sessionDuration = Date.now() - this.startTime;
    const bounced = this.pageViews <= 1 && sessionDuration < 30000; // 30秒内且只有1个页面视图

    const uxMetric: UserExperienceMetric = {
      sessionId: this.sessionId,
      userId: this.userId,
      pageViews: this.pageViews,
      sessionDuration,
      bounced,
      interactions: this.interactions,
      errors: this.errors,
      timestamp: Date.now(),
    };

    this.userExperienceMetrics.push(uxMetric);
    this.sendUserExperienceMetric(uxMetric);
  }

  /**
   * 分析资源性能
   */
  private analyzeResourcePerformance(resource: ResourceMetric): void {
    // 检查大型资源
    if (resource.size > 1024 * 1024) { // 1MB
      console.warn(`[Performance] Large resource detected: ${resource.name} (${(resource.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // 检查慢速资源
    if (resource.duration > 3000) { // 3秒
      console.warn(`[Performance] Slow resource detected: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
    }
  }

  /**
   * 获取性能评级
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'good';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * 获取网络评分
   */
  private getNetworkScore(effectiveType: string): number {
    const scores = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 };
    return scores[effectiveType as keyof typeof scores] || 4;
  }

  /**
   * 获取网络评级
   */
  private getNetworkRating(effectiveType: string): 'good' | 'needs-improvement' | 'poor' {
    if (effectiveType === '4g') return 'good';
    if (effectiveType === '3g') return 'needs-improvement';
    return 'poor';
  }

  /**
   * 检查告警
   */
  private checkAlerts(metric: PerformanceMetric): void {
    const alert = this.alerts.find(a => a.metric === metric.name && a.enabled);
    if (!alert) return;

    const shouldAlert = alert.condition === 'above' 
      ? metric.value > alert.threshold 
      : metric.value < alert.threshold;

    if (shouldAlert) {
      this.triggerAlert(alert, metric);
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(alert: PerformanceAlert, metric: PerformanceMetric): void {
    const alertData = {
      alert,
      metric,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    console.warn(`[Performance Alert] ${alert.severity.toUpperCase()}: ${alert.metric} ${alert.condition} ${alert.threshold}`, alertData);

    // 发送告警到监控服务
    this.sendAlert(alertData);
  }

  /**
   * 发送指标到分析服务
   */
  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metric));
      } else {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('[Performance] Failed to send metric:', error);
    }
  }

  /**
   * 发送用户体验指标
   */
  private async sendUserExperienceMetric(metric: UserExperienceMetric): Promise<void> {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/user-experience', JSON.stringify(metric));
      } else {
        await fetch('/api/analytics/user-experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('[Performance] Failed to send UX metric:', error);
    }
  }

  /**
   * 发送告警
   */
  private async sendAlert(alertData: any): Promise<void> {
    try {
      await fetch('/api/analytics/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
    } catch (error) {
      console.error('[Performance] Failed to send alert:', error);
    }
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(startDate: Date, endDate: Date): PerformanceReport {
    const filteredMetrics = this.metrics.filter(m => 
      m.ts && m.ts >= startDate.getTime() && m.ts <= endDate.getTime()
    );

    const filteredUXMetrics = this.userExperienceMetrics.filter(m => 
      m.timestamp >= startDate.getTime() && m.timestamp <= endDate.getTime()
    );

    return this.generateReport(filteredMetrics, filteredUXMetrics, startDate, endDate);
  }

  /**
   * 生成性能报告
   */
  private generateReport(
    metrics: PerformanceMetric[], 
    uxMetrics: UserExperienceMetric[], 
    startDate: Date, 
    endDate: Date
  ): PerformanceReport {
    const totalPageViews = uxMetrics.reduce((sum, m) => sum + m.pageViews, 0);
    const totalSessions = uxMetrics.length;
    const bouncedSessions = uxMetrics.filter(m => m.bounced).length;
    const errorCount = uxMetrics.reduce((sum, m) => sum + m.errors, 0);

    const metricsByName = this.groupMetricsByName(metrics);
    const processedMetrics: any = {};

    Object.keys(metricsByName).forEach(name => {
      const values = metricsByName[name].map(m => m.value).sort((a, b) => a - b);
      processedMetrics[name] = {
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        p50: this.percentile(values, 50),
        p75: this.percentile(values, 75),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
        samples: values.length,
        trend: this.calculateTrend(metricsByName[name]),
      };
    });

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalPageViews,
        averageLoadTime: processedMetrics.LCP?.average || 0,
        bounceRate: totalSessions > 0 ? bouncedSessions / totalSessions : 0,
        errorRate: totalPageViews > 0 ? errorCount / totalPageViews : 0,
      },
      metrics: processedMetrics,
      slowestPages: this.getSlowPages(metrics),
      deviceBreakdown: this.getDeviceBreakdown(metrics),
      browserBreakdown: this.getBrowserBreakdown(metrics),
      recommendations: this.generateRecommendations(processedMetrics),
    };
  }

  /**
   * 按名称分组指标
   */
  private groupMetricsByName(metrics: PerformanceMetric[]): { [name: string]: PerformanceMetric[] } {
    return metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) groups[metric.name] = [];
      groups[metric.name].push(metric);
      return groups;
    }, {} as { [name: string]: PerformanceMetric[] });
  }

  /**
   * 计算百分位数
   */
  private percentile(values: number[], p: number): number {
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)] || 0;
  }

  /**
   * 计算趋势
   */
  private calculateTrend(metrics: PerformanceMetric[]): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < 2) return 'stable';
    
    const sortedMetrics = metrics.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
    const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change < -0.05) return 'improving';
    if (change > 0.05) return 'degrading';
    return 'stable';
  }

  /**
   * 获取最慢页面
   */
  private getSlowPages(metrics: PerformanceMetric[]): Array<{ path: string; averageLoadTime: number; visits: number }> {
    const pageMetrics = metrics.filter(m => m.name === 'LCP' && m.path);
    const pageGroups = pageMetrics.reduce((groups, metric) => {
      const path = metric.path!;
      if (!groups[path]) groups[path] = [];
      groups[path].push(metric);
      return groups;
    }, {} as { [path: string]: PerformanceMetric[] });

    return Object.keys(pageGroups)
      .map(path => ({
        path,
        averageLoadTime: pageGroups[path].reduce((sum, m) => sum + m.value, 0) / pageGroups[path].length,
        visits: pageGroups[path].length,
      }))
      .sort((a, b) => b.averageLoadTime - a.averageLoadTime)
      .slice(0, 10);
  }

  /**
   * 获取设备分布
   */
  private getDeviceBreakdown(metrics: PerformanceMetric[]): { desktop: number; mobile: number; tablet: number } {
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
    
    metrics.forEach(metric => {
      if (metric.ua) {
        if (metric.ua.includes('Mobile')) deviceCounts.mobile++;
        else if (metric.ua.includes('Tablet')) deviceCounts.tablet++;
        else deviceCounts.desktop++;
      }
    });

    return deviceCounts;
  }

  /**
   * 获取浏览器分布
   */
  private getBrowserBreakdown(metrics: PerformanceMetric[]): { [browser: string]: number } {
    const browserCounts: { [browser: string]: number } = {};
    
    metrics.forEach(metric => {
      if (metric.ua) {
        let browser = 'Unknown';
        if (metric.ua.includes('Chrome')) browser = 'Chrome';
        else if (metric.ua.includes('Firefox')) browser = 'Firefox';
        else if (metric.ua.includes('Safari')) browser = 'Safari';
        else if (metric.ua.includes('Edge')) browser = 'Edge';
        
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      }
    });

    return browserCounts;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.LCP?.average > 2500) {
      recommendations.push('优化最大内容绘制(LCP)：考虑压缩图片、使用CDN、优化服务器响应时间');
    }

    if (metrics.INP?.average > 200) {
      recommendations.push('优化交互响应(INP)：减少JavaScript执行时间、优化事件处理器');
    }

    if (metrics.CLS?.average > 0.1) {
      recommendations.push('优化累积布局偏移(CLS)：为图片和广告设置尺寸、避免动态插入内容');
    }

    if (metrics.FCP?.average > 1800) {
      recommendations.push('优化首次内容绘制(FCP)：减少阻塞渲染的资源、优化关键渲染路径');
    }

    if (metrics.TTFB?.average > 800) {
      recommendations.push('优化首字节时间(TTFB)：优化服务器性能、使用缓存、优化数据库查询');
    }

    if (metrics.MEMORY_USAGE?.average > 50) {
      recommendations.push('优化内存使用：检查内存泄漏、优化数据结构、及时清理不用的对象');
    }

    return recommendations;
  }

  /**
   * 配置告警规则
   */
  public configureAlert(alert: PerformanceAlert): void {
    const existingIndex = this.alerts.findIndex(a => a.metric === alert.metric);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = alert;
    } else {
      this.alerts.push(alert);
    }
  }

  /**
   * 获取当前指标
   */
  public getCurrentMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取资源指标
   */
  public getResourceMetrics(): ResourceMetric[] {
    return [...this.resourceMetrics];
  }

  /**
   * 获取用户体验指标
   */
  public getUserExperienceMetrics(): UserExperienceMetric[] {
    return [...this.userExperienceMetrics];
  }

  /**
   * 清理旧数据
   */
  public cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => (m.ts || 0) > cutoff);
    this.userExperienceMetrics = this.userExperienceMetrics.filter(m => m.timestamp > cutoff);
  }
}

// 全局实例
let globalMonitor: EnhancedPerformanceMonitor | null = null;

/**
 * 初始化增强的性能监控
 */
export function initEnhancedPerformanceMonitoring(userId?: string): EnhancedPerformanceMonitor {
  if (typeof window === 'undefined') {
    throw new Error('Performance monitoring can only be initialized in browser environment');
  }

  if (!globalMonitor) {
    globalMonitor = new EnhancedPerformanceMonitor(userId);
  }

  return globalMonitor;
}

/**
 * 获取全局监控实例
 */
export function getPerformanceMonitor(): EnhancedPerformanceMonitor | null {
  return globalMonitor;
}

/**
 * React Hook for performance monitoring
 */
export function useEnhancedPerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return () => {};
  
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    
    if (globalMonitor) {
      const metric: PerformanceMetric = {
        name: `COMPONENT_RENDER_${componentName}`,
        value: duration,
        rating: duration > 16.67 ? 'poor' : duration > 8 ? 'needs-improvement' : 'good',
        delta: 0,
        id: `component_${componentName}_${Date.now()}`,
        ts: Date.now(),
        sessionId: globalMonitor.getCurrentMetrics()[0]?.sessionId || 'unknown',
      };
      
      globalMonitor.getCurrentMetrics().push(metric);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} render:`, `${Math.round(duration)}ms`);
      
      if (duration > 16.67) {
        console.warn(`[Performance] ${componentName} slow render:`, `${Math.round(duration)}ms`);
      }
    }
  };
}