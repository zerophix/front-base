'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { routes } from '@/config/routes';
import { buildMenuTree, filterMenuItems, toAntdMenuItems, collectSearchResults } from '@/config/routes/helpers';
import { useUIStore } from '@/store';
import { SidebarSearch } from '@/components/layouts/Sidebar/navigation/SidebarSearch';
import { SidebarMenu } from '@/components/layouts/Sidebar/navigation/SidebarMenu';
import { SidebarToggle } from '@/components/layouts/Sidebar/controls/SidebarToggle';

// 将菜单树构建移到组件外部，避免重复计算
const menuTree = buildMenuTree(routes);





const SidebarComponent: React.FC = () => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理定时器
      // 注意：需要将定时器ID保存到ref或state中
      // 示例：if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const openKeys = useUIStore((s) => s.sidebarOpenKeys);
  const setOpenKeys = useUIStore((s) => s.setSidebarOpenKeys);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // 使用防抖优化搜索性能
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150); // 150ms防抖延迟

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // 使用静态菜单树和防抖查询
  const filtered = useMemo(() => filterMenuItems(menuTree, debouncedQuery), [debouncedQuery]);
  const menuItems = useMemo(() => toAntdMenuItems(filtered, debouncedQuery), [filtered, debouncedQuery]);

  // 收集搜索结果详情
  const searchResults = useMemo(() => {
    return collectSearchResults(menuTree, debouncedQuery);
  }, [debouncedQuery]);

  // 计算搜索结果数量 - 优化性能，直接使用搜索结果长度
  const searchResultsCount = useMemo(() => {
    return searchResults.length;
  }, [searchResults]);

  // 使用useCallback优化事件处理函数
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // 清空搜索的回调函数
  const handleClearSearch = useCallback(() => {
    setQuery('');
  }, []);

  // 处理菜单项点击事件：使用默认行为，按 key 导航
  const handleItemClick = useCallback((key: string) => {
    router.push(key);
  }, [router]);

  // 搜索时展开所有分组；否则保持用户当前展开状态
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // 搜索时展开所有有匹配结果的分组
      const getAllKeys = (items: any[]): string[] => {
        const keys: string[] = [];
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            keys.push(String(item.key));
            keys.push(...getAllKeys(item.children));
          }
        });
        return keys;
      };
      setOpenKeys(getAllKeys(menuItems) as readonly string[]);
    }
    // 非搜索时不自动修改 openKeys，保持静态
  }, [debouncedQuery, menuItems, setOpenKeys]);

  return (
    <aside className={styles.sidebar} data-collapsed={collapsed} data-role="sidebar-root">
      <SidebarSearch 
        value={query} 
        onChange={handleQueryChange} 
        collapsed={collapsed}
        searchResultsCount={searchResultsCount}
        searchResults={searchResults}
        onClear={handleClearSearch}
      />
      <SidebarMenu
        items={menuItems as any}
        selectedKey={pathname || ''}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        collapsed={collapsed}
        onItemClick={handleItemClick}
      />
      <SidebarToggle collapsed={collapsed} onToggle={toggleSidebar} />
    </aside>
  );
};

// 使用React.memo优化Sidebar组件
export const Sidebar = React.memo(SidebarComponent);