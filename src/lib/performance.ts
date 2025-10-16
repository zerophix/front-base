/**
 * 性能监控工具
 * 使用 Web Vitals 监控核心性能指标
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  // 额外上下文，便于聚合分析
  path?: string;
  url?: string;
  ua?: string;
  ts?: number;
}

/**
 * 性能指标阈值
 */
const THRESHOLDS = {
  // Largest Contentful Paint (最大内容绘制)
  LCP: { good: 2500, poor: 4000 },
  // Interaction to Next Paint (交互到下一次绘制)
  INP: { good: 200, poor: 500 },
  // Cumulative Layout Shift (累积布局偏移)
  CLS: { good: 0.1, poor: 0.25 },
  // First Contentful Paint (首次内容绘制)
  FCP: { good: 1800, poor: 3000 },
  // Time to First Byte (首字节时间)
  TTFB: { good: 800, poor: 1800 },
};

/**
 * 评级函数
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 处理性能指标
 */
function handleMetric(metric: Metric, callback?: (metric: PerformanceMetric) => void) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    path: typeof location !== 'undefined' ? location.pathname : undefined,
    url: typeof location !== 'undefined' ? location.href : undefined,
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ts: Date.now(),
  };
  
  // 开发环境下打印到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: performanceMetric.rating,
      delta: metric.delta,
    });
  }
  
  // 发送到监控服务
  if (callback) {
    callback(performanceMetric);
  } else {
    // 默认发送到 /api/analytics
    sendToAnalytics(performanceMetric);
  }
}

/**
 * 发送到分析服务
 */
async function sendToAnalytics(metric: PerformanceMetric) {
  try {
    // 使用 Navigator.sendBeacon 确保数据发送（即使页面卸载）
    if (navigator.sendBeacon) {
      const body = JSON.stringify(metric);
      navigator.sendBeacon('/api/analytics', body);
    } else {
      // Fallback to fetch
      await fetch('/api/analytics', {
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
 * 初始化性能监控
 */
export function initPerformanceMonitoring(callback?: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return;
  
  try {
    // 监控 Largest Contentful Paint
    onLCP((metric) => handleMetric(metric, callback));
    
    // 监控 Interaction to Next Paint
    onINP((metric) => handleMetric(metric, callback));
    
    // 监控 Cumulative Layout Shift
    onCLS((metric) => handleMetric(metric, callback));
    
    // 监控 First Contentful Paint
    onFCP((metric) => handleMetric(metric, callback));
    
    // 监控 Time to First Byte
    onTTFB((metric) => handleMetric(metric, callback));
  } catch (error) {
    console.error('[Performance] Failed to initialize monitoring:', error);
  }
}

/**
 * 自定义性能标记
 */
export function mark(name: string) {
  if (typeof window === 'undefined' || !window.performance) return;
  
  try {
    performance.mark(name);
  } catch (error) {
    console.error('[Performance] Failed to mark:', error);
  }
}

/**
 * 测量两个标记之间的性能
 */
export function measure(name: string, startMark: string, endMark: string) {
  if (typeof window === 'undefined' || !window.performance) return;
  
  try {
    performance.measure(name, startMark, endMark);
    const measures = performance.getEntriesByName(name);
    const latestMeasure = measures[measures.length - 1];
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, `${Math.round(latestMeasure.duration)}ms`);
    }
    
    return latestMeasure.duration;
  } catch (error) {
    console.error('[Performance] Failed to measure:', error);
  }
}

/**
 * 获取导航时间信息
 */
export function getNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance) return null;
  
  const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!timing) return null;
  
  return {
    // DNS 查询时间
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    // TCP 连接时间
    tcp: timing.connectEnd - timing.connectStart,
    // SSL 握手时间
    ssl: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
    // TTFB (Time to First Byte)
    ttfb: timing.responseStart - timing.requestStart,
    // 下载时间
    download: timing.responseEnd - timing.responseStart,
    // DOM 解析时间
    domParse: timing.domInteractive - timing.responseEnd,
    // DOM 内容加载完成
    domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
    // 页面加载完成
    load: timing.loadEventEnd - timing.loadEventStart,
    // 总时间
    total: timing.loadEventEnd - timing.fetchStart,
  };
}

/**
 * React 组件性能监控 Hook
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} render:`, `${Math.round(duration)}ms`);
    }
    
    if (duration > 16.67) { // 超过一帧时间 (60fps)
      console.warn(`[Performance] ${componentName} slow render:`, `${Math.round(duration)}ms`);
    }
  };
}

