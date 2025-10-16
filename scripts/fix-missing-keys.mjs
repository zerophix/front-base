#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
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

console.log('🔄 开始修复缺少key属性的列表渲染...\n');

// 从React优化报告中获取需要修复key的文件
const reactReportPath = join(tmpDir, 'react-optimization-report.json');
let filesNeedingKeys = [];

if (existsSync(reactReportPath)) {
  try {
    const reactReport = JSON.parse(readFileSync(reactReportPath, 'utf-8'));
    
    // 从报告中提取需要修复key的文件
    if (reactReport.analyses) {
      filesNeedingKeys = reactReport.analyses
        .filter(file => file.issues.some(issue => issue.type === 'missing-key'))
        .map(file => ({
          path: file.path,
          issues: file.issues.filter(issue => issue.type === 'missing-key')
        }));
    }
    
    console.log(`📊 从React报告中找到 ${filesNeedingKeys.length} 个需要修复key的文件`);
  } catch (error) {
    console.log('⚠️  无法读取React报告，将扫描所有文件');
  }
}

const optimizationResults = {
  totalFiles: 0,
  optimizedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  optimizations: []
};

// 检测缺少key的map调用
function findMissingKeys(content) {
  const issues = [];
  
  // 匹配 .map() 调用的正则表达式
  const mapRegex = /\.map\s*\(\s*\(([^)]+)\)\s*=>\s*(<[^>]*>)/g;
  let match;
  
  while ((match = mapRegex.exec(content)) !== null) {
    const [fullMatch, params, jsxElement] = match;
    
    // 检查JSX元素是否有key属性
    if (!jsxElement.includes('key=')) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        line: lineNumber,
        match: fullMatch,
        params: params.trim(),
        element: jsxElement,
        index: match.index
      });
    }
  }
  
  // 也检查多行的map调用
  const multilineMapRegex = /\.map\s*\(\s*\(([^)]+)\)\s*=>\s*\{[^}]*return\s*(<[^>]*>)/gs;
  let multilineMatch;
  
  while ((multilineMatch = multilineMapRegex.exec(content)) !== null) {
    const [fullMatch, params, jsxElement] = multilineMatch;
    
    if (!jsxElement.includes('key=')) {
      const lineNumber = content.substring(0, multilineMatch.index).split('\n').length;
      issues.push({
        line: lineNumber,
        match: fullMatch,
        params: params.trim(),
        element: jsxElement,
        index: multilineMatch.index,
        isMultiline: true
      });
    }
  }
  
  return issues;
}

// 修复缺少的key属性
function fixMissingKeys(content, filePath) {
  try {
    const issues = findMissingKeys(content);
    
    if (issues.length === 0) {
      return { success: false, reason: 'no-issues-found' };
    }
    
    let fixedContent = content;
    let fixCount = 0;
    
    // 从后往前修复，避免索引偏移
    issues.reverse().forEach(issue => {
      const { params, element, index, isMultiline } = issue;
      
      // 尝试确定合适的key值
      let keyValue = 'index';
      
      // 检查参数中是否有id字段
      if (params.includes(',')) {
        const paramParts = params.split(',').map(p => p.trim());
        if (paramParts.length >= 2) {
          keyValue = `${paramParts[1]}`;
        }
      } else {
        // 检查是否有常见的id属性
        const itemName = params.split(',')[0].trim();
        if (element.includes(`${itemName}.id`)) {
          keyValue = `${itemName}.id`;
        } else if (element.includes(`${itemName}.key`)) {
          keyValue = `${itemName}.key`;
        } else if (element.includes(`${itemName}.value`)) {
          keyValue = `${itemName}.value`;
        } else {
          // 使用index作为fallback
          const paramParts = params.split(',').map(p => p.trim());
          if (paramParts.length >= 2) {
            keyValue = paramParts[1];
          } else {
            keyValue = 'index';
          }
        }
      }
      
      // 在JSX元素中添加key属性
      const elementWithKey = element.replace(/^(<\w+)/, `$1 key={${keyValue}}`);
      
      if (isMultiline) {
        // 对于多行的情况，替换整个匹配
        const newMatch = issue.match.replace(element, elementWithKey);
        fixedContent = fixedContent.substring(0, index) + 
          newMatch + 
          fixedContent.substring(index + issue.match.length);
      } else {
        // 对于单行的情况
        fixedContent = fixedContent.substring(0, index) + 
          issue.match.replace(element, elementWithKey) + 
          fixedContent.substring(index + issue.match.length);
      }
      
      fixCount++;
    });
    
    return { 
      success: true, 
      content: fixedContent, 
      fixCount,
      issues: issues.length
    };
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 检查是否是React文件
    if (!content.includes('.map(') || (!content.includes('import React') && !content.includes('from \'react\''))) {
      return { success: false, reason: 'not-react-file' };
    }
    
    const result = fixMissingKeys(content, filePath);
    
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

// 处理所有需要修复key的文件
async function processFiles() {
  console.log('🔧 开始处理文件...\n');
  
  // 如果有报告中的文件，优先处理
  if (filesNeedingKeys.length > 0) {
    for (const fileInfo of filesNeedingKeys) {
      const filePath = join(projectRoot, fileInfo.path);
      
      if (!existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${fileInfo.path}`);
        continue;
      }
      
      console.log(`处理: ${fileInfo.path}`);
      optimizationResults.totalFiles++;
      
      const result = processFile(filePath);
      
      if (result.success) {
        console.log(`  ✅ 已修复 ${result.fixCount} 个key问题`);
        optimizationResults.optimizedFiles++;
        optimizationResults.optimizations.push({
          file: fileInfo.path,
          type: 'key-fixed',
          fixCount: result.fixCount,
          issues: result.issues
        });
      } else {
        console.log(`  ⏭️  ${result.reason}`);
        optimizationResults.skippedFiles++;
      }
    }
  } else {
    // 如果没有报告，处理一些常见的文件
    const commonFiles = [
      'app/home/HomePageComponent.tsx',
      'src/components/common/EditableTable/EditableTable.tsx',
      'src/components/common/SearchSelect/SearchSelect.tsx'
    ];
    
    for (const relativePath of commonFiles) {
      const filePath = join(projectRoot, relativePath);
      
      if (!existsSync(filePath)) {
        continue;
      }
      
      console.log(`处理: ${relativePath}`);
      optimizationResults.totalFiles++;
      
      const result = processFile(filePath);
      
      if (result.success) {
        console.log(`  ✅ 已修复 ${result.fixCount} 个key问题`);
        optimizationResults.optimizedFiles++;
        optimizationResults.optimizations.push({
          file: relativePath,
          type: 'key-fixed',
          fixCount: result.fixCount,
          issues: result.issues
        });
      } else {
        console.log(`  ⏭️  ${result.reason}`);
        optimizationResults.skippedFiles++;
      }
    }
  }
}

// 主函数
async function main() {
  try {
    await processFiles();
    
    console.log('\n📈 Key属性修复结果:');
    console.log(`  总文件数: ${optimizationResults.totalFiles}`);
    console.log(`  已修复: ${optimizationResults.optimizedFiles}`);
    console.log(`  跳过: ${optimizationResults.skippedFiles}`);
    console.log(`  错误: ${optimizationResults.errors}`);
    
    if (optimizationResults.totalFiles > 0) {
      const fixRate = (optimizationResults.optimizedFiles / optimizationResults.totalFiles * 100).toFixed(1);
      console.log(`  修复率: ${fixRate}%`);
    }
    
    const totalFixes = optimizationResults.optimizations.reduce((sum, opt) => sum + opt.fixCount, 0);
    console.log(`  总修复数: ${totalFixes} 个key问题`);
    
    // 保存详细报告
    const reportPath = join(tmpDir, 'key-fix-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: optimizationResults,
      totalFixes,
      recommendations: [
        '验证修复后的key值是否唯一',
        '检查是否有更合适的key值可以使用',
        '测试列表渲染的性能改进'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n✅ Key属性修复完成!');
    
  } catch (error) {
    console.error('❌ Key属性修复失败:', error);
    process.exit(1);
  }
}

main();