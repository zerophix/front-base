import { test as base, expect } from '@playwright/test';

// 扩展基础测试，添加自定义fixtures
export const test = base.extend<{
  // 可以在这里添加自定义的fixtures
  // 例如：认证用户、测试数据等
}>({
  // 示例：自动登录的用户fixture
  // authenticatedUser: async ({ page }, use) => {
  //   // 执行登录逻辑
  //   await page.goto('/login');
  //   await page.fill('[data-testid="username"]', 'testuser');
  //   await page.fill('[data-testid="password"]', 'testpass');
  //   await page.click('[data-testid="login-button"]');
  //   await page.waitForURL('/dashboard');
  //   
  //   await use(page);
  // },
});

export { expect } from '@playwright/test';