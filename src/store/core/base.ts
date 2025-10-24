/**
 * 状态管理基础设施
 * 提供统一的状态管理模式和工具
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  StoreMiddleware
} from '../../types/core';
import { AsyncStatus, TypeUtils, type AppError, type Timestamp } from '../../types/core';

/**
 * SSR 安全的存储适配器
 */
const createSafeStorage = (): StateStorage => {
  if (typeof window === 'undefined') {
    // 服务端返回 noop storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  
  // 客户端使用 localStorage
  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch (error) {
        console.warn(`Failed to get item from localStorage: ${name}`, error);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.warn(`Failed to set item to localStorage: ${name}`, error);
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn(`Failed to remove item from localStorage: ${name}`, error);
      }
    },
  };
};

/**
 * 简化的安全存储（用于 createJSONStorage）
 */
export const createSimpleSafeStorage = () => 
  typeof window !== 'undefined' ? localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;

/**
 * 创建持久化配置
 */
export const createPersistConfig = <T>(
  name: string,
  options: Partial<{
    partialize?: (state: T) => Partial<T>;
    version?: number;
    migrate?: (persistedState: unknown, version: number) => T;
  }> = {}
) => ({
  name,
  storage: createJSONStorage(() => createSafeStorage()),
  partialize: options.partialize,
  version: options.version ?? 1,
  migrate: options.migrate,
});

/**
 * 状态工厂函数
 */
export const createStore = <T>(
  initializer: (
    set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void,
    get: () => T
  ) => T,
  options: {
    persist?: ReturnType<typeof createPersistConfig<T>>;
    middleware?: StoreMiddleware<T>[];
  } = {}
) => {
  const { persist: persistConfig, middleware = [] } = options;
  
  if (persistConfig) {
    return create<T>()(
      persist(
        subscribeWithSelector(initializer),
        persistConfig
      )
    );
  }
  
  let store = create<T>()(
    subscribeWithSelector(initializer)
  );
  
  // 应用中间件
  middleware.forEach(mw => {
    store = mw(store) as typeof store;
  });
  
  return store;
};

/**
 * 状态选择器工具
 */
export const createSelector = <T, R>(
  selector: (state: T) => R
) => {
  return selector;
};

/**
 * 状态订阅器工具
 */
export const createSubscriber = <T>(
  store: any,
  selector: (state: T) => unknown,
  callback: (value: unknown, previousValue: unknown) => void
) => {
  const unsubscribe = store.subscribe(selector, callback);
  
  return {
    unsubscribe,
    isActive: () => true, // 简化实现
  };
};

/**
 * 状态调试工具
 */
export const createStoreDebugger = <T>(storeName: string) => {
  if (process.env.NODE_ENV !== 'development') {
    return {
      log: () => {},
      logStateChange: () => {},
      logAction: () => {},
    };
  }
  
  return {
    log: (message: string, data?: unknown) => {
      console.log(`[${storeName}] ${message}`, data);
    },
    
    logStateChange: (action: string, prevState: T, nextState: T) => {
      console.group(`[${storeName}] ${action}`);
      console.log('Previous State:', prevState);
      console.log('Next State:', nextState);
      console.groupEnd();
    },
    
    logAction: (actionName: string, payload?: unknown) => {
      console.log(`[${storeName}] Action: ${actionName}`, payload);
    },
  };
};

/**
 * 状态验证工具
 */
export const createStateValidator = <T>(
  schema: (state: T) => boolean,
  errorMessage: string = 'Invalid state'
) => {
  return (state: T): void => {
    if (!schema(state)) {
      throw new Error(`State validation failed: ${errorMessage}`);
    }
  };
};

/**
 * 状态重置工具
 */
export const createStateResetter = <T>(
  initialState: T
) => {
  return (): T => ({ ...initialState });
};

/**
 * 批量状态更新工具
 */
export const createBatchUpdater = <T>(
  setState: (updater: (state: T) => T) => void
) => {
  let pendingUpdates: Array<(state: T) => T> = [];
  let isScheduled = false;
  
  const flush = () => {
    if (pendingUpdates.length === 0) return;
    
    setState((state) => {
      return pendingUpdates.reduce((acc, updater) => updater(acc), state);
    });
    
    pendingUpdates = [];
    isScheduled = false;
  };
  
  return {
    addUpdate: (updater: (state: T) => T) => {
      pendingUpdates.push(updater);
      
      if (!isScheduled) {
        isScheduled = true;
        // 使用 setTimeout 确保在下一个事件循环中执行
        setTimeout(flush, 0);
      }
    },
    
    flush,
    
    cancel: () => {
      pendingUpdates = [];
      isScheduled = false;
    },
  };
};

/**
 * 状态计算缓存工具
 */
export const createComputedCache = <T, R>(
  selector: (state: T) => R,
  isEqual: (a: R, b: R) => boolean = Object.is
) => {
  let lastState: T | undefined;
  let lastResult: R;
  let hasResult = false;
  
  return (state: T): R => {
    if (!hasResult || state !== lastState) {
      const newResult = selector(state);
      
      if (!hasResult || !isEqual(lastResult, newResult)) {
        lastResult = newResult;
        hasResult = true;
      }
      
      lastState = state;
    }
    
    return lastResult;
  };
};

/**
 * 状态同步工具（用于跨 tab 同步）
 */
export const createStateSyncer = <T>(
  storeName: string,
  getState: () => T,
  setState: (state: T) => void
) => {
  if (typeof window === 'undefined') {
    return { start: () => {}, stop: () => {} };
  }
  
  const channel = new BroadcastChannel(`store-sync-${storeName}`);
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'STATE_UPDATE') {
      setState(event.data.state);
    }
  };
  
  const broadcastState = (state: T) => {
    channel.postMessage({
      type: 'STATE_UPDATE',
      state,
      timestamp: Date.now(),
    });
  };
  
  return {
    start: () => {
      channel.addEventListener('message', handleMessage);
    },
    
    stop: () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    },
    
    broadcast: broadcastState,
  };
};