#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const projectRoot = path.resolve(__dirname, '..');

/**
 * 优化单个页面文件，移除动态导入
 */
function optimizePage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否使用了动态导入
    if (!content.includes('dynamic(')) {
      return false;
    }

    console.log(`优化页面: ${filePath}`);

    // 提取组件名称
    const dynamicMatch = content.match(/const\s+(\w+)\s*=\s*dynamic\(\s*\(\)\s*=>\s*import\(['"`]\.\/(\w+)['"`]\)/);
    if (!dynamicMatch) {
      console.log(`  跳过: 无法解析动态导入模式`);
      return false;
    }

    const [, lazyComponentName, componentName] = dynamicMatch;

    // 生成优化后的内容
    const optimizedContent = `'use client';

import ${componentName} from './${componentName}';

export default function ${componentName.replace('Component', 'Page')}() {
  return <${componentName} />;
}
`;

    // 写入优化后的内容
    fs.writeFileSync(filePath, optimizedContent, 'utf-8');
    console.log(`  ✅ 已优化: ${componentName}`);
    return true;

  } catch (error) {
    console.error(`  ❌ 优化失败: ${error.message}`);
    return false;
  }
}

/**
 * 递归查找所有页面文件
 */
function findPageFiles(dir) {
  const pageFiles = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过一些不需要的目录
        if (!['node_modules', '.next', '.git', 'tmp'].includes(item)) {
          pageFiles.push(...findPageFiles(fullPath));
        }
      } else if (item === 'page.tsx' && fullPath.includes('/app/')) {
        pageFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`读取目录失败: ${dir} - ${error.message}`);
  }
  
  return pageFiles;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始批量优化页面...\n');
  
  const appDir = path.join(projectRoot, 'app');
  const pageFiles = findPageFiles(appDir);
  
  console.log(`找到 ${pageFiles.length} 个页面文件\n`);
  
  let optimizedCount = 0;
  let skippedCount = 0;
  
  for (const filePath of pageFiles) {
    const relativePath = path.relative(projectRoot, filePath);
    
    // 跳过已经优化过的页面
    if (relativePath.includes('/home/') || 
        relativePath.includes('/data/statistics-analysis/') ||
        relativePath.includes('/data/detection-objects/') ||
        relativePath.includes('/data/detection-params/') ||
        relativePath.includes('/data/parameter-code/')) {
      console.log(`跳过已优化: ${relativePath}`);
      skippedCount++;
      continue;
    }
    
    if (optimizePage(filePath)) {
      optimizedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log(`\n✅ 优化完成!`);
  console.log(`  - 已优化: ${optimizedCount} 个页面`);
  console.log(`  - 已跳过: ${skippedCount} 个页面`);
  console.log(`  - 总计: ${pageFiles.length} 个页面`);
}

// 运行主函数
main();