/**
 * 页面配置 Hook
 * 用于设置页面标题、面包屑和记录编号到全局状态
 */

'use client';

import { usePageStore } from '@/store/modules/pageStore';
import { useEffect } from 'react';
import type { RouteMeta } from '@/hooks/useRouteMeta';

export interface PageConfig {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  recordNumber?: string;
}

/**
 * 设置页面配置到全局状态
 * @param config 页面配置对象
 */
export function usePageConfig(config: PageConfig | RouteMeta) {
  const { setPageConfig } = usePageStore();

  useEffect(() => {
    setPageConfig({
      title: config.title,
      breadcrumbs: config.breadcrumbs || [],
      recordNumber: config.recordNumber || '',
    });
  }, [config, setPageConfig]);
}