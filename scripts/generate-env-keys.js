#!/usr/bin/env node

/**
 * 环境变量密钥生成脚本
 * 用于生成生产环境所需的所有安全密钥
 */

const crypto = require('crypto');

console.log('🔐 生成生产环境安全密钥...\n');

// 生成各种密钥
const keys = {
  ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
  JWT_SECRET: crypto.randomBytes(64).toString('hex'),
  JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
  CSRF_SECRET: crypto.randomBytes(32).toString('hex'),
  SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
};

console.log('📋 请将以下环境变量添加到Vercel项目设置中：\n');
console.log('='.repeat(60));

Object.entries(keys).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('='.repeat(60));
console.log('\n📝 Vercel配置步骤：');
console.log('1. 访问 https://vercel.com/dashboard');
console.log('2. 选择你的项目');
console.log('3. 进入 Settings → Environment Variables');
console.log('4. 逐个添加上述环境变量');
console.log('5. 确保选择 Production 环境');
console.log('6. 重新部署项目\n');

console.log('⚠️  安全提醒：');
console.log('- 请妥善保管这些密钥');
console.log('- 不要将密钥提交到代码仓库');
console.log('- 定期更换密钥以提高安全性');
console.log('- 每个环境使用不同的密钥\n');

// 生成.env.example文件内容
console.log('📄 .env.example 文件内容：');
console.log('='.repeat(40));
Object.keys(keys).forEach(key => {
  console.log(`${key}=your_${key.toLowerCase()}_here`);
});
console.log('='.repeat(40));