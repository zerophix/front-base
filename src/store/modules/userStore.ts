/**
 * 用户状态管理模块
 * 负责用户信息、登录状态等
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserStore, User } from '@/types/core';
import { createSimpleSafeStorage } from '../core/base';

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      
      setUser: (user: User | null) => set({ user }),
      
      clearUser: () => set({ user: null }),
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(createSimpleSafeStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

