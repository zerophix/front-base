/**
 * API 缓存层
 * 提供请求缓存和失效策略
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number; // 默认缓存时间 (ms)
  maxSize?: number; // 最大缓存条目数
}

/**
 * API 缓存管理器
 */
export class ApiCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 默认5分钟
    this.maxSize = options.maxSize || 100; // 默认最多100个条目
  }

  /**
   * 生成缓存键
   */
  private generateKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramsStr}`;
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 确保缓存不超过最大大小
   */
  private ensureSize(): void {
    if (this.cache.size >= this.maxSize) {
      // 删除最早的条目
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * 获取缓存
   */
  get<T = any>(url: string, params?: any): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T = any>(url: string, data: T, params?: any, ttl?: number): void {
    this.ensureSize();
    const key = this.generateKey(url, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  /**
   * 删除指定缓存
   */
  delete(url: string, params?: any): void {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 失效匹配的缓存
   */
  invalidate(urlPattern: string | RegExp): void {
    const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: this.isExpired(entry),
      })),
    };
  }
}

// 创建默认缓存实例
export const apiCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
});

