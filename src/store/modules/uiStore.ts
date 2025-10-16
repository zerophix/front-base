/**
 * UI 状态管理模块
 * 负责侧边栏、主题、loading等UI状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 兼容 SSR 的安全存储适配：在服务端使用 noop storage，避免访问 localStorage 导致崩溃
const createNoopStorage = (): Storage => ({
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
});
const safeStorage = () => (typeof window !== 'undefined' ? localStorage : createNoopStorage());

export interface IUIState {
  // 主题
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // 全局loading
  loading: boolean;
  loadingCount: number;
  showLoading: () => void;
  hideLoading: () => void;

  // 侧边栏折叠状态
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // 侧边栏展开的分组 keys（保持静态不跳动）
  sidebarOpenKeys: string[];
  setSidebarOpenKeys: (keys: string[]) => void;
}

export const useUIStore = create<IUIState>()(
  persist(
    (set) => ({
      // 初始值
      theme: 'light',
      loading: false,
      loadingCount: 0,
      sidebarCollapsed: true, // 默认为折叠状态，只显示一级目录
      sidebarOpenKeys: [],
      
      // 主题操作
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      // Loading操作
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

      // 侧边栏折叠
      setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarOpenKeys: (keys: string[]) => set({ sidebarOpenKeys: keys }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(safeStorage),
      partialize: (state) => ({
          theme: state.theme,
          // 不持久化 sidebarCollapsed，始终使用默认的折叠状态
          // sidebarCollapsed: state.sidebarCollapsed,
          sidebarOpenKeys: state.sidebarOpenKeys,
        }),
    }
  )
);

