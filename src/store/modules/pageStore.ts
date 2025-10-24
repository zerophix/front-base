/**
 * 页面配置状态管理模块
 * 负责页面标题、面包屑、记录编号
 * 注意：页面状态通常不需要持久化，因为它们是临时的
 */

import { create } from 'zustand';
import type { PageStore, BreadcrumbItem } from '@/types/core';

export const usePageStore = create<PageStore>()((set) => ({
  pageTitle: '',
  breadcrumbs: [],
  recordNumber: '',
  
  setPageTitle: (pageTitle: string) => set({ pageTitle }),
  setBreadcrumbs: (breadcrumbs: readonly BreadcrumbItem[]) => set({ breadcrumbs }),
  setRecordNumber: (recordNumber: string) => set({ recordNumber }),
  
  setPageConfig: ({ title, breadcrumbs = [], recordNumber = '' }: {
    title: string;
    breadcrumbs?: readonly BreadcrumbItem[];
    recordNumber?: string;
  }) => set({
    pageTitle: title,
    breadcrumbs,
    recordNumber,
  }),
}));

