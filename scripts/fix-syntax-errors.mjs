#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// 递归扫描目录
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  function scan(currentDir) {
    try {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过 node_modules 和其他不需要的目录
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          // 检查文件扩展名
          const hasValidExtension = extensions.some(ext => fullPath.endsWith(ext));
          if (hasValidExtension) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录 ${currentDir}:`, error.message);
    }
  }
  
  scan(dir);
  return files;
}

// 修复语法错误的函数
function fixSyntaxErrors(content) {
  let fixed = content;
  let hasChanges = false;

  // 修复 import 语句中的重复大括号
  const importRegex = /import\s+React,\s*\{\s*([^}]+),\s*\{\s*([^}]+)\s*\}\s*\}\s*from\s*['"]react['"];/g;
  if (importRegex.test(fixed)) {
    fixed = fixed.replace(importRegex, (match, group1, group2) => {
      hasChanges = true;
      return `import React, { ${group1}, ${group2} } from 'react';`;
    });
  }

  // 修复组件参数中错误放置的 useEffect
  const componentParamRegex = /export\s+const\s+(\w+):\s*React\.FC<[^>]*>\s*=\s*\(\{\s*\/\/[^\n]*\n\s*useEffect\([^}]+\}\s*,\s*\[\]\);\s*([^}]+)\s*\}\)\s*=>\s*\{/g;
  if (componentParamRegex.test(fixed)) {
    fixed = fixed.replace(componentParamRegex, (match, componentName, params) => {
      hasChanges = true;
      return `export const ${componentName}: React.FC<any> = ({ ${params.trim()} }) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
    };
  }, []);`;
    });
  }

  // 修复函数组件中错误的 useEffect 位置
  const wrongUseEffectRegex = /const\s+(\w+):\s*React\.FC<[^>]*>\s*=\s*\(\{\s*\/\/[^\n]*\n\s*useEffect\([^}]+\}\s*,\s*\[\]\);\s*([^}]+)\s*\}\)\s*=>\s*\{/g;
  if (wrongUseEffectRegex.test(fixed)) {
    fixed = fixed.replace(wrongUseEffectRegex, (match, componentName, params) => {
      hasChanges = true;
      return `const ${componentName}: React.FC<any> = ({ ${params.trim()} }) => {
  // 清理内存泄漏
  useEffect(() => {
    return () => {
      // 清理事件监听器
    };
  }, []);`;
    });
  }

  return { content: fixed, hasChanges };
}

// 主函数
function main() {
  console.log('🔧 开始修复语法错误...');
  
  const projectRoot = process.cwd();
  const srcDir = join(projectRoot, 'src');
  const appDir = join(projectRoot, 'app');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  // 扫描 src 和 app 目录
  const directories = [srcDir, appDir].filter(dir => {
    try {
      statSync(dir);
      return true;
    } catch {
      return false;
    }
  });
  
  for (const dir of directories) {
    const files = scanDirectory(dir);
    
    for (const filePath of files) {
      totalFiles++;
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const { content: fixedContent, hasChanges } = fixSyntaxErrors(content);
        
        if (hasChanges) {
          writeFileSync(filePath, fixedContent, 'utf-8');
          fixedFiles++;
          console.log(`✅ 修复: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
      }
    }
  }
  
  console.log(`\n📊 修复完成:`);
  console.log(`   总文件数: ${totalFiles}`);
  console.log(`   修复文件数: ${fixedFiles}`);
  console.log(`   修复率: ${totalFiles > 0 ? ((fixedFiles / totalFiles) * 100).toFixed(1) : 0}%`);
}

main();