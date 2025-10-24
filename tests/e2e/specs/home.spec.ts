import { test, expect } from '../fixtures/base';
import { HomePage } from '../pages/HomePage';
import { TestHelpers } from '../utils/test-helpers';

test.describe('首页功能测试', () => {
  let homePage: HomePage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    helpers = new TestHelpers(page);
    await homePage.goto();
  });

  test('页面基本元素加载正确 @smoke', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/LIMS|首页|Home|Dashboard/);
    
    // 检查页面是否加载完成
    await expect(page.locator('body')).toBeVisible();
    
    // 检查页面是否有内容
    await expect(page.locator('html')).toContainText(/./); // 至少包含一些文本
    
    // 检查页面性能
    await helpers.checkPerformance();
  });

  test('模块卡片显示和交互', async ({ page }) => {
    // 等待模块卡片加载
    await homePage.moduleCards.first().waitFor({ state: 'visible' });
    
    // 获取模块卡片标题
    const moduleCardTitles = await homePage.getModuleCardTitles();
    expect(moduleCardTitles.length).toBeGreaterThan(0);
    
    // 检查每个模块卡片都有标题
    for (const title of moduleCardTitles) {
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    }
    
    // 点击第一个模块卡片
    if (moduleCardTitles.length > 0) {
      await homePage.clickModuleCard(moduleCardTitles[0]);
      
      // 验证页面跳转
      await expect(page).not.toHaveURL('/');
    }
  });

  test('搜索功能', async ({ page }) => {
    // 检查搜索框是否存在
    await homePage.searchInput.waitFor({ state: 'visible' });
    
    // 执行搜索
    await homePage.search('测试');
    
    // 验证搜索结果或页面变化
    // 这里需要根据实际的搜索实现来调整
    await helpers.waitForPageLoad();
  });

  test('侧边栏功能', async ({ page }) => {
    // 检查侧边栏初始状态
    const initialCollapsed = await homePage.isSidebarCollapsed();
    
    // 切换侧边栏
    await homePage.toggleSidebar();
    
    // 验证状态改变
    const afterToggleCollapsed = await homePage.isSidebarCollapsed();
    expect(afterToggleCollapsed).not.toBe(initialCollapsed);
    
    // 再次切换回原状态
    await homePage.toggleSidebar();
    const finalCollapsed = await homePage.isSidebarCollapsed();
    expect(finalCollapsed).toBe(initialCollapsed);
  });

  test('用户菜单功能', async ({ page }) => {
    // 打开用户菜单
    await homePage.openUserMenu();
    
    // 检查菜单项
    const userMenuDropdown = page.locator('.ant-dropdown-menu');
    await expect(userMenuDropdown).toBeVisible();
    
    // 检查常见菜单项
    const menuItems = userMenuDropdown.locator('.ant-dropdown-menu-item');
    const menuCount = await menuItems.count();
    expect(menuCount).toBeGreaterThan(0);
  });

  test('通知功能', async ({ page }) => {
    // 检查通知图标
    await homePage.notifications.waitFor({ state: 'visible' });
    
    // 获取通知数量
    const notificationCount = await homePage.getNotificationCount();
    expect(notificationCount).toBeGreaterThanOrEqual(0);
    
    // 如果有通知，点击查看
    if (notificationCount > 0) {
      await homePage.notifications.click();
      
      // 检查通知面板或跳转
      await helpers.waitForPageLoad();
    }
  });

  test('响应式设计 - 移动端', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 重新加载页面
    await homePage.goto();
    
    // 检查移动端布局
    await homePage.checkBasicElements();
    
    // 在移动端，侧边栏可能默认是折叠的
    const isMobileCollapsed = await homePage.isSidebarCollapsed();
    // 移动端通常侧边栏是折叠的，但这取决于具体实现
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('页面可访问性检查', async ({ page }) => {
    // 检查基本的可访问性要求
    await helpers.checkAccessibility();
    
    // 检查键盘导航
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('页面加载性能', async ({ page }) => {
    // 重新加载页面并测量性能
    const startTime = Date.now();
    await homePage.goto();
    const loadTime = Date.now() - startTime;
    
    // 页面应该在合理时间内加载完成
    expect(loadTime).toBeLessThan(5000); // 5秒内
    
    // 检查性能指标
    await helpers.checkPerformance();
  });

  test('错误处理', async ({ page }) => {
    // 测试网络错误情况
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // 重新加载页面
    await homePage.goto();
    
    // 页面应该能够优雅地处理错误
    await homePage.checkBasicElements();
    
    // 清除路由拦截
    await page.unroute('**/api/**');
  });

  test.describe('不同浏览器兼容性', () => {
    test('Chrome浏览器', async ({ page }) => {
      // 这个测试会在Chrome中运行
      await homePage.checkBasicElements();
      await helpers.checkPerformance();
    });

    // 注意：其他浏览器的测试会通过Playwright配置自动运行
  });
});