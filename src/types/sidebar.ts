/**
 * 侧边栏相关的统一类型定义系统
 * 提供完整的类型安全性和编译时检查
 */

import type { ReactNode } from 'react';
import type { ModuleType, RoutePath } from './routes';

/**
 * 侧边栏状态类型
 */
export interface SidebarState {
  readonly collapsed: boolean;
  readonly openKeys: readonly string[];
  readonly selectedKey: string;
  readonly searchQuery: string;
  readonly searchActive: boolean;
}

/**
 * 侧边栏配置类型
 */
export interface SidebarConfig {
  readonly defaultCollapsed: boolean;
  readonly enableSearch: boolean;
  readonly enableAccordion: boolean;
  readonly enableAnimation: boolean;
  readonly width: {
    readonly expanded: number;
    readonly collapsed: number;
  };
  readonly breakpoint: {
    readonly mobile: number;
    readonly tablet: number;
  };
}

/**
 * 菜单项基础接口
 */
export interface BaseMenuItem {
  readonly key: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly permission?: string;
}

/**
 * 叶子菜单项（没有子菜单）
 */
export interface LeafMenuItem extends BaseMenuItem {
  readonly path: RoutePath;
  readonly children?: never;
  readonly type: 'leaf';
}

/**
 * 分组菜单项（有子菜单）
 */
export interface GroupMenuItem extends BaseMenuItem {
  readonly path?: RoutePath;
  readonly children: readonly MenuItem[];
  readonly type: 'group';
}

/**
 * 菜单项联合类型
 */
export type MenuItem = LeafMenuItem | GroupMenuItem;

/**
 * 菜单树结构
 */
export interface MenuTree {
  readonly items: readonly MenuItem[];
  readonly totalCount: number;
  readonly leafCount: number;
  readonly groupCount: number;
}

/**
 * 搜索相关类型
 */
export interface SearchResult {
  readonly item: MenuItem;
  readonly path: readonly string[]; // 从根到该项的路径
  readonly matchType: 'label' | 'path' | 'keyword';
  readonly score: number; // 匹配分数，用于排序
}

export interface SearchState {
  readonly query: string;
  readonly results: readonly SearchResult[];
  readonly loading: boolean;
  readonly error?: string;
}

/**
 * 导航相关类型
 */
export interface NavigationState {
  readonly currentPath: RoutePath;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly activeModule: ModuleType;
}

export interface BreadcrumbItem {
  readonly label: string;
  readonly path?: RoutePath;
  readonly icon?: ReactNode;
}

/**
 * 侧边栏事件类型
 */
export interface SidebarEvents {
  onToggle: () => void;
  onMenuClick: (key: string, path?: RoutePath) => void;
  onOpenChange: (openKeys: readonly string[]) => void;
  onSearch: (query: string) => void;
  onSearchClear: () => void;
}

/**
 * 侧边栏组件属性类型
 */
export interface SidebarProps {
  readonly state: SidebarState;
  readonly config: SidebarConfig;
  readonly menuTree: MenuTree;
  readonly searchState: SearchState;
  readonly navigationState: NavigationState;
  readonly events: SidebarEvents;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

/**
 * 菜单组件属性类型
 */
export interface MenuProps {
  readonly items: readonly MenuItem[];
  readonly selectedKey: string;
  readonly openKeys: readonly string[];
  readonly collapsed: boolean;
  readonly onItemClick: (key: string, path?: RoutePath) => void;
  readonly onOpenChange: (openKeys: readonly string[]) => void;
}

/**
 * 搜索组件属性类型
 */
export interface SearchProps {
  readonly query: string;
  readonly results: readonly SearchResult[];
  readonly loading: boolean;
  readonly collapsed: boolean;
  readonly onSearch: (query: string) => void;
  readonly onClear: () => void;
  readonly onResultClick: (result: SearchResult) => void;
}

/**
 * 切换按钮组件属性类型
 */
export interface ToggleProps {
  readonly collapsed: boolean;
  readonly onToggle: () => void;
  readonly disabled?: boolean;
}

/**
 * 类型守卫函数
 */
export function isLeafMenuItem(item: MenuItem): item is LeafMenuItem {
  return item.type === 'leaf';
}

export function isGroupMenuItem(item: MenuItem): item is GroupMenuItem {
  return item.type === 'group';
}

export function hasChildren(item: MenuItem): item is GroupMenuItem {
  return 'children' in item && Array.isArray(item.children) && item.children.length > 0;
}

/**
 * 工具类型
 */
export type MenuItemKey = string;
export type MenuItemPath = readonly string[];
export type SearchScore = number;

/**
 * 侧边栏主题类型
 */
export interface SidebarTheme {
  readonly colors: {
    readonly background: string;
    readonly border: string;
    readonly text: string;
    readonly textSecondary: string;
    readonly hover: string;
    readonly active: string;
    readonly icon: string;
  };
  readonly spacing: {
    readonly padding: string;
    readonly margin: string;
    readonly itemHeight: string;
  };
  readonly animation: {
    readonly duration: string;
    readonly easing: string;
  };
}

/**
 * 响应式断点类型
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * 侧边栏模式类型
 */
export type SidebarMode = 'inline' | 'popup' | 'drawer';

/**
 * 菜单展开模式类型
 */
export type MenuOpenMode = 'accordion' | 'multiple';

/**
 * 侧边栏位置类型
 */
export type SidebarPosition = 'left' | 'right';

/**
 * 导出所有类型的别名（使用ES2015模块语法）
 */
export type SidebarStateType = SidebarState;
export type SidebarConfigType = SidebarConfig;
export type MenuItemType = MenuItem;
export type MenuTreeType = MenuTree;
export type SearchResultType = SearchResult;
export type SearchStateType = SearchState;
export type NavigationStateType = NavigationState;
export type SidebarEventsType = SidebarEvents;
export type SidebarPropsType = SidebarProps;
export type SidebarThemeType = SidebarTheme;

/**
 * 侧边栏所有类型的联合类型
 */
export type SidebarTypes = 
  | SidebarState
  | SidebarConfig
  | MenuItem
  | MenuTree
  | SearchResult
  | SearchState
  | NavigationState
  | SidebarEvents
  | SidebarProps
  | SidebarTheme;