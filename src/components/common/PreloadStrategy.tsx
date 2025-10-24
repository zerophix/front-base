'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 预加载策略组件
 * 使用更安全的预加载策略，避免触发 webpack 模块加载错误
 */
export function PreloadStrategy() {
  const router = useRouter();

  useEffect(() => {
    // 在开发环境中禁用预加载，避免 webpack 热更新冲突
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // 只在生产环境中进行有限的预加载
    const currentPath = window.location.pathname;
    
    // 仅预加载最关键的路由
    const criticalRoutes = ['/home'];
    
    // 延迟预加载，确保页面完全加载后再进行
    const preloadTimer = setTimeout(() => {
      const routesToPreload = criticalRoutes.filter(route => route !== currentPath);

      routesToPreload.forEach((route, index) => {
        // 使用更长的延迟，避免并发问题
        setTimeout(() => {
          try {
            router.prefetch(route);
          } catch (error) {
            // 静默处理预加载错误，不影响主要功能
            console.warn('预加载失败:', route, error);
          }
        }, (index + 1) * 2000); // 每2秒预加载一个
      });
    }, 3000); // 页面加载完成3秒后开始预加载

    return () => clearTimeout(preloadTimer);
  }, [router]);

  return null; // 这是一个纯逻辑组件，不渲染任何内容
}