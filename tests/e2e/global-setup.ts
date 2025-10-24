import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始E2E测试全局设置...');
  
  // 启动浏览器进行预热
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 等待应用启动
    console.log('⏳ 等待应用启动...');
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 应用启动成功');
    
    // 可以在这里进行一些全局的数据准备
    // 例如：创建测试用户、初始化测试数据等
    
  } catch (error) {
    console.error('❌ 全局设置失败:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✅ E2E测试全局设置完成');
}

export default globalSetup;