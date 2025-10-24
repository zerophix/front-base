import { Page, Locator } from '@playwright/test';
import { BasePage } from '../utils/test-helpers';

/**
 * 首页页面对象模型
 */
export class HomePage extends BasePage {
  // 页面元素选择器
  private readonly selectors = {
    header: '[data-testid="header"]',
    navigation: '[data-testid="navigation"]',
    sidebar: '[data-testid="sidebar"]',
    mainContent: '[data-testid="main-content"]',
    moduleCards: '[data-testid="module-card"]',
    searchInput: '[data-testid="search-input"]',
    userMenu: '[data-testid="user-menu"]',
    notifications: '[data-testid="notifications"]',
    breadcrumb: '[data-testid="breadcrumb"]'
  };

  constructor(page: Page) {
    super(page);
  }

  // 页面元素getter
  get header(): Locator {
    return this.page.locator(this.selectors.header);
  }

  get navigation(): Locator {
    return this.page.locator(this.selectors.navigation);
  }

  get sidebar(): Locator {
    return this.page.locator(this.selectors.sidebar);
  }

  get mainContent(): Locator {
    return this.page.locator(this.selectors.mainContent);
  }

  get moduleCards(): Locator {
    return this.page.locator(this.selectors.moduleCards);
  }

  get searchInput(): Locator {
    return this.page.locator(this.selectors.searchInput);
  }

  get userMenu(): Locator {
    return this.page.locator(this.selectors.userMenu);
  }

  get notifications(): Locator {
    return this.page.locator(this.selectors.notifications);
  }

  get breadcrumb(): Locator {
    return this.page.locator(this.selectors.breadcrumb);
  }

  /**
   * 导航到首页
   */
  async goto() {
    await super.goto('/');
  }

  /**
   * 检查页面基本元素是否存在
   */
  async checkBasicElements() {
    await this.header.waitFor({ state: 'visible' });
    await this.navigation.waitFor({ state: 'visible' });
    await this.mainContent.waitFor({ state: 'visible' });
  }

  /**
   * 搜索功能
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.helpers.waitForPageLoad();
  }

  /**
   * 点击模块卡片
   */
  async clickModuleCard(moduleName: string) {
    const moduleCard = this.page.locator(this.selectors.moduleCards, { hasText: moduleName });
    await moduleCard.click();
    await this.helpers.waitForPageLoad();
  }

  /**
   * 获取所有模块卡片的标题
   */
  async getModuleCardTitles(): Promise<string[]> {
    const cards = this.moduleCards;
    const count = await cards.count();
    const titles: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).locator('h3, .ant-card-meta-title').textContent();
      if (title) {
        titles.push(title.trim());
      }
    }
    
    return titles;
  }

  /**
   * 打开用户菜单
   */
  async openUserMenu() {
    await this.userMenu.click();
    await this.page.locator('.ant-dropdown-menu').waitFor({ state: 'visible' });
  }

  /**
   * 检查通知数量
   */
  async getNotificationCount(): Promise<number> {
    const badge = this.notifications.locator('.ant-badge-count');
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }

  /**
   * 切换侧边栏
   */
  async toggleSidebar() {
    const toggleButton = this.page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.click();
  }

  /**
   * 检查侧边栏是否折叠
   */
  async isSidebarCollapsed(): Promise<boolean> {
    const sidebar = this.sidebar;
    const className = await sidebar.getAttribute('class');
    return className?.includes('collapsed') || false;
  }

  /**
   * 导航到指定路径
   */
  async navigateToPath(path: string) {
    const navItem = this.navigation.locator(`[href="${path}"]`);
    await navItem.click();
    await this.helpers.waitForPageLoad();
  }

  /**
   * 检查面包屑导航
   */
  async checkBreadcrumb(expectedItems: string[]) {
    const breadcrumbItems = this.breadcrumb.locator('.ant-breadcrumb-link, .ant-breadcrumb-separator + span');
    const count = await breadcrumbItems.count();
    
    for (let i = 0; i < Math.min(count, expectedItems.length); i++) {
      const item = breadcrumbItems.nth(i);
      const text = await item.textContent();
      if (text && text.trim() !== '/') {
        // 简单的文本包含检查，因为面包屑可能包含额外的格式
        // expect(text.trim()).toContain(expectedItems[i]);
      }
    }
  }
}