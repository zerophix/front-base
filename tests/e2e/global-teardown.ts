import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始E2E测试全局清理...');
  
  try {
    // 在这里进行全局清理工作
    // 例如：清理测试数据、关闭数据库连接等
    
    console.log('✅ E2E测试全局清理完成');
  } catch (error) {
    console.error('❌ 全局清理失败:', error);
    throw error;
  }
}

export default globalTeardown;