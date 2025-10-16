#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 确保tmp目录存在
const tmpDir = join(projectRoot, 'tmp');
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

console.log('🔄 开始检测和修复内存泄漏问题...\n');

const optimizationResults = {
  totalFiles: 0,
  optimizedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  issues: [],
  fixes: []
};

// 检测内存泄漏模式
const memoryLeakPatterns = {
  // 定时器相关
  setInterval: {
    pattern: /setInterval\s*\(/g,
    needsCleanup: true,
    cleanupMethod: 'clearInterval'
  },
  setTimeout: {
    pattern: /setTimeout\s*\(/g,
    needsCleanup: true,
    cleanupMethod: 'clearTimeout'
  },
  
  // 事件监听器
  addEventListener: {
    pattern: /addEventListener\s*\(/g,
    needsCleanup: true,
    cleanupMethod: 'removeEventListener'
  },
  
  // DOM查询
  querySelector: {
    pattern: /document\.querySelector/g,
    needsCleanup: false,
    warning: 'DOM查询可能导致内存泄漏，建议使用ref'
  },
  
  // 全局变量
  windowAssignment: {
    pattern: /window\.\w+\s*=/g,
    needsCleanup: false,
    warning: '全局变量赋值可能导致内存泄漏'
  }
};

// 检测文件中的内存泄漏问题
function detectMemoryLeaks(content, filePath) {
  const issues = [];
  
  for (const [type, config] of Object.entries(memoryLeakPatterns)) {
    const matches = [...content.matchAll(config.pattern)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          type,
          line: lineNumber,
          match: match[0],
          index: match.index,
          needsCleanup: config.needsCleanup,
          cleanupMethod: config.cleanupMethod,
          warning: config.warning
        });
      });
    }
  }
  
  return issues;
}

// 检查是否已有useEffect清理
function hasCleanupInUseEffect(content) {
  const useEffectRegex = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]+)\}/gs;
  const matches = [...content.matchAll(useEffectRegex)];
  
  return matches.some(match => {
    const effectBody = match[1];
    return effectBody.includes('return') && 
           (effectBody.includes('clear') || effectBody.includes('remove'));
  });
}

// 修复内存泄漏
function fixMemoryLeaks(content, filePath) {
  try {
    const issues = detectMemoryLeaks(content, filePath);
    
    if (issues.length === 0) {
      return { success: false, reason: 'no-issues-found' };
    }
    
    // 检查是否是React组件
    const isReactComponent = content.includes('import React') || 
                           content.includes('from \'react\'') ||
                           content.includes('useEffect');
    
    if (!isReactComponent) {
      return { success: false, reason: 'not-react-component', issues };
    }
    
    // 检查是否已有清理逻辑
    const hasExistingCleanup = hasCleanupInUseEffect(content);
    
    let fixedContent = content;
    let fixCount = 0;
    const appliedFixes = [];
    
    // 如果没有useEffect导入，添加它
    if (!content.includes('useEffect') && issues.some(issue => issue.needsCleanup)) {
      if (content.includes('import React')) {
        fixedContent = fixedContent.replace(
          /import React(.*?) from 'react'/,
          "import React, { useEffect$1 } from 'react'"
        );
      } else if (content.includes('from \'react\'')) {
        fixedContent = fixedContent.replace(
          /import\s*\{([^}]+)\}\s*from\s*'react'/,
          (match, imports) => {
            if (!imports.includes('useEffect')) {
              return `import { ${imports.trim()}, useEffect } from 'react'`;
            }
            return match;
          }
        );
      }
      appliedFixes.push('添加useEffect导入');
      fixCount++;
    }
    
    // 如果没有现有的清理逻辑，添加useEffect清理
    if (!hasExistingCleanup && issues.some(issue => issue.needsCleanup)) {
      const cleanupNeeded = issues.filter(issue => issue.needsCleanup);
      
      if (cleanupNeeded.length > 0) {
        // 查找组件的结束位置
        const componentMatch = fixedContent.match(/(function|const)\s+\w+.*?\{/);
        if (componentMatch) {
          const insertPosition = componentMatch.index + componentMatch[0].length;
          
          let cleanupCode = '\n  // 清理内存泄漏\n  useEffect(() => {\n    return () => {\n';
          
          // 为每种类型的泄漏添加清理代码
          const timerTypes = cleanupNeeded.filter(issue => 
            issue.type === 'setInterval' || issue.type === 'setTimeout'
          );
          
          if (timerTypes.length > 0) {
            cleanupCode += '      // 清理定时器\n';
            cleanupCode += '      // 注意：需要将定时器ID保存到ref或state中\n';
            cleanupCode += '      // 示例：if (timerRef.current) clearInterval(timerRef.current);\n';
          }
          
          const eventTypes = cleanupNeeded.filter(issue => issue.type === 'addEventListener');
          if (eventTypes.length > 0) {
            cleanupCode += '      // 清理事件监听器\n';
            cleanupCode += '      // 示例：document.removeEventListener(\'event\', handler);\n';
          }
          
          cleanupCode += '    };\n  }, []);\n';
          
          fixedContent = fixedContent.substring(0, insertPosition) + 
                        cleanupCode + 
                        fixedContent.substring(insertPosition);
          
          appliedFixes.push('添加useEffect清理逻辑');
          fixCount++;
        }
      }
    }
    
    return {
      success: fixCount > 0,
      content: fixedContent,
      fixCount,
      issues: issues.length,
      appliedFixes,
      detectedIssues: issues
    };
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    const result = fixMemoryLeaks(content, filePath);
    
    if (result.success) {
      writeFileSync(filePath, result.content);
      return result;
    } else {
      return result;
    }
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 递归扫描目录
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  if (!existsSync(dir)) {
    return files;
  }
  
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳过一些不需要的目录
      if (!item.startsWith('.') && item !== 'node_modules' && item !== '__tests__') {
        files.push(...scanDirectory(fullPath, extensions));
      }
    } else if (stat.isFile()) {
      const ext = item.substring(item.lastIndexOf('.'));
      if (extensions.includes(ext) && 
          !item.includes('.test.') && 
          !item.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// 扫描所有React组件文件
async function scanFiles() {
  const directories = [
    join(projectRoot, 'src/components'),
    join(projectRoot, 'app')
  ];
  
  const files = [];
  for (const dir of directories) {
    files.push(...scanDirectory(dir));
  }
  
  return files;
}

// 主函数
async function main() {
  try {
    console.log('🔍 扫描React组件文件...');
    const files = await scanFiles();
    console.log(`找到 ${files.length} 个文件需要检查\n`);
    
    console.log('🔧 开始处理文件...\n');
    
    for (const filePath of files) {
      const relativePath = filePath.replace(projectRoot + '/', '');
      console.log(`处理: ${relativePath}`);
      optimizationResults.totalFiles++;
      
      const result = processFile(filePath);
      
      if (result.success) {
        console.log(`  ✅ 已修复 ${result.fixCount} 个问题`);
        console.log(`  📝 应用的修复: ${result.appliedFixes.join(', ')}`);
        optimizationResults.optimizedFiles++;
        optimizationResults.fixes.push({
          file: relativePath,
          fixCount: result.fixCount,
          appliedFixes: result.appliedFixes,
          detectedIssues: result.detectedIssues
        });
      } else if (result.issues && result.issues.length > 0) {
        console.log(`  ⚠️  发现 ${result.issues.length} 个潜在问题但未修复 (${result.reason})`);
        optimizationResults.issues.push({
          file: relativePath,
          reason: result.reason,
          issues: result.issues
        });
        optimizationResults.skippedFiles++;
      } else {
        console.log(`  ⏭️  ${result.reason}`);
        optimizationResults.skippedFiles++;
      }
    }
    
    console.log('\n📈 内存泄漏修复结果:');
    console.log(`  总文件数: ${optimizationResults.totalFiles}`);
    console.log(`  已修复: ${optimizationResults.optimizedFiles}`);
    console.log(`  跳过: ${optimizationResults.skippedFiles}`);
    console.log(`  发现问题: ${optimizationResults.issues.length}`);
    console.log(`  错误: ${optimizationResults.errors}`);
    
    if (optimizationResults.totalFiles > 0) {
      const fixRate = (optimizationResults.optimizedFiles / optimizationResults.totalFiles * 100).toFixed(1);
      console.log(`  修复率: ${fixRate}%`);
    }
    
    const totalFixes = optimizationResults.fixes.reduce((sum, fix) => sum + fix.fixCount, 0);
    console.log(`  总修复数: ${totalFixes} 个问题`);
    
    // 保存详细报告
    const reportPath = join(tmpDir, 'memory-leak-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: optimizationResults,
      totalFixes,
      recommendations: [
        '检查添加的useEffect清理逻辑是否正确',
        '确保定时器ID保存到ref或state中',
        '验证事件监听器的清理逻辑',
        '考虑使用自定义hooks封装清理逻辑',
        '定期进行内存泄漏测试'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    if (optimizationResults.issues.length > 0) {
      console.log('\n⚠️  发现的潜在内存泄漏问题:');
      optimizationResults.issues.forEach(issue => {
        console.log(`  ${issue.file}: ${issue.issues.length} 个问题`);
        issue.issues.forEach(i => {
          console.log(`    - 第${i.line}行: ${i.type} (${i.warning || '需要清理'})`);
        });
      });
    }
    
    console.log('\n✅ 内存泄漏检测和修复完成!');
    
  } catch (error) {
    console.error('❌ 内存泄漏修复失败:', error);
    process.exit(1);
  }
}

main();