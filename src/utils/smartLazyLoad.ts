import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * 智能懒加载工具
 * 只对真正需要懒加载的大型组件使用动态导入
 */

interface LazyLoadOptions {
  /** 是否为复杂组件（包含大量逻辑、图表等） */
  isComplex?: boolean;
  /** 是否为低频访问组件 */
  isLowFrequency?: boolean;
  /** 自定义加载文本 */
  loadingText?: string;
}

/**
 * 智能懒加载函数
 * 根据组件特征决定是否使用懒加载
 */
export function smartLazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    isComplex = false,
    isLowFrequency = false
  } = options;

  // 判断是否需要懒加载
  const shouldLazyLoad = isComplex || isLowFrequency;

  if (!shouldLazyLoad) {
    // 对于小型、高频组件，建议直接导入
    console.warn('建议对此组件使用直接导入而非懒加载');
  }

  return dynamic(importFn, {
    loading: () => null, // 简化加载状态，避免闪烁
    ssr: false
  });
}

/**
 * 预定义的懒加载策略
 */
export const LazyLoadStrategies = {
  /** 图表组件 - 通常较大且复杂 */
  chart: {
    isComplex: true,
    isLowFrequency: false
  },
  
  /** 报表组件 - 大型且低频 */
  report: {
    isComplex: true,
    isLowFrequency: true
  },
  
  /** 设置页面 - 低频访问 */
  settings: {
    isComplex: false,
    isLowFrequency: true
  },

  /** 普通页面 - 不建议懒加载 */
  normal: {
    isComplex: false,
    isLowFrequency: false
  }
} as const;

/**
 * 判断是否应该使用懒加载
 */
export function shouldUseLazyLoad(strategy: keyof typeof LazyLoadStrategies): boolean {
  const config = LazyLoadStrategies[strategy];
  return config.isComplex || config.isLowFrequency;
}