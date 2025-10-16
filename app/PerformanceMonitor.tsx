/**
 * 性能监控组件
 * 自动初始化 Web Vitals 监控
 */

'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // 只在客户端初始化
    initPerformanceMonitoring();
  }, []);

  return null;
}

