/**
 * 性能监控组件
 * 自动初始化 Web Vitals 监控
 */

'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // 暂时禁用性能监控，避免 Next.js 15.5.4 兼容性问题
    // TODO: 重新启用性能监控当 Next.js 修复相关问题后
    /*
    try {
      // 只在客户端初始化
      initPerformanceMonitoring();
    } catch (error) {
      console.warn('[Performance] 性能监控初始化失败，可能是 Next.js 版本兼容性问题:', error);
    }
    */
  }, []);

  return null;
}

