/**
 * 状态管理统一入口
 * 导出所有状态管理相关的模块和工具
 */

// 核心基础设施
export * from './core/base';

// 状态管理模块
export { useUIStore } from './modules/uiStore';
export { useUserStore } from './modules/userStore';
export { usePageStore } from './modules/pageStore';

// 导入store实例用于开发工具
import { useUIStore } from './modules/uiStore';
import { useUserStore } from './modules/userStore';
import { usePageStore } from './modules/pageStore';

// 类型定义
export type {
  UIStore,
  UserStore,
  PageStore,
  ThemeType,
  User,
  BreadcrumbItem,
} from '../types/core';

/**
 * 开发工具
 */
export const devTools = {
  // 获取当前状态快照
  getStateSnapshot: () => ({
    ui: useUIStore.getState(),
    user: useUserStore.getState(),
    page: usePageStore.getState(),
    timestamp: new Date().toISOString(),
  }),
  
  // 打印状态快照到控制台
  logStateSnapshot: () => {
    console.log('🔍 State Snapshot:', devTools.getStateSnapshot());
  },
  
  // 重置所有状态
  resetAllStores: () => {
    // 注意：这会清除所有状态，包括持久化的状态
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ui-storage');
      localStorage.removeItem('user-storage');
      window.location.reload();
    }
  },
};

// 开发环境下暴露到全局
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).__STORE_DEV_TOOLS__ = devTools;
}
