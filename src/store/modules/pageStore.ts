/**
 * 页面配置状态管理模块
 * 负责页面标题、面包屑、记录编号
 */

import { create } from 'zustand';

interface IPageState {
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  recordNumber: string;
  
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  setRecordNumber: (recordNumber: string) => void;
  
  // 批量设置
  setPageConfig: (config: {
    title: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    recordNumber?: string;
  }) => void;
}

export const usePageStore = create<IPageState>()((set) => ({
  pageTitle: '',
  breadcrumbs: [],
  recordNumber: '',
  
  setPageTitle: (pageTitle) => set({ pageTitle }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setRecordNumber: (recordNumber) => set({ recordNumber }),
  
  setPageConfig: ({ title, breadcrumbs = [], recordNumber = '' }) => set({
    pageTitle: title,
    breadcrumbs,
    recordNumber,
  }),
}));

