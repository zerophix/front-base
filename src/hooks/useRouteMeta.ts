/**
 * 从路由配置派生页面元信息（title/breadcrumbs/recordNumber）
 * 统一页面导航的单一数据源
 */

'use client';

import { usePageStore } from '@/store';
import { useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { routes, type RouteConfig } from '@/config/routes';

export interface RouteMeta {
  title: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  recordNumber?: string;
}

/**
 * 根据路径获取路由配置
 */
export function getRouteByPath(pathname: string): RouteConfig | undefined {
  return routes.find((r) => r.path === pathname);
}

/**
 * 根据路径派生页面元信息（用于非 Hook 场景）
 */
export function getRouteMeta(pathname: string): RouteMeta {
  const route = getRouteByPath(pathname);
  if (route) {
    return {
      title: route.title,
      breadcrumbs: route.breadcrumbs,
      recordNumber: route.recordNumber,
    };
  }

  // Fallback：未知路径时，尝试基于模块前缀生成简化元信息
  const modulePrefix = pathname.split('/')[1] || '';
  const moduleLabelMap: Record<string, string> = {
    equipment: '设备管理',
    quality: '质量管理',
    personnel: '人员管理',
    project: '项目管理',
    data: '基础管理',
    home: '首页',
    records: '记录管理',
  };
  const moduleLabel = moduleLabelMap[modulePrefix] || 'LIMS';
  const lastSegment = pathname.split('/').filter(Boolean).pop() || moduleLabel;
  return {
    title: routeTitleCase(lastSegment),
    breadcrumbs: [{ label: moduleLabel, href: `/${modulePrefix}` }],
  };
}

/**
 * React Hook：读取当前路径并派生元信息
 */
export function useRouteMeta(): RouteMeta {
  const pathname = usePathname();
  const meta = useMemo(() => getRouteMeta(pathname || '/'), [pathname]);

  useEffect(() => {
    usePageStore.getState().setPageConfig({ title: meta.title, breadcrumbs: meta.breadcrumbs, recordNumber: meta.recordNumber });
  }, [meta]);

  return meta;
}

function routeTitleCase(text: string) {
  try {
    return text
      .replace(/[-_]/g, ' ')
      .replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
  } catch {
    return text;
  }
}