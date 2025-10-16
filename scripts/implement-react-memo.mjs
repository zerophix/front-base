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

console.log('🔄 开始React.memo优化...\n');

// 从React优化报告中获取需要memo的组件
const reactReportPath = join(tmpDir, 'react-optimization-report.json');
let componentsNeedingMemo = [];

if (existsSync(reactReportPath)) {
  try {
    const reactReport = JSON.parse(readFileSync(reactReportPath, 'utf-8'));
    
    // 从报告中提取需要memo的文件
    if (reactReport.analyses) {
      componentsNeedingMemo = reactReport.analyses
        .filter(file => file.issues.some(issue => issue.type === 'missing-memo'))
        .map(file => ({
          path: file.path,
          issues: file.issues.filter(issue => issue.type === 'missing-memo')
        }));
    }
    
    console.log(`📊 从React报告中找到 ${componentsNeedingMemo.length} 个需要memo的组件`);
  } catch (error) {
    console.log('⚠️  无法读取React报告，将使用默认策略');
    console.log('错误:', error.message);
  }
}

const optimizationResults = {
  totalFiles: 0,
  optimizedFiles: 0,
  skippedFiles: 0,
  errors: 0,
  optimizations: []
};

// 检查组件是否需要memo
function shouldAddMemo(content, filePath) {
  // 跳过已经有memo的组件
  if (content.includes('React.memo') || content.includes('memo(')) {
    return false;
  }
  
  // 跳过API路由
  if (filePath.includes('/api/')) {
    return false;
  }
  
  // 检查是否是React组件
  const hasReactImport = content.includes('import React') || content.includes('from "react"') || content.includes('from \'react\'');
  const hasComponentExport = content.includes('export default function') || content.includes('export function');
  
  if (!hasReactImport || !hasComponentExport) {
    return false;
  }
  
  // 检查组件复杂度 - 更宽松的条件
  const hasProps = content.includes('props') || content.match(/function\s+\w+\s*\([^)]+\)/);
  const isLarge = content.length > 3000; // 大型组件
  const hasComplexLogic = content.includes('useCallback') || content.includes('useMemo') || content.includes('useEffect');
  
  // 如果是大型组件或有复杂逻辑，建议添加memo
  return hasProps && (isLarge || hasComplexLogic);
}

// 添加React.memo到组件
function addMemoToComponent(content, filePath) {
  try {
    let optimizedContent = content;
    let hasChanges = false;
    
    // 确保导入React
    if (!content.includes('import React')) {
      if (content.includes('import {') && content.includes('} from "react"')) {
        // 如果已有React的命名导入，添加React
        optimizedContent = optimizedContent.replace(
          /import\s*{\s*([^}]+)\s*}\s*from\s*["']react["']/,
          'import React, { $1 } from "react"'
        );
      } else if (content.includes('} from \'react\'')) {
        optimizedContent = optimizedContent.replace(
          /import\s*{\s*([^}]+)\s*}\s*from\s*['"]react['"]/,
          'import React, { $1 } from \'react\''
        );
      } else {
        // 添加React导入
        const firstImport = optimizedContent.indexOf('import');
        if (firstImport !== -1) {
          optimizedContent = optimizedContent.slice(0, firstImport) + 
            'import React from \'react\';\n' + 
            optimizedContent.slice(firstImport);
        }
      }
      hasChanges = true;
    }
    
    // 查找默认导出的函数组件
    const defaultExportMatch = optimizedContent.match(/export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*{/);
    
    if (defaultExportMatch) {
      const componentName = defaultExportMatch[1];
      
      // 查找组件函数的结束位置
      const functionStart = optimizedContent.indexOf(defaultExportMatch[0]);
      let braceCount = 0;
      let functionEnd = functionStart;
      let inFunction = false;
      
      for (let i = functionStart; i < optimizedContent.length; i++) {
        if (optimizedContent[i] === '{') {
          braceCount++;
          inFunction = true;
        } else if (optimizedContent[i] === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            functionEnd = i + 1;
            break;
          }
        }
      }
      
      if (functionEnd > functionStart) {
        // 提取组件函数
        const componentFunction = optimizedContent.substring(functionStart, functionEnd);
        
        // 移除export default
        const componentFunctionWithoutExport = componentFunction.replace('export default ', '');
        
        // 创建memo包装的组件
        const memoComponent = `${componentFunctionWithoutExport}

export default React.memo(${componentName});`;
        
        // 替换原组件
        optimizedContent = optimizedContent.substring(0, functionStart) + 
          memoComponent + 
          optimizedContent.substring(functionEnd);
        
        hasChanges = true;
      }
    }
    
    // 查找命名导出的函数组件
    const namedExportMatches = optimizedContent.matchAll(/export\s+function\s+(\w+)\s*\([^)]*\)\s*{/g);
    
    for (const match of namedExportMatches) {
      const componentName = match[1];
      
      // 跳过非组件函数（通常组件名以大写字母开头）
      if (!/^[A-Z]/.test(componentName)) {
        continue;
      }
      
      const functionStart = optimizedContent.indexOf(match[0]);
      let braceCount = 0;
      let functionEnd = functionStart;
      let inFunction = false;
      
      for (let i = functionStart; i < optimizedContent.length; i++) {
        if (optimizedContent[i] === '{') {
          braceCount++;
          inFunction = true;
        } else if (optimizedContent[i] === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            functionEnd = i + 1;
            break;
          }
        }
      }
      
      if (functionEnd > functionStart) {
        // 提取组件函数
        const componentFunction = optimizedContent.substring(functionStart, functionEnd);
        
        // 移除export
        const componentFunctionWithoutExport = componentFunction.replace('export ', '');
        
        // 创建memo包装的组件
        const memoComponent = `${componentFunctionWithoutExport}

export const ${componentName}Memo = React.memo(${componentName});`;
        
        // 替换原组件
        optimizedContent = optimizedContent.substring(0, functionStart) + 
          memoComponent + 
          optimizedContent.substring(functionEnd);
        
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      return { success: true, content: optimizedContent };
    } else {
      return { success: false, reason: 'no-components-found' };
    }
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 处理单个文件
function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 检查是否需要添加memo
    if (!shouldAddMemo(content, filePath)) {
      return { success: false, reason: 'not-needed' };
    }
    
    // 添加memo
    const result = addMemoToComponent(content, filePath);
    
    if (result.success) {
      writeFileSync(filePath, result.content);
      return { 
        success: true, 
        originalSize: content.length,
        newSize: result.content.length
      };
    } else {
      return result;
    }
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 处理所有需要memo的组件
async function processComponents() {
  console.log('🔧 开始处理组件...\n');
  
  // 如果有报告中的组件，优先处理
  if (componentsNeedingMemo.length > 0) {
    for (const component of componentsNeedingMemo) {
      const filePath = join(projectRoot, component.path);
      
      if (!existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${component.path}`);
        continue;
      }
      
      console.log(`处理: ${component.path}`);
      optimizationResults.totalFiles++;
      
      const result = processFile(filePath);
      
      if (result.success) {
        console.log(`  ✅ 已添加memo`);
        optimizationResults.optimizedFiles++;
        optimizationResults.optimizations.push({
          file: component.path,
          type: 'memo-added',
          ...result
        });
      } else {
        console.log(`  ⏭️  ${result.reason}`);
        optimizationResults.skippedFiles++;
      }
    }
  } else {
    // 如果没有报告，处理一些常见的组件文件
    const commonComponentPaths = [
      'src/components/layouts/MainLayout/MainLayout.tsx',
      'src/components/layouts/Sidebar/Sidebar.tsx',
      'src/components/layouts/Sidebar/SidebarMenu.tsx',
      'src/components/common/EditableTable/EditableTable.tsx',
      'src/components/common/SearchSelect/SearchSelect.tsx'
    ];
    
    for (const relativePath of commonComponentPaths) {
      const filePath = join(projectRoot, relativePath);
      
      if (!existsSync(filePath)) {
        continue;
      }
      
      console.log(`处理: ${relativePath}`);
      optimizationResults.totalFiles++;
      
      const result = processFile(filePath);
      
      if (result.success) {
        console.log(`  ✅ 已添加memo`);
        optimizationResults.optimizedFiles++;
        optimizationResults.optimizations.push({
          file: relativePath,
          type: 'memo-added',
          ...result
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
    await processComponents();
    
    console.log('\n📈 React.memo优化结果:');
    console.log(`  总文件数: ${optimizationResults.totalFiles}`);
    console.log(`  已优化: ${optimizationResults.optimizedFiles}`);
    console.log(`  跳过: ${optimizationResults.skippedFiles}`);
    console.log(`  错误: ${optimizationResults.errors}`);
    
    if (optimizationResults.totalFiles > 0) {
      const optimizationRate = (optimizationResults.optimizedFiles / optimizationResults.totalFiles * 100).toFixed(1);
      console.log(`  优化率: ${optimizationRate}%`);
    }
    
    // 保存详细报告
    const reportPath = join(tmpDir, 'react-memo-optimization-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: optimizationResults,
      recommendations: [
        '测试memo优化后的组件性能',
        '监控渲染次数的变化',
        '考虑为复杂props添加自定义比较函数'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n✅ React.memo优化完成!');
    
  } catch (error) {
    console.error('❌ React.memo优化失败:', error);
    process.exit(1);
  }
}

main();