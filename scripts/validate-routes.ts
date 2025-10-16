#!/usr/bin/env tsx

/**
 * 路由配置验证脚本
 * 用于验证所有路由配置的正确性
 */

import { routes } from '../src/config/routes';
import type { RouteConfig } from '../src/config/routes';

console.log('🔍 开始验证路由配置...\n');

// 基础验证
function validateBasicRoutes(routes: RouteConfig[]): { errors: string[], warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const pathSet = new Set<string>();

  routes.forEach(route => {
    // 检查路径重复
    if (pathSet.has(route.path)) {
      errors.push(`路径重复: ${route.path}`);
    } else {
      pathSet.add(route.path);
    }

    // 检查基本字段
    if (!route.title || route.title.trim().length === 0) {
      errors.push(`路由标题为空: ${route.path}`);
    }

    if (!route.path.startsWith('/')) {
      errors.push(`路径格式错误: ${route.path}`);
    }

    if (!route.breadcrumbs || route.breadcrumbs.length === 0) {
      errors.push(`面包屑为空: ${route.path}`);
    }

    // 检查记录编号格式
    if (route.recordNumber && !/^SZD-[A-Z]+-[A-Z]+-[0-9]+-[0-9]+-[0-9]{4}$/.test(route.recordNumber)) {
      warnings.push(`记录编号格式可能不正确: ${route.path} - ${route.recordNumber}`);
    }
  });

  return { errors, warnings };
}

// 验证路由配置
const { errors, warnings } = validateBasicRoutes(routes);

console.log('📋 路由配置验证结果:');
if (errors.length > 0) {
  console.log('❌ 错误:');
  errors.forEach(error => console.log(`  • ${error}`));
}

if (warnings.length > 0) {
  console.log('⚠️  警告:');
  warnings.forEach(warning => console.log(`  • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 基础验证通过');
}

// 统计信息
const totalRoutes = routes.length;
const moduleStats = routes.reduce((acc, route) => {
  acc[route.module] = (acc[route.module] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n📊 路由统计信息:');
console.log(`总路由数: ${totalRoutes}`);
console.log('各模块路由数:');
Object.entries(moduleStats).forEach(([module, count]) => {
  console.log(`  ${module}: ${count}`);
});

// 检查记录编号
const routesWithRecordNumber = routes.filter(r => r.recordNumber);
console.log(`\n📝 有记录编号的路由: ${routesWithRecordNumber.length}/${totalRoutes}`);

// 检查父子关系
const parentRoutes = routes.filter(r => !r.parent);
const childRoutes = routes.filter(r => r.parent);
console.log(`\n🏗️  路由结构: ${parentRoutes.length} 个父路由, ${childRoutes.length} 个子路由`);

// 退出状态
if (errors.length > 0) {
  console.log('\n❌ 验证失败，请修复上述错误');
  process.exit(1);
} else {
  console.log('\n✅ 所有验证通过！');
  process.exit(0);
}