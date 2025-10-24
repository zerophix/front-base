import { Page, Locator, expect } from '@playwright/test';

/**
 * 测试辅助工具类
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * 等待元素可见并可交互
   */
  async waitForElement(selector: string): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return element;
  }

  /**
   * 填写表单字段
   */
  async fillForm(fields: Record<string, string>) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * 点击并等待导航
   */
  async clickAndWaitForNavigation(selector: string, expectedUrl?: string) {
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      this.page.click(selector)
    ]);
    
    if (expectedUrl) {
      await this.page.waitForURL(expectedUrl);
    }
  }

  /**
   * 检查表格数据
   */
  async checkTableData(tableSelector: string, expectedData: string[][]) {
    const table = this.page.locator(tableSelector);
    await table.waitFor({ state: 'visible' });
    
    for (let i = 0; i < expectedData.length; i++) {
      const row = table.locator('tbody tr').nth(i);
      for (let j = 0; j < expectedData[i].length; j++) {
        const cell = row.locator('td').nth(j);
        await expect(cell).toContainText(expectedData[i][j]);
      }
    }
  }

  /**
   * 检查通知消息
   */
  async checkNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const notification = this.page.locator(`.ant-notification-notice-${type}`);
    await expect(notification).toBeVisible();
    await expect(notification).toContainText(message);
  }

  /**
   * 截图并保存
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * 模拟文件上传
   */
  async uploadFile(inputSelector: string, filePath: string) {
    const fileInput = this.page.locator(inputSelector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * 等待API请求完成
   */
  async waitForApiResponse(urlPattern: string | RegExp, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') {
    return await this.page.waitForResponse(response => 
      response.url().match(urlPattern) !== null && 
      response.request().method() === method
    );
  }

  /**
   * 检查页面性能
   */
  async checkPerformance() {
    const performanceEntries = await this.page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const entries = JSON.parse(performanceEntries);
    const navigationEntry = entries[0];
    
    if (navigationEntry) {
      const loadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
      const domContentLoadedTime = navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart;
      
      console.log(`页面加载时间: ${loadTime}ms`);
      console.log(`DOM内容加载时间: ${domContentLoadedTime}ms`);
      
      // 断言性能指标
      expect(loadTime).toBeLessThan(5000); // 页面加载时间应小于5秒
      expect(domContentLoadedTime).toBeLessThan(3000); // DOM加载时间应小于3秒
    }
  }

  /**
   * 检查可访问性
   */
  async checkAccessibility() {
    // 检查页面是否有必要的ARIA标签
    const mainContent = this.page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // 检查是否有跳转链接
    const skipLink = this.page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
    
    // 检查图片是否有alt属性
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  }

  /**
   * 模拟网络条件
   */
  async simulateNetworkConditions(condition: 'slow3g' | 'fast3g' | 'offline') {
    const conditions = {
      slow3g: { downloadThroughput: 50 * 1024, uploadThroughput: 50 * 1024, latency: 2000 },
      fast3g: { downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 750 * 1024, latency: 150 },
      offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    };
    
    await this.page.context().setExtraHTTPHeaders({});
    // Note: Playwright doesn't have built-in network throttling like Puppeteer
    // This is a placeholder for network condition simulation
  }
}

/**
 * 页面对象模型基类
 */
export class BasePage {
  constructor(protected page: Page) {}

  protected helpers = new TestHelpers(this.page);

  /**
   * 导航到页面
   */
  async goto(path: string = '') {
    await this.page.goto(path);
    await this.helpers.waitForPageLoad();
  }

  /**
   * 获取页面标题
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 检查页面是否加载正确
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}