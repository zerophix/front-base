/**
 * 性能监控初始化
 * 在应用启动时自动启用性能监控
 */

import { EnhancedPerformanceMonitor, initEnhancedPerformanceMonitoring, getPerformanceMonitor } from './performance-enhanced';
import { initPerformanceMonitoring } from './performance';

// 全局性能监控实例
let performanceMonitor: EnhancedPerformanceMonitor | null = null;

/**
 * 初始化性能监控
 */
export function initializePerformanceMonitoring(userId?: string) {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined') {
    return;
  }

  // 检查是否已经初始化
  if (performanceMonitor) {
    return performanceMonitor;
  }

  try {
    // 使用工厂函数创建增强性能监控实例
    performanceMonitor = initEnhancedPerformanceMonitoring(userId);

    // 初始化基础性能监控（Web Vitals）
    initPerformanceMonitoring();

    // 在页面卸载时清理数据
    window.addEventListener('beforeunload', () => {
      if (performanceMonitor) {
        // 清理旧数据（保留最近24小时）
        performanceMonitor.cleanup();
      }
    });

    // 在页面隐藏时记录用户体验数据
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && performanceMonitor) {
        // 这里可以触发数据发送，但EnhancedPerformanceMonitor会自动处理
        console.log('页面隐藏，性能数据已记录');
      }
    });

    console.log('性能监控已启动');
    return performanceMonitor;
  } catch (error) {
    console.error('性能监控初始化失败:', error);
    return null;
  }
}

/**
 * 获取性能监控实例
 */
export function getPerformanceMonitorInstance(): EnhancedPerformanceMonitor | null {
  return getPerformanceMonitor();
}

/**
 * 配置性能告警
 */
export function configurePerformanceAlert(alert: {
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}) {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    monitor.configureAlert(alert);
  }
}

/**
 * 获取当前性能指标
 */
export function getCurrentPerformanceMetrics() {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    return monitor.getCurrentMetrics();
  }
  return [];
}

/**
 * 获取资源性能指标
 */
export function getResourcePerformanceMetrics() {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    return monitor.getResourceMetrics();
  }
  return [];
}

/**
 * 获取用户体验指标
 */
export function getUserExperienceMetrics() {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    return monitor.getUserExperienceMetrics();
  }
  return [];
}

/**
 * 生成性能报告
 */
export function generatePerformanceReport(startDate?: Date, endDate?: Date) {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // 默认24小时前
    const end = endDate || new Date();
    return monitor.getPerformanceReport(start, end);
  }
  return null;
}

/**
 * 清理性能监控数据
 */
export function cleanupPerformanceData(maxAge?: number) {
  const monitor = getPerformanceMonitor();
  if (monitor) {
    monitor.cleanup(maxAge);
  }
}

/**
 * 设置默认的性能告警
 */
export function setupDefaultAlerts() {
  const monitor = getPerformanceMonitor();
  if (!monitor) return;

  // LCP 告警
  monitor.configureAlert({
    metric: 'LCP',
    threshold: 4000,
    condition: 'above',
    severity: 'high',
    enabled: true,
  });

  // INP 告警
  monitor.configureAlert({
    metric: 'INP',
    threshold: 500,
    condition: 'above',
    severity: 'medium',
    enabled: true,
  });

  // CLS 告警
  monitor.configureAlert({
    metric: 'CLS',
    threshold: 0.25,
    condition: 'above',
    severity: 'high',
    enabled: true,
  });

  // FCP 告警
  monitor.configureAlert({
    metric: 'FCP',
    threshold: 3000,
    condition: 'above',
    severity: 'medium',
    enabled: true,
  });

  // TTFB 告警
  monitor.configureAlert({
    metric: 'TTFB',
    threshold: 1800,
    condition: 'above',
    severity: 'medium',
    enabled: true,
  });

  // 内存使用告警
  monitor.configureAlert({
    metric: 'MEMORY_USAGE',
    threshold: 80,
    condition: 'above',
    severity: 'critical',
    enabled: true,
  });

  console.log('默认性能告警已配置');
}

// 自动初始化（仅在浏览器环境）
if (typeof window !== 'undefined') {
  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePerformanceMonitoring();
      setupDefaultAlerts();
    });
  } else {
    // DOM已经加载完成，立即初始化
    initializePerformanceMonitoring();
    setupDefaultAlerts();
  }
}