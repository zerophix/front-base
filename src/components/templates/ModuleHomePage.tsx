/**
 * 模块主页模板
 *
 * - 根据模块路径，自动获取子路由并渲染为菜单网格
 * - 统一布局和样式
 */
'use client';

import { MainLayout, PageContainer } from '@/components/layouts/MainLayout';
import { MenuGrid } from '@/components/layouts/MenuGrid';
import { useMemo } from 'react';
import { getChildRoutes, getRouteConfig } from '@/config/routes';
import { getIcon } from '@/config/icons';

interface ModuleHomePageProps {
  modulePath: string;
}

export function ModuleHomePage({ modulePath }: ModuleHomePageProps) {
  const moduleInfo = useMemo(() => getRouteConfig(modulePath), [modulePath]);

  const menuItems = useMemo(() => {
    if (!moduleInfo) return [];
    const children = getChildRoutes(modulePath);
    return children.map((r) => ({
      title: r.menuLabel || r.title,
      href: r.path,
      icon: getIcon(r.icon as any),
    }));
  }, [moduleInfo, modulePath]);

  if (!moduleInfo) {
    return (
      <MainLayout>
        <PageContainer title="模块未找到" />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer title={moduleInfo.title}>
        <MenuGrid items={menuItems} />
      </PageContainer>
    </MainLayout>
  );
}