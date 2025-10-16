#!/usr/bin/env node

/**
 * 简单的路由和页面文件验证脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证路由和页面文件结构...\n');

// 检查app目录结构
const appDir = path.join(__dirname, '../app');

function checkDirectoryStructure(dir, prefix = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const results = {
    directories: [],
    pages: [],
    issues: []
  };

  items.forEach(item => {
    if (item.isDirectory()) {
      const dirPath = path.join(dir, item.name);
      const relativePath = path.relative(appDir, dirPath);
      results.directories.push(relativePath);

      // 检查是否有page.tsx文件
      const pageFile = path.join(dirPath, 'page.tsx');
      if (fs.existsSync(pageFile)) {
        results.pages.push(relativePath);
      }

      // 递归检查子目录
      const subResults = checkDirectoryStructure(dirPath, prefix + '  ');
      results.directories.push(...subResults.directories);
      results.pages.push(...subResults.pages);
      results.issues.push(...subResults.issues);
    }
  });

  return results;
}

const results = checkDirectoryStructure(appDir);

console.log('📊 页面文件统计:');
console.log(`总目录数: ${results.directories.length}`);
console.log(`有页面文件的目录: ${results.pages.length}`);

console.log('\n📋 页面文件列表:');
results.pages.sort().forEach(page => {
  console.log(`  ✅ /${page}`);
});

console.log('\n📁 目录结构:');
results.directories.sort().forEach(dir => {
  const hasPage = results.pages.includes(dir);
  console.log(`  ${hasPage ? '📄' : '📁'} ${dir}`);
});

// 检查是否有孤立的目录（没有page.tsx的目录）
const orphanDirs = results.directories.filter(dir => !results.pages.includes(dir));
if (orphanDirs.length > 0) {
  console.log('\n⚠️  没有page.tsx的目录:');
  orphanDirs.forEach(dir => {
    console.log(`  📁 ${dir}`);
  });
}

console.log('\n✅ 页面文件结构检查完成！');