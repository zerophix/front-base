#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 确保tmp目录存在
const tmpDir = join(projectRoot, 'tmp');
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

console.log('🔄 开始代码分割优化...\n');

// 从之前的报告中获取需要优化的大型文件
const routeReportPath = join(tmpDir, 'route-optimization-report.json');
let largeFiles = [];

if (existsSync(routeReportPath)) {
  try {
    const routeReport = JSON.parse(readFileSync(routeReportPath, 'utf-8'));
    largeFiles = routeReport.largeFiles || [];
    console.log(`📊 从路由报告中找到 ${largeFiles.length} 个大型文件`);
  } catch (error) {
    console.log('⚠️  无法读取路由报告，将扫描所有文件');
  }
}

// 如果没有报告，扫描大型文件
if (largeFiles.length === 0) {
  console.log('🔍 扫描大型文件...');
  // 这里可以添加文件扫描逻辑
}

const optimizationResults = {
  totalFiles: 0,
  optimizedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  optimizations: []
};

// 优化API路由文件
function optimizeApiRoute(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 检查是否已经优化过
    if (content.includes('// Code splitting optimized')) {
      return { success: false, reason: 'already-optimized' };
    }
    
    // 检查文件大小
    if (content.length < 5000) {
      return { success: false, reason: 'too-small' };
    }
    
    // 分析API路由内容
    const hasMultipleHandlers = (content.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g) || []).length > 1;
    const hasComplexLogic = content.includes('brutal-test') || content.length > 10000;
    
    if (hasComplexLogic) {
      // 对于复杂的API路由，提取业务逻辑到单独的模块
      const fileName = basename(filePath, '.ts');
      const dirName = dirname(filePath);
      
      // 提取导入语句
      const imports = content.match(/import.*from.*['"];/g) || [];
      const importsStr = imports.join('\n');
      
      // 提取处理函数
      const handlers = content.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)[^}]*{[^]*?(?=export\s+async\s+function|$)/g) || [];
      
      if (handlers.length > 0) {
        // 创建业务逻辑模块
        const logicContent = `// Code splitting optimized - Business logic module
${importsStr}

${handlers.map(handler => {
  const methodMatch = handler.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/);
  const method = methodMatch ? methodMatch[1] : 'UNKNOWN';
  return handler.replace(/export\s+async\s+function\s+/, `export async function handle${method} `);
}).join('\n\n')}
`;
        
        const logicFilePath = join(dirName, `${fileName}-logic.ts`);
        writeFileSync(logicFilePath, logicContent);
        
        // 创建简化的路由文件
        const simplifiedContent = `// Code splitting optimized
${handlers.map(handler => {
  const methodMatch = handler.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/);
  const method = methodMatch ? methodMatch[1] : 'UNKNOWN';
  return `export { handle${method} as ${method} } from './${fileName}-logic';`;
}).join('\n')}
`;
        
        writeFileSync(filePath, simplifiedContent);
        
        return { 
          success: true, 
          type: 'api-route-split',
          originalSize: content.length,
          newSize: simplifiedContent.length,
          logicFile: logicFilePath
        };
      }
    }
    
    return { success: false, reason: 'no-optimization-needed' };
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 优化大型组件文件
function optimizeLargeComponent(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 检查是否已经优化过
    if (content.includes('// Code splitting optimized')) {
      return { success: false, reason: 'already-optimized' };
    }
    
    // 检查文件大小
    if (content.length < 8000) {
      return { success: false, reason: 'too-small' };
    }
    
    const fileName = basename(filePath, extname(filePath));
    const dirName = dirname(filePath);
    
    // 检查是否有可以分割的子组件
    const componentMatches = content.match(/function\s+(\w+Component|\w+Modal|\w+Form|\w+Table)\s*\([^)]*\)\s*{/g) || [];
    const subComponents = componentMatches.filter(match => !match.includes(fileName));
    
    if (subComponents.length > 0) {
      // 提取子组件到单独文件
      let optimizedContent = content;
      const extractedComponents = [];
      
      subComponents.forEach((componentMatch, index) => {
        const componentName = componentMatch.match(/function\s+(\w+)/)[1];
        
        // 查找完整的组件定义
        const componentStart = content.indexOf(componentMatch);
        if (componentStart !== -1) {
          // 简单的大括号匹配来找到组件结束
          let braceCount = 0;
          let componentEnd = componentStart;
          let inComponent = false;
          
          for (let i = componentStart; i < content.length; i++) {
            if (content[i] === '{') {
              braceCount++;
              inComponent = true;
            } else if (content[i] === '}') {
              braceCount--;
              if (inComponent && braceCount === 0) {
                componentEnd = i + 1;
                break;
              }
            }
          }
          
          if (componentEnd > componentStart) {
            const componentCode = content.substring(componentStart, componentEnd);
            
            // 创建单独的组件文件
            const componentFilePath = join(dirName, `${componentName}.tsx`);
            const componentFileContent = `// Code splitting optimized - Extracted component
'use client';

import React from 'react';
// TODO: 添加必要的导入

${componentCode}

export default ${componentName};
`;
            
            writeFileSync(componentFilePath, componentFileContent);
            extractedComponents.push({
              name: componentName,
              file: componentFilePath,
              size: componentCode.length
            });
            
            // 从原文件中移除组件定义，替换为导入
            optimizedContent = optimizedContent.replace(componentCode, '');
          }
        }
      });
      
      if (extractedComponents.length > 0) {
        // 添加导入语句
        const imports = extractedComponents.map(comp => 
          `import ${comp.name} from './${comp.name}';`
        ).join('\n');
        
        optimizedContent = `// Code splitting optimized
${imports}

${optimizedContent}`;
        
        writeFileSync(filePath, optimizedContent);
        
        return {
          success: true,
          type: 'component-split',
          originalSize: content.length,
          newSize: optimizedContent.length,
          extractedComponents
        };
      }
    }
    
    return { success: false, reason: 'no-components-to-extract' };
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 处理大型文件
async function processLargeFiles() {
  console.log('🔧 开始处理大型文件...\n');
  
  // 处理已知的大型文件
  const knownLargeFiles = [
    'app/api/auth-brutal-test/route.ts',
    'app/api/security-brutal-test/route.ts',
    'app/api/csrf-brutal-test/route.ts',
    'app/api/file-upload-brutal-test/route.ts',
    'app/personnel/registration/page.tsx'
  ];
  
  for (const relativePath of knownLargeFiles) {
    const filePath = join(projectRoot, relativePath);
    
    if (!existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${relativePath}`);
      continue;
    }
    
    console.log(`处理: ${relativePath}`);
    optimizationResults.totalFiles++;
    
    let result;
    if (relativePath.includes('/api/') && relativePath.endsWith('route.ts')) {
      result = optimizeApiRoute(filePath);
    } else {
      result = optimizeLargeComponent(filePath);
    }
    
    if (result.success) {
      console.log(`  ✅ 已优化 (${result.type})`);
      if (result.originalSize && result.newSize) {
        const reduction = ((result.originalSize - result.newSize) / result.originalSize * 100).toFixed(1);
        console.log(`     📉 文件大小减少: ${reduction}%`);
      }
      optimizationResults.optimizedFiles++;
      optimizationResults.optimizations.push({
        file: relativePath,
        type: result.type,
        ...result
      });
    } else {
      console.log(`  ⏭️  ${result.reason}`);
      optimizationResults.skippedFiles++;
    }
  }
}

// 主函数
async function main() {
  try {
    await processLargeFiles();
    
    console.log('\n📈 代码分割优化结果:');
    console.log(`  总文件数: ${optimizationResults.totalFiles}`);
    console.log(`  已优化: ${optimizationResults.optimizedFiles}`);
    console.log(`  跳过: ${optimizationResults.skippedFiles}`);
    console.log(`  错误: ${optimizationResults.errors}`);
    
    if (optimizationResults.totalFiles > 0) {
      const optimizationRate = (optimizationResults.optimizedFiles / optimizationResults.totalFiles * 100).toFixed(1);
      console.log(`  优化率: ${optimizationRate}%`);
    }
    
    // 保存详细报告
    const reportPath = join(tmpDir, 'code-splitting-optimization-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: optimizationResults,
      recommendations: [
        '继续监控大型文件的增长',
        '考虑使用webpack bundle analyzer分析打包结果',
        '定期检查是否有新的代码分割机会'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n✅ 代码分割优化完成!');
    
  } catch (error) {
    console.error('❌ 代码分割优化失败:', error);
    process.exit(1);
  }
}

main();