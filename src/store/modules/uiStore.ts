/**
 * UI 状态管理模块
 * 负责侧边栏、主题、loading等UI状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UIStore, ThemeType } from '@/types/core';
import { Theme } from '@/types/core';
import { createSimpleSafeStorage } from '../core/base';

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // 初始状态
      theme: Theme.LIGHT,
      loading: false,
      loadingCount: 0,
      sidebarCollapsed: true, // 默认为折叠状态，只显示一级目录
      sidebarOpenKeys: [],
      
      // Actions
      setTheme: (theme: ThemeType) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT 
      })),
      
      // Loading 管理
      showLoading: () => set((state) => ({
        loadingCount: state.loadingCount + 1,
        loading: true,
      })),
      hideLoading: () => set((state) => {
        const newCount = Math.max(0, state.loadingCount - 1);
        return {
          loadingCount: newCount,
          loading: newCount > 0,
        };
      }),

      // 侧边栏管理
      setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarOpenKeys: (keys: readonly string[]) => set({ sidebarOpenKeys: keys }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(createSimpleSafeStorage),
      partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarOpenKeys: state.sidebarOpenKeys,
        }),
    }
  )
);

