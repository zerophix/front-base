#!/usr/bin/env node
/**
 * React组件性能优化脚本
 * 自动分析和优化React组件性能
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

console.log('⚡ 开始React组件性能优化分析...\n');

// 获取所有React组件文件
function getReactFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.isFile() && ['.tsx', '.jsx'].includes(extname(item.name))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }
  
  scanDirectory(dir);
  return files;
}

// 分析组件性能问题
function analyzeComponentPerformance(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const analysis = {
      path: filePath,
      size: Buffer.byteLength(content, 'utf8'),
      issues: [],
      optimizations: [],
      score: 100
    };
    
    // 检查是否是React组件
    const isComponent = /function\s+[A-Z]\w+|const\s+[A-Z]\w+\s*=\s*\(|export\s+default\s+function\s+[A-Z]\w+/.test(content);
    if (!isComponent) {
      return null;
    }
    
    // 检查React.memo使用
    const hasMemo = /React\.memo|memo\(/.test(content);
    if (!hasMemo && analysis.size > 2000) {
      analysis.issues.push({
        type: 'missing-memo',
        severity: 'medium',
        message: '大型组件未使用React.memo优化'
      });
      analysis.score -= 15;
    }
    
    // 检查useMemo使用
    const useMemoCount = (content.match(/useMemo\(/g) || []).length;
    const expensiveOperations = (content.match(/\.map\(|\.filter\(|\.reduce\(|\.sort\(/g) || []).length;
    if (expensiveOperations > 2 && useMemoCount === 0) {
      analysis.issues.push({
        type: 'missing-usememo',
        severity: 'medium',
        message: '存在昂贵计算但未使用useMemo优化'
      });
      analysis.score -= 10;
    }
    
    // 检查useCallback使用
    const useCallbackCount = (content.match(/useCallback\(/g) || []).length;
    const inlineFunctions = (content.match(/onClick=\{[^}]*=>/g) || []).length;
    if (inlineFunctions > 1 && useCallbackCount === 0) {
      analysis.issues.push({
        type: 'missing-usecallback',
        severity: 'low',
        message: '存在内联函数但未使用useCallback优化'
      });
      analysis.score -= 5;
    }
    
    // 检查key属性使用
    const hasMapWithoutKey = /\.map\([^}]*<[^>]*(?!key=)/g.test(content);
    if (hasMapWithoutKey) {
      analysis.issues.push({
        type: 'missing-key',
        severity: 'high',
        message: '列表渲染缺少key属性'
      });
      analysis.score -= 20;
    }
    
    // 检查不必要的重渲染
    const hasInlineObjects = /style=\{\{|className=\{`/.test(content);
    if (hasInlineObjects) {
      analysis.issues.push({
        type: 'inline-objects',
        severity: 'low',
        message: '存在内联对象可能导致不必要的重渲染'
      });
      analysis.score -= 5;
    }
    
    // 检查useState的过度使用
    const useStateCount = (content.match(/useState\(/g) || []).length;
    if (useStateCount > 5) {
      analysis.issues.push({
        type: 'too-many-states',
        severity: 'medium',
        message: 'useState使用过多，考虑使用useReducer'
      });
      analysis.score -= 10;
    }
    
    // 检查useEffect依赖
    const useEffectMatches = content.match(/useEffect\([^,]*,\s*\[[^\]]*\]/g) || [];
    for (const match of useEffectMatches) {
      if (match.includes('[]')) continue; // 空依赖数组是正常的
      if (!match.includes('[') || match.includes('[,') || match.includes(', ]')) {
        analysis.issues.push({
          type: 'effect-dependencies',
          severity: 'medium',
          message: 'useEffect依赖数组可能有问题'
        });
        analysis.score -= 8;
        break;
      }
    }
    
    // 生成优化建议
    if (analysis.issues.length > 0) {
      analysis.optimizations = generateOptimizationSuggestions(analysis.issues, content);
    }
    
    return analysis;
  } catch (error) {
    console.warn(`无法分析文件 ${filePath}:`, error.message);
    return null;
  }
}

// 生成优化建议
function generateOptimizationSuggestions(issues, content) {
  const suggestions = [];
  
  for (const issue of issues) {
    switch (issue.type) {
      case 'missing-memo':
        suggestions.push({
          type: 'add-memo',
          description: '使用React.memo包装组件',
          code: 'export const ComponentName = React.memo(ComponentNameImpl);'
        });
        break;
        
      case 'missing-usememo':
        suggestions.push({
          type: 'add-usememo',
          description: '对昂贵计算使用useMemo',
          code: 'const expensiveValue = useMemo(() => computeExpensiveValue(deps), [deps]);'
        });
        break;
        
      case 'missing-usecallback':
        suggestions.push({
          type: 'add-usecallback',
          description: '对事件处理函数使用useCallback',
          code: 'const handleClick = useCallback(() => { /* handler */ }, [deps]);'
        });
        break;
        
      case 'missing-key':
        suggestions.push({
          type: 'add-key',
          description: '为列表项添加唯一key属性',
          code: 'items.map((item, index) => <Item key={item.id || index} />)'
        });
        break;
        
      case 'inline-objects':
        suggestions.push({
          type: 'extract-objects',
          description: '提取内联对象到组件外部或使用useMemo',
          code: 'const styles = useMemo(() => ({ color: "red" }), []);'
        });
        break;
        
      case 'too-many-states':
        suggestions.push({
          type: 'use-reducer',
          description: '考虑使用useReducer管理复杂状态',
          code: 'const [state, dispatch] = useReducer(reducer, initialState);'
        });
        break;
        
      case 'effect-dependencies':
        suggestions.push({
          type: 'fix-dependencies',
          description: '检查并修复useEffect依赖数组',
          code: 'useEffect(() => { /* effect */ }, [prop1, prop2]); // 确保依赖完整'
        });
        break;
    }
  }
  
  return suggestions;
}

// 生成性能评分
function calculatePerformanceGrade(score) {
  if (score >= 90) return { grade: 'A', color: '🟢', description: '优秀' };
  if (score >= 80) return { grade: 'B', color: '🟡', description: '良好' };
  if (score >= 70) return { grade: 'C', color: '🟠', description: '一般' };
  return { grade: 'D', color: '🔴', description: '需要优化' };
}

// 主分析函数
function performReactOptimization() {
  console.log('📊 扫描React组件文件...');
  
  const srcFiles = getReactFiles('src');
  const appFiles = getReactFiles('app');
  const allFiles = [...srcFiles, ...appFiles];
  
  console.log(`找到 ${allFiles.length} 个React文件\n`);
  
  const analyses = [];
  const summary = {
    totalFiles: 0,
    optimizedFiles: 0,
    issuesFound: 0,
    averageScore: 0
  };
  
  for (const file of allFiles) {
    const analysis = analyzeComponentPerformance(file);
    if (analysis) {
      analyses.push(analysis);
      summary.totalFiles++;
      summary.issuesFound += analysis.issues.length;
      summary.averageScore += analysis.score;
      
      if (analysis.score >= 85) {
        summary.optimizedFiles++;
      }
    }
  }
  
  summary.averageScore = summary.averageScore / summary.totalFiles;
  
  // 按性能分数排序
  analyses.sort((a, b) => a.score - b.score);
  
  // 显示结果
  console.log('📈 性能分析结果:');
  console.log(`  总文件数: ${summary.totalFiles}`);
  console.log(`  已优化文件: ${summary.optimizedFiles} (${(summary.optimizedFiles / summary.totalFiles * 100).toFixed(1)}%)`);
  console.log(`  发现问题: ${summary.issuesFound} 个`);
  console.log(`  平均分数: ${summary.averageScore.toFixed(1)}/100`);
  
  const grade = calculatePerformanceGrade(summary.averageScore);
  console.log(`  整体评级: ${grade.color} ${grade.grade} (${grade.description})\n`);
  
  // 显示需要优化的文件
  const needsOptimization = analyses.filter(a => a.score < 85);
  if (needsOptimization.length > 0) {
    console.log('🔧 需要优化的文件 (前10个):');
    needsOptimization.slice(0, 10).forEach(analysis => {
      const grade = calculatePerformanceGrade(analysis.score);
      console.log(`  ${grade.color} ${basename(analysis.path)}: ${analysis.score}/100`);
      analysis.issues.forEach(issue => {
        const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`    ${severity} ${issue.message}`);
      });
    });
    console.log();
  }
  
  // 显示优化建议统计
  const optimizationTypes = {};
  analyses.forEach(analysis => {
    analysis.optimizations.forEach(opt => {
      optimizationTypes[opt.type] = (optimizationTypes[opt.type] || 0) + 1;
    });
  });
  
  if (Object.keys(optimizationTypes).length > 0) {
    console.log('💡 优化建议统计:');
    Object.entries(optimizationTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} 个文件需要此优化`);
      });
    console.log();
  }
  
  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    analyses: analyses.slice(0, 50), // 限制报告大小
    optimizationTypes
  };
  
  try {
    writeFileSync('tmp/react-optimization-report.json', JSON.stringify(report, null, 2));
    console.log('📄 详细报告已保存到: tmp/react-optimization-report.json');
  } catch (error) {
    console.warn('无法保存报告文件:', error.message);
  }
  
  return report;
}

// 运行优化分析
const report = performReactOptimization();

console.log('\n✅ React组件性能分析完成!');
console.log(`📊 分析了 ${report.summary.totalFiles} 个组件，平均分数 ${report.summary.averageScore.toFixed(1)}/100`);