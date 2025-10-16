/**
 * 用户状态管理模块
 * 负责用户信息和权限
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

export interface IUser {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  role?: string;
  email?: string;
  permissions?: string[];
}

interface IUserState {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  clearUser: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useUserStore = create<IUserState>()(
  persist(
    (set, get) => ({
      user: null,
      
      setUser: (user) => set({ user }),
      
      clearUser: () => set({ user: null }),
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(safeStorage),
    }
  )
);

