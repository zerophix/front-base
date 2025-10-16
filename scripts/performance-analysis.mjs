#!/usr/bin/env node
/**
 * 性能分析脚本
 * 分析项目的性能指标和优化建议
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

console.log('🚀 开始性能分析...\n');

// 分析文件大小
function analyzeFileSize(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const results = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.isFile() && extensions.includes(extname(item.name))) {
          const stats = statSync(fullPath);
          results.push({
            path: fullPath,
            size: stats.size,
            extension: extname(item.name)
          });
        }
      }
    } catch (error) {
      console.warn(`无法扫描目录 ${currentDir}:`, error.message);
    }
  }
  
  scanDirectory(dir);
  return results;
}

// 分析代码复杂度
function analyzeCodeComplexity(files) {
  const complexityResults = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file.path, 'utf-8');
      const lines = content.split('\n').length;
      const imports = (content.match(/^import\s+/gm) || []).length;
      const exports = (content.match(/^export\s+/gm) || []).length;
      const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
      const components = (content.match(/function\s+[A-Z]\w+|const\s+[A-Z]\w+\s*=\s*\(/g) || []).length;
      
      complexityResults.push({
        path: file.path,
        lines,
        imports,
        exports,
        functions,
        components,
        size: file.size
      });
    } catch (error) {
      console.warn(`无法分析文件 ${file.path}:`, error.message);
    }
  }
  
  return complexityResults;
}

// 分析依赖
function analyzeDependencies() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    return {
      dependencies: deps.length,
      devDependencies: devDeps.length,
      total: deps.length + devDeps.length,
      heavyDependencies: deps.filter(dep => 
        ['antd', 'react', 'next', 'styled-components'].includes(dep)
      )
    };
  } catch (error) {
    console.warn('无法分析依赖:', error.message);
    return null;
  }
}

// 主分析函数
function performAnalysis() {
  console.log('📊 分析文件大小和复杂度...');
  
  // 分析源代码文件
  const srcFiles = analyzeFileSize('src');
  const appFiles = analyzeFileSize('app');
  const allFiles = [...srcFiles, ...appFiles];
  
  // 文件大小统计
  const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
  const avgSize = totalSize / allFiles.length;
  const largeFiles = allFiles.filter(file => file.size > 5000).sort((a, b) => b.size - a.size);
  
  console.log(`📁 文件统计:`);
  console.log(`  总文件数: ${allFiles.length}`);
  console.log(`  总大小: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`  平均大小: ${(avgSize / 1024).toFixed(2)} KB`);
  console.log(`  大文件数 (>5KB): ${largeFiles.length}`);
  
  if (largeFiles.length > 0) {
    console.log(`\n🔍 最大的文件:`);
    largeFiles.slice(0, 5).forEach(file => {
      console.log(`  ${file.path}: ${(file.size / 1024).toFixed(2)} KB`);
    });
  }
  
  // 代码复杂度分析
  console.log(`\n🧮 代码复杂度分析...`);
  const complexity = analyzeCodeComplexity(allFiles);
  const avgLines = complexity.reduce((sum, file) => sum + file.lines, 0) / complexity.length;
  const complexFiles = complexity.filter(file => file.lines > 100).sort((a, b) => b.lines - a.lines);
  
  console.log(`  平均行数: ${avgLines.toFixed(0)}`);
  console.log(`  复杂文件数 (>100行): ${complexFiles.length}`);
  
  if (complexFiles.length > 0) {
    console.log(`\n📝 最复杂的文件:`);
    complexFiles.slice(0, 5).forEach(file => {
      console.log(`  ${file.path}: ${file.lines} 行, ${file.functions} 函数`);
    });
  }
  
  // 依赖分析
  console.log(`\n📦 依赖分析...`);
  const deps = analyzeDependencies();
  if (deps) {
    console.log(`  生产依赖: ${deps.dependencies}`);
    console.log(`  开发依赖: ${deps.devDependencies}`);
    console.log(`  总依赖数: ${deps.total}`);
    console.log(`  重型依赖: ${deps.heavyDependencies.join(', ')}`);
  }
  
  // 性能建议
  console.log(`\n💡 性能优化建议:`);
  
  if (largeFiles.length > 10) {
    console.log(`  ⚠️  发现 ${largeFiles.length} 个大文件，建议拆分或优化`);
  }
  
  if (complexFiles.length > 5) {
    console.log(`  ⚠️  发现 ${complexFiles.length} 个复杂文件，建议重构`);
  }
  
  if (deps && deps.total > 50) {
    console.log(`  ⚠️  依赖数量较多 (${deps.total})，建议审查是否都必要`);
  }
  
  console.log(`  ✅ 建议使用 React.memo() 优化组件渲染`);
  console.log(`  ✅ 建议使用 useMemo() 和 useCallback() 优化计算`);
  console.log(`  ✅ 建议实现代码分割和懒加载`);
  console.log(`  ✅ 建议优化图片和静态资源`);
  
  return {
    files: allFiles.length,
    totalSize,
    largeFiles: largeFiles.length,
    complexFiles: complexFiles.length,
    dependencies: deps?.total || 0
  };
}

// 分析路由和懒加载
function analyzeRoutes() {
  try {
    const routesContent = readFileSync('src/config/routes.ts', 'utf-8');
    const lazyImports = (routesContent.match(/React\.lazy|lazy\(/g) || []).length;
    const dynamicImports = (routesContent.match(/import\(/g) || []).length;
    
    return {
      lazyImports,
      dynamicImports,
      hasLazyLoading: lazyImports > 0 || dynamicImports > 0
    };
  } catch (error) {
    console.warn('无法分析路由配置:', error.message);
    return null;
  }
}

// 分析组件优化情况
function analyzeComponentOptimization(files) {
  const optimizationStats = {
    memoUsage: 0,
    useMemoUsage: 0,
    useCallbackUsage: 0,
    totalComponents: 0
  };
  
  for (const file of files) {
    if (file.path.includes('.tsx') || file.path.includes('.jsx')) {
      try {
        const content = readFileSync(file.path, 'utf-8');
        
        // 检查组件数量
        const components = (content.match(/function\s+[A-Z]\w+|const\s+[A-Z]\w+\s*=\s*\(/g) || []).length;
        optimizationStats.totalComponents += components;
        
        // 检查优化hooks使用
        optimizationStats.memoUsage += (content.match(/React\.memo|memo\(/g) || []).length;
        optimizationStats.useMemoUsage += (content.match(/useMemo\(/g) || []).length;
        optimizationStats.useCallbackUsage += (content.match(/useCallback\(/g) || []).length;
      } catch (error) {
        // 忽略读取错误
      }
    }
  }
  
  return optimizationStats;
}

// 生成性能报告
function generatePerformanceReport(results, routes, optimization) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: results.files,
      totalSizeKB: (results.totalSize / 1024).toFixed(2),
      largeFiles: results.largeFiles,
      complexFiles: results.complexFiles,
      dependencies: results.dependencies
    },
    routes: routes,
    optimization: optimization,
    recommendations: []
  };
  
  // 生成建议
  if (results.largeFiles > 10) {
    report.recommendations.push({
      type: 'warning',
      category: 'file-size',
      message: `发现 ${results.largeFiles} 个大文件，建议拆分或优化`
    });
  }
  
  if (results.complexFiles > 5) {
    report.recommendations.push({
      type: 'warning',
      category: 'complexity',
      message: `发现 ${results.complexFiles} 个复杂文件，建议重构`
    });
  }
  
  if (optimization.totalComponents > 0) {
    const memoRate = (optimization.memoUsage / optimization.totalComponents * 100).toFixed(1);
    const useMemoRate = (optimization.useMemoUsage / optimization.totalComponents * 100).toFixed(1);
    
    if (memoRate < 20) {
      report.recommendations.push({
        type: 'suggestion',
        category: 'optimization',
        message: `React.memo 使用率较低 (${memoRate}%)，建议优化组件渲染`
      });
    }
    
    if (useMemoRate < 10) {
      report.recommendations.push({
        type: 'suggestion',
        category: 'optimization',
        message: `useMemo 使用率较低 (${useMemoRate}%)，建议优化计算性能`
      });
    }
  }
  
  if (!routes?.hasLazyLoading) {
    report.recommendations.push({
      type: 'warning',
      category: 'lazy-loading',
      message: '未检测到懒加载配置，建议实现代码分割'
    });
  }
  
  return report;
}

// 运行分析
const results = performAnalysis();

// 重新获取文件列表用于组件分析
const srcFiles = analyzeFileSize('src');
const appFiles = analyzeFileSize('app');
const allFiles = [...srcFiles, ...appFiles];

const routes = analyzeRoutes();
const optimization = analyzeComponentOptimization(allFiles);

console.log(`\n🔍 路由分析:`);
if (routes) {
  console.log(`  懒加载导入: ${routes.lazyImports}`);
  console.log(`  动态导入: ${routes.dynamicImports}`);
  console.log(`  懒加载状态: ${routes.hasLazyLoading ? '✅ 已启用' : '❌ 未启用'}`);
}

console.log(`\n⚡ 组件优化分析:`);
console.log(`  总组件数: ${optimization.totalComponents}`);
console.log(`  React.memo 使用: ${optimization.memoUsage} (${(optimization.memoUsage / optimization.totalComponents * 100).toFixed(1)}%)`);
console.log(`  useMemo 使用: ${optimization.useMemoUsage} (${(optimization.useMemoUsage / optimization.totalComponents * 100).toFixed(1)}%)`);
console.log(`  useCallback 使用: ${optimization.useCallbackUsage} (${(optimization.useCallbackUsage / optimization.totalComponents * 100).toFixed(1)}%)`);

// 生成报告文件
const report = generatePerformanceReport(results, routes, optimization);
try {
  writeFileSync('tmp/performance-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 性能报告已保存到: tmp/performance-report.json`);
} catch (error) {
  console.warn('无法保存报告文件:', error.message);
}

console.log(`\n✅ 性能分析完成!`);
console.log(`📊 分析结果: ${results.files} 文件, ${(results.totalSize / 1024).toFixed(2)} KB 总大小`);