'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 预加载策略组件
 * 根据用户当前位置智能预加载相关页面
 */
export function PreloadStrategy() {
  const router = useRouter();

  useEffect(() => {
    // 预加载策略：根据当前路径预加载相关页面
    const currentPath = window.location.pathname;
    
    // 通用预加载：首页和主要模块页面
    const commonRoutes = ['/home', '/data', '/equipment', '/personnel', '/quality', '/project'];
    
    // 根据当前模块预加载子页面
    let moduleRoutes: string[] = [];
    
    if (currentPath.startsWith('/data')) {
      moduleRoutes = [
        '/data/detection-objects',
        '/data/detection-params', 
        '/data/parameter-code',
        '/data/statistics-analysis'
      ];
    } else if (currentPath.startsWith('/equipment')) {
      moduleRoutes = [
        '/equipment/device',
        '/equipment/new',
        '/equipment/calibration',
        '/equipment/maintenance-plan'
      ];
    } else if (currentPath.startsWith('/personnel')) {
      moduleRoutes = [
        '/personnel/list',
        '/personnel/registration',
        '/personnel/training',
        '/personnel/qualification'
      ];
    } else if (currentPath.startsWith('/quality')) {
      moduleRoutes = [
        '/quality/contract-review',
        '/quality/supervision-plan',
        '/quality/nonconformity',
        '/quality/environment'
      ];
    } else if (currentPath.startsWith('/project')) {
      moduleRoutes = [
        '/project/new',
        '/project/task',
        '/project/station',
        '/project/task-management'
      ];
    }

    // 延迟预加载，避免影响当前页面性能
    const preloadTimer = setTimeout(() => {
      const routesToPreload = [...commonRoutes, ...moduleRoutes]
        .filter(route => route !== currentPath); // 排除当前页面

      routesToPreload.forEach((route, index) => {
        // 分批预加载，避免一次性加载过多
        setTimeout(() => {
          router.prefetch(route);
        }, index * 100); // 每100ms预加载一个
      });
    }, 1000); // 页面加载完成1秒后开始预加载

    return () => clearTimeout(preloadTimer);
  }, [router]);

  return null; // 这是一个纯逻辑组件，不渲染任何内容
}