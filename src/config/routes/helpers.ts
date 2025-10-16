import type { RouteConfig } from '@/config/routes';
import React from 'react';
import { getIcon, getModuleIcon } from '@/config/icons';

// 搜索高亮组件 - 优雅的设计
const HighlightText: React.FC<{ text: string; searchText: string }> = ({ text, searchText }) => {
  if (!searchText.trim()) {
    return React.createElement('span', null, text);
  }

  const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchText})`, 'gi');
  const parts = text.split(regex);

  return React.createElement(
    'span',
    null,
    parts.map((part, index) => {
      const isMatch = new RegExp(escapedSearchText, 'gi').test(part);
      return isMatch
        ? React.createElement(
            'span',
            { 
              key: index, 
              style: { 
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                color: '#1890ff',
                fontWeight: '500',
                padding: '1px 3px',
                borderRadius: '3px',
                border: '1px solid rgba(24, 144, 255, 0.2)',
                boxShadow: '0 1px 2px rgba(24, 144, 255, 0.1)'
              } 
            },
            part
          )
        : React.createElement('span', { key: index }, part);
    })
  );
};

// 通用菜单项类型：与侧边栏解耦
export interface MenuItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

// 根据 routes 构建侧边栏菜单树
export const buildMenuTree = (routesList: RouteConfig[]): MenuItem[] => {
  const moduleConfig: { key: RouteConfig['module']; label: string }[] = [
    { key: 'home', label: '首页' },
    { key: 'data', label: '基础管理' },
    { key: 'project', label: '项目管理' },
    { key: 'equipment', label: '设备管理' },
    { key: 'personnel', label: '人员管理' },
    { key: 'quality', label: '质量管理' },
    { key: 'records', label: '记录管理' },
  ];

  const menuItems: MenuItem[] = [];

  moduleConfig.forEach(({ key, label }) => {
    const moduleRoutes = routesList.filter((route) => route.module === key);
    if (!moduleRoutes.length) return;

    // 查找根路由：没有parent的路由，或者路径最短的路由
    let rootRoute = moduleRoutes.find((route) => !route.parent);
    
    // 如果没有找到没有parent的路由，则使用模块的基础路径
    if (!rootRoute) {
      // 尝试找到模块的基础路径（如 /data, /project 等）
      const basePath = `/${key}`;
      rootRoute = moduleRoutes.find((route) => route.path === basePath);
      
      // 如果还是没找到，使用路径最短的路由作为根路由
      if (!rootRoute) {
        rootRoute = moduleRoutes.reduce((shortest, current) => 
          current.path.length < shortest.path.length ? current : shortest
        );
      }
    }

    const childRoutes = moduleRoutes.filter((route) => 
      route.path !== rootRoute!.path && 
      (route.parent === rootRoute!.path || route.path.startsWith(rootRoute!.path + '/'))
    );

    const children: MenuItem[] = childRoutes.map((route) => ({
      label: route.menuLabel || route.title,
      path: route.path,
      icon: getIcon(route.icon as any),
    }));

    menuItems.push({
      label,
      path: rootRoute.path,
      icon: getModuleIcon(key),
      children: children.length ? children : undefined,
    });
  });

  return menuItems;
};

// 文本过滤菜单项（保留命中项及其祖先）
export const filterMenuItems = (items: MenuItem[], searchText: string): MenuItem[] => {
  const text = searchText.trim();
  if (!text) return items;

  const match = (label: string) => label.toLowerCase().includes(text.toLowerCase());

  const dfs = (list: MenuItem[]): MenuItem[] =>
    list
      .map((it) => {
        const children = it.children ? dfs(it.children) : undefined;
        const hit = match(it.label) || (children && children.length > 0);
        if (!hit) return null;
        return { ...it, children } as MenuItem;
      })
      .filter(Boolean) as MenuItem[];

  return dfs(items);
};

export interface SearchResult {
  label: string;
  path: string;
  parentPath?: string;
}

export const collectSearchResults = (items: MenuItem[], searchText: string): SearchResult[] => {
  if (!searchText) return [];

  const results: SearchResult[] = [];

  const dfs = (item: MenuItem, ancestors: MenuItem[] = []): void => {
    const matchesSearch = item.label.toLowerCase().includes(searchText.toLowerCase());
    
    if (matchesSearch) {
      const parentPath = ancestors.length > 0 
        ? ancestors.map(a => a.label).join(' > ')
        : undefined;
      
      results.push({
        label: item.label,
        path: item.path || '',
        parentPath
      });
    }

    if (item.children) {
      item.children.forEach(child => dfs(child, [...ancestors, item]));
    }
  };

  items.forEach(item => dfs(item));
  return results;
};

// 转换为 Ant Design Menu 组件所需的格式
export const toAntdMenuItems = (items: MenuItem[], searchText?: string) => {
  return items.map((group) => {
    const menuItem: any = {
      key: group.path || group.label,
      icon: group.icon,
      label: searchText ? HighlightText({ text: group.label, searchText }) : group.label,
      title: group.label, // 为缩放状态提供tooltip
    };

    // 如果有子菜单，递归处理并添加弹出菜单配置
    if (group.children && group.children.length > 0) {
      menuItem.children = toAntdMenuItems(group.children, searchText);
      menuItem.popupClassName = 'custom-submenu-popup';
      // 减少偏移量，让弹出框更贴近触发元素，视觉上更紧凑
      menuItem.popupOffset = [4, -2];
    }

    return menuItem;
  });
};

// 根据路径推导/获取面包屑
export const deriveBreadcrumbs = (
  routesList: RouteConfig[],
  path: string
): RouteConfig['breadcrumbs'] => {
  const target = routesList.find((r) => r.path === path);
  if (target) return target.breadcrumbs;

  // Fallback：未命中时，尝试用父子关系推导
  const breadcrumbs: { label: string; href?: string }[] = [];
  const byPath = new Map(routesList.map((r) => [r.path, r] as const));
  let current = byPath.get(path);

  // 沿 parent 向上回溯
  while (current) {
    breadcrumbs.unshift({ label: current.title, href: current.parent });
    if (!current.parent) break;
    current = byPath.get(current.parent);
  }

  // 至少返回一个节点以避免空数组
  if (!breadcrumbs.length) breadcrumbs.push({ label: path });
  return breadcrumbs;
};