// 统一入口：直接复用 routes.ts 的单一数据源
export * from '../routes';

// 兼容历史用法：保留 appRoutes 别名，指向 routes
export { routes as appRoutes } from '../routes';