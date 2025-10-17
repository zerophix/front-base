/**
 * API Cache 测试
 */

import { ApiCache } from '../api/cache';

describe('ApiCache', () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache({
      ttl: 1000, // 1秒用于测试
      maxSize: 3,
    });
  });

  describe('基本缓存操作', () => {
    it('should set and get cache data', () => {
      const testData = { id: 1, name: 'test' };
      cache.set('/api/test', testData);
      
      const result = cache.get('/api/test');
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent cache', () => {
      const result = cache.get('/api/nonexistent');
      expect(result).toBeNull();
    });

    it('should handle cache with parameters', () => {
      const testData = { id: 1, name: 'test' };
      const params = { page: 1, size: 10 };
      
      cache.set('/api/test', testData, params);
      
      const result = cache.get('/api/test', params);
      expect(result).toEqual(testData);
      
      // Different params should return null
      const resultDifferentParams = cache.get('/api/test', { page: 2, size: 10 });
      expect(resultDifferentParams).toBeNull();
    });
  });

  describe('缓存过期', () => {
    it('should return null for expired cache', async () => {
      const testData = { id: 1, name: 'test' };
      cache.set('/api/test', testData);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = cache.get('/api/test');
      expect(result).toBeNull();
    });

    it('should use custom TTL', async () => {
      const testData = { id: 1, name: 'test' };
      cache.set('/api/test', testData, undefined, 2000); // 2秒TTL
      
      // Wait 1.1 seconds (should still be valid)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = cache.get('/api/test');
      expect(result).toEqual(testData);
    });
  });

  describe('缓存大小限制', () => {
    it('should remove oldest entry when max size exceeded', () => {
      cache.set('/api/test1', { id: 1 });
      cache.set('/api/test2', { id: 2 });
      cache.set('/api/test3', { id: 3 });
      cache.set('/api/test4', { id: 4 }); // This should remove test1
      
      expect(cache.get('/api/test1')).toBeNull();
      expect(cache.get('/api/test2')).toEqual({ id: 2 });
      expect(cache.get('/api/test3')).toEqual({ id: 3 });
      expect(cache.get('/api/test4')).toEqual({ id: 4 });
    });
  });

  describe('缓存删除和清理', () => {
    it('should delete specific cache entry', () => {
      cache.set('/api/test1', { id: 1 });
      cache.set('/api/test2', { id: 2 });
      
      cache.delete('/api/test1');
      
      expect(cache.get('/api/test1')).toBeNull();
      expect(cache.get('/api/test2')).toEqual({ id: 2 });
    });

    it('should delete cache entry with parameters', () => {
      const params = { page: 1 };
      cache.set('/api/test', { id: 1 }, params);
      cache.set('/api/test', { id: 2 }, { page: 2 });
      
      cache.delete('/api/test', params);
      
      expect(cache.get('/api/test', params)).toBeNull();
      expect(cache.get('/api/test', { page: 2 })).toEqual({ id: 2 });
    });

    it('should clear all cache', () => {
      cache.set('/api/test1', { id: 1 });
      cache.set('/api/test2', { id: 2 });
      
      cache.clear();
      
      expect(cache.get('/api/test1')).toBeNull();
      expect(cache.get('/api/test2')).toBeNull();
    });

    it('should invalidate cache by string pattern', () => {
      cache.set('/api/users/1', { id: 1 });
      cache.set('/api/users/2', { id: 2 });
      cache.set('/api/posts/1', { id: 1 });
      
      cache.invalidate('/api/users');
      
      expect(cache.get('/api/users/1')).toBeNull();
      expect(cache.get('/api/users/2')).toBeNull();
      expect(cache.get('/api/posts/1')).toEqual({ id: 1 });
    });

    it('should invalidate cache by regex pattern', () => {
      cache.set('/api/users/1', { id: 1 });
      cache.set('/api/users/2', { id: 2 });
      cache.set('/api/posts/1', { id: 1 });
      
      cache.invalidate(/\/api\/users\/\d+/);
      
      expect(cache.get('/api/users/1')).toBeNull();
      expect(cache.get('/api/users/2')).toBeNull();
      expect(cache.get('/api/posts/1')).toEqual({ id: 1 });
    });
  });

  describe('缓存统计', () => {
    it('should return cache statistics', () => {
      cache.set('/api/test1', { id: 1 });
      cache.set('/api/test2', { id: 2 });
      
      const stats = cache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('ttl');
      expect(stats.entries[0]).toHaveProperty('expired');
    });

    it('should include entry details in statistics', () => {
      cache.set('/api/test', { id: 1 });
      
      const stats = cache.getStats();
      const entry = stats.entries[0];
      
      expect(entry.key).toContain('/api/test');
      expect(typeof entry.age).toBe('number');
      expect(entry.ttl).toBe(1000);
      expect(typeof entry.expired).toBe('boolean');
    });
  });

  describe('默认配置', () => {
    it('should use default configuration', () => {
      const defaultCache = new ApiCache();
      const testData = { id: 1 };
      
      defaultCache.set('/api/test', testData);
      const result = defaultCache.get('/api/test');
      
      expect(result).toEqual(testData);
    });
  });
});