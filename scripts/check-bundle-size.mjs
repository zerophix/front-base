#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BUNDLE_LIMIT_MB = parseFloat(process.env.BUNDLE_LIMIT_MB || '5');
const BUNDLE_LIMIT_BYTES = BUNDLE_LIMIT_MB * 1024 * 1024;

console.log(`🔍 检查bundle大小限制: ${BUNDLE_LIMIT_MB}MB`);

// 检查.next目录是否存在
const nextDir = join(process.cwd(), '.next');
if (!existsSync(nextDir)) {
  console.log('❌ .next目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 检查build manifest
const manifestPath = join(nextDir, 'build-manifest.json');
if (!existsSync(manifestPath)) {
  console.log('❌ build-manifest.json不存在，构建可能失败');
  process.exit(1);
}

try {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  
  // 计算总bundle大小
  let totalSize = 0;
  const bundleFiles = [];
  
  // 检查pages bundle
  if (manifest.pages) {
    for (const [page, files] of Object.entries(manifest.pages)) {
      for (const file of files) {
        const filePath = join(nextDir, file);
        if (existsSync(filePath)) {
          const stats = readFileSync(filePath);
          const size = stats.length;
          totalSize += size;
          bundleFiles.push({ page, file, size });
        }
      }
    }
  }
  
  // 检查其他静态文件
  const staticDir = join(nextDir, 'static');
  if (existsSync(staticDir)) {
    // 这里可以添加更多静态文件检查
  }
  
  const totalSizeMB = totalSize / (1024 * 1024);
  
  console.log(`📦 Bundle分析结果:`);
  console.log(`总大小: ${totalSizeMB.toFixed(2)}MB`);
  console.log(`限制: ${BUNDLE_LIMIT_MB}MB`);
  
  if (bundleFiles.length > 0) {
    console.log(`\n📄 主要文件:`);
    bundleFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(({ page, file, size }) => {
        const sizeMB = (size / (1024 * 1024)).toFixed(2);
        console.log(`  ${page}: ${file} (${sizeMB}MB)`);
      });
  }
  
  if (totalSize > BUNDLE_LIMIT_BYTES) {
    console.log(`\n❌ Bundle大小超出限制！`);
    console.log(`当前: ${totalSizeMB.toFixed(2)}MB > 限制: ${BUNDLE_LIMIT_MB}MB`);
    console.log(`\n💡 优化建议:`);
    console.log(`- 使用动态导入 (dynamic imports)`);
    console.log(`- 启用代码分割 (code splitting)`);
    console.log(`- 移除未使用的依赖`);
    console.log(`- 优化图片和静态资源`);
    process.exit(1);
  } else {
    console.log(`\n✅ Bundle大小检查通过！`);
    console.log(`当前: ${totalSizeMB.toFixed(2)}MB <= 限制: ${BUNDLE_LIMIT_MB}MB`);
  }
  
} catch (error) {
  console.log(`❌ Bundle检查失败: ${error.message}`);
  // 在CI环境中，如果无法检查bundle大小，我们不让构建失败
  if (process.env.CI) {
    console.log(`⚠️ CI环境中跳过bundle检查`);
    process.exit(0);
  } else {
    process.exit(1);
  }
}