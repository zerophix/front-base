#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('⚡ 开始内存泄漏检测和组件清理分析...\n');

// 确保tmp目录存在
const tmpDir = join(projectRoot, 'tmp');
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

// 获取所有React文件
function getAllReactFiles(dir) {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  
  function traverse(currentDir) {
    try {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
            traverse(fullPath);
          }
        } else if (extensions.includes(extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  traverse(dir);
  return files;
}

// 检测useEffect清理问题
function analyzeUseEffectCleanup(content, filePath) {
  const issues = [];
  
  // 匹配useEffect模式
  const useEffectRegex = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
  const useEffectMatches = [...content.matchAll(useEffectRegex)];
  
  for (const match of useEffectMatches) {
    const effectBody = match[1];
    const dependencies = match[2];
    
    // 检查是否有定时器但没有清理
    if ((effectBody.includes('setTimeout') || effectBody.includes('setInterval')) && 
        !effectBody.includes('return')) {
      issues.push({
        type: 'timer-cleanup',
        severity: 'high',
        description: 'useEffect中使用了定时器但没有清理函数',
        suggestion: '添加return语句清理定时器'
      });
    }
    
    // 检查是否有事件监听器但没有清理
    if ((effectBody.includes('addEventListener') || effectBody.includes('on(')) && 
        !effectBody.includes('return')) {
      issues.push({
        type: 'event-listener-cleanup',
        severity: 'high',
        description: 'useEffect中添加了事件监听器但没有清理函数',
        suggestion: '添加return语句移除事件监听器'
      });
    }
    
    // 检查是否有订阅但没有清理
    if ((effectBody.includes('subscribe') || effectBody.includes('on(')) && 
        !effectBody.includes('return')) {
      issues.push({
        type: 'subscription-cleanup',
        severity: 'medium',
        description: 'useEffect中有订阅操作但没有清理函数',
        suggestion: '添加return语句取消订阅'
      });
    }
    
    // 检查异步操作但没有取消机制
    if ((effectBody.includes('fetch(') || effectBody.includes('axios') || effectBody.includes('async')) && 
        !effectBody.includes('AbortController') && !effectBody.includes('cancel')) {
      issues.push({
        type: 'async-cleanup',
        severity: 'medium',
        description: 'useEffect中有异步操作但没有取消机制',
        suggestion: '使用AbortController或其他机制取消异步操作'
      });
    }
    
    // 检查空依赖数组的useEffect
    if (dependencies.trim() === '' && effectBody.length > 100) {
      issues.push({
        type: 'empty-deps',
        severity: 'low',
        description: 'useEffect使用空依赖数组但逻辑复杂',
        suggestion: '检查是否需要添加依赖或拆分effect'
      });
    }
  }
  
  return issues;
}

// 检测状态管理问题
function analyzeStateManagement(content, filePath) {
  const issues = [];
  
  // 检查useState过度使用
  const useStateMatches = content.match(/useState/g);
  if (useStateMatches && useStateMatches.length > 10) {
    issues.push({
      type: 'excessive-state',
      severity: 'medium',
      description: `组件使用了${useStateMatches.length}个useState，可能过度复杂`,
      suggestion: '考虑使用useReducer或状态管理库'
    });
  }
  
  // 检查是否有状态更新但组件可能已卸载
  if (content.includes('setState') || content.includes('useState')) {
    if (!content.includes('useRef') && !content.includes('isMounted')) {
      issues.push({
        type: 'unmounted-state-update',
        severity: 'medium',
        description: '可能在组件卸载后更新状态',
        suggestion: '使用useRef跟踪组件挂载状态'
      });
    }
  }
  
  return issues;
}

// 检测内存泄漏风险
function analyzeMemoryLeakRisks(content, filePath) {
  const issues = [];
  
  // 检查闭包中的大对象引用
  if (content.includes('useCallback') || content.includes('useMemo')) {
    const callbackMatches = content.match(/useCallback\s*\([^)]*\)/g);
    const memoMatches = content.match(/useMemo\s*\([^)]*\)/g);
    
    if (callbackMatches && callbackMatches.length > 5) {
      issues.push({
        type: 'excessive-callbacks',
        severity: 'low',
        description: '大量使用useCallback可能导致内存占用增加',
        suggestion: '检查是否所有callback都必要'
      });
    }
    
    if (memoMatches && memoMatches.length > 5) {
      issues.push({
        type: 'excessive-memos',
        severity: 'low',
        description: '大量使用useMemo可能导致内存占用增加',
        suggestion: '检查是否所有memo都必要'
      });
    }
  }
  
  // 检查全局变量引用
  if (content.includes('window.') && !content.includes('typeof window')) {
    issues.push({
      type: 'global-reference',
      severity: 'low',
      description: '直接引用全局对象可能导致内存泄漏',
      suggestion: '添加typeof检查或使用useEffect清理'
    });
  }
  
  // 检查DOM引用
  if (content.includes('document.') || content.includes('querySelector')) {
    if (!content.includes('useRef') && !content.includes('cleanup')) {
      issues.push({
        type: 'dom-reference',
        severity: 'medium',
        description: '直接操作DOM但可能没有清理',
        suggestion: '使用useRef或在useEffect中清理DOM引用'
      });
    }
  }
  
  return issues;
}

// 检测组件生命周期问题
function analyzeComponentLifecycle(content, filePath) {
  const issues = [];
  
  // 检查是否有componentWillUnmount等价物
  if (content.includes('useEffect')) {
    const hasCleanupEffect = content.includes('return () =>') || content.includes('return function');
    const hasAsyncOrTimer = content.includes('setTimeout') || 
                           content.includes('setInterval') || 
                           content.includes('addEventListener') ||
                           content.includes('fetch(') ||
                           content.includes('axios');
    
    if (hasAsyncOrTimer && !hasCleanupEffect) {
      issues.push({
        type: 'missing-cleanup',
        severity: 'high',
        description: '组件有副作用操作但缺少清理逻辑',
        suggestion: '在useEffect中添加清理函数'
      });
    }
  }
  
  // 检查forwardRef使用
  if (content.includes('forwardRef') && !content.includes('useImperativeHandle')) {
    issues.push({
      type: 'ref-forwarding',
      severity: 'low',
      description: 'forwardRef可能导致引用泄漏',
      suggestion: '考虑使用useImperativeHandle限制暴露的方法'
    });
  }
  
  return issues;
}

// 分析单个文件
function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 跳过非React文件
    if (!content.includes('React') && !content.includes('useState') && !content.includes('useEffect')) {
      return null;
    }
    
    const issues = [
      ...analyzeUseEffectCleanup(content, filePath),
      ...analyzeStateManagement(content, filePath),
      ...analyzeMemoryLeakRisks(content, filePath),
      ...analyzeComponentLifecycle(content, filePath)
    ];
    
    if (issues.length === 0) {
      return null;
    }
    
    return {
      file: filePath.replace(projectRoot, ''),
      issues,
      riskLevel: calculateRiskLevel(issues)
    };
    
  } catch (error) {
    return null;
  }
}

// 计算风险等级
function calculateRiskLevel(issues) {
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const lowCount = issues.filter(i => i.severity === 'low').length;
  
  const score = highCount * 3 + mediumCount * 2 + lowCount * 1;
  
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// 生成优化建议
function generateOptimizationSuggestions(analysisResults) {
  const suggestions = [];
  const issueTypes = {};
  
  // 统计问题类型
  for (const result of analysisResults) {
    for (const issue of result.issues) {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
    }
  }
  
  // 生成建议
  if (issueTypes['timer-cleanup'] > 0) {
    suggestions.push({
      type: 'timer-cleanup',
      priority: 'high',
      title: '修复定时器清理问题',
      description: `发现 ${issueTypes['timer-cleanup']} 个定时器清理问题`,
      action: '在useEffect返回函数中清理所有定时器'
    });
  }
  
  if (issueTypes['event-listener-cleanup'] > 0) {
    suggestions.push({
      type: 'event-cleanup',
      priority: 'high',
      title: '修复事件监听器清理问题',
      description: `发现 ${issueTypes['event-listener-cleanup']} 个事件监听器清理问题`,
      action: '在useEffect返回函数中移除所有事件监听器'
    });
  }
  
  if (issueTypes['async-cleanup'] > 0) {
    suggestions.push({
      type: 'async-cleanup',
      priority: 'medium',
      title: '优化异步操作取消',
      description: `发现 ${issueTypes['async-cleanup']} 个异步操作缺少取消机制`,
      action: '使用AbortController取消fetch请求'
    });
  }
  
  if (issueTypes['excessive-state'] > 0) {
    suggestions.push({
      type: 'state-management',
      priority: 'medium',
      title: '优化状态管理',
      description: `发现 ${issueTypes['excessive-state']} 个组件状态过于复杂`,
      action: '考虑使用useReducer或状态管理库'
    });
  }
  
  return suggestions;
}

// 主分析函数
async function analyzeMemoryLeaks() {
  try {
    console.log('📊 扫描React组件文件...');
    
    const srcFiles = getAllReactFiles(join(projectRoot, 'src'));
    const appFiles = getAllReactFiles(join(projectRoot, 'app'));
    const allFiles = [...srcFiles, ...appFiles];
    
    console.log(`找到 ${allFiles.length} 个文件`);
    
    const analysisResults = [];
    let processedFiles = 0;
    
    for (const file of allFiles) {
      const result = analyzeFile(file);
      if (result) {
        analysisResults.push(result);
      }
      processedFiles++;
    }
    
    // 统计结果
    const totalIssues = analysisResults.reduce((sum, result) => sum + result.issues.length, 0);
    const highRiskFiles = analysisResults.filter(r => r.riskLevel === 'high').length;
    const mediumRiskFiles = analysisResults.filter(r => r.riskLevel === 'medium').length;
    const lowRiskFiles = analysisResults.filter(r => r.riskLevel === 'low').length;
    
    // 计算评分
    const cleanFiles = processedFiles - analysisResults.length;
    const cleanPercentage = (cleanFiles / processedFiles) * 100;
    
    let grade = 'F';
    if (cleanPercentage >= 90) grade = 'A';
    else if (cleanPercentage >= 80) grade = 'B';
    else if (cleanPercentage >= 70) grade = 'C';
    else if (cleanPercentage >= 60) grade = 'D';
    
    const gradeEmoji = {
      'A': '🟢',
      'B': '🟡',
      'C': '🟠',
      'D': '🔴',
      'F': '⚫'
    };
    
    // 输出结果
    console.log('📈 内存泄漏检测结果:');
    console.log(`  扫描文件: ${processedFiles}`);
    console.log(`  问题文件: ${analysisResults.length}`);
    console.log(`  清洁文件: ${cleanFiles} (${cleanPercentage.toFixed(1)}%)`);
    console.log(`  总问题数: ${totalIssues}`);
    console.log(`  高风险文件: ${highRiskFiles}`);
    console.log(`  中风险文件: ${mediumRiskFiles}`);
    console.log(`  低风险文件: ${lowRiskFiles}`);
    console.log(`  清洁度评分: ${cleanPercentage.toFixed(1)}/100`);
    console.log(`  评级: ${gradeEmoji[grade]} ${grade}\n`);
    
    // 显示高风险文件
    const highRiskResults = analysisResults.filter(r => r.riskLevel === 'high');
    if (highRiskResults.length > 0) {
      console.log('🔴 高风险文件 (前5个):');
      highRiskResults.slice(0, 5).forEach(result => {
        console.log(`  ⚠️  ${result.file}`);
        result.issues.forEach(issue => {
          const severityEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
          console.log(`    ${severityEmoji} ${issue.description}`);
        });
      });
      console.log('');
    }
    
    // 生成优化建议
    const suggestions = generateOptimizationSuggestions(analysisResults);
    
    if (suggestions.length > 0) {
      console.log('💡 优化建议:');
      suggestions.forEach(suggestion => {
        const priorityEmoji = suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priorityEmoji} ${suggestion.title}`);
        console.log(`    ${suggestion.description}`);
        console.log(`    💡 ${suggestion.action}\n`);
      });
    }
    
    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: processedFiles,
        problemFiles: analysisResults.length,
        cleanFiles,
        totalIssues,
        cleanPercentage: Math.round(cleanPercentage),
        grade
      },
      riskDistribution: {
        high: highRiskFiles,
        medium: mediumRiskFiles,
        low: lowRiskFiles
      },
      analysisResults: analysisResults.slice(0, 50), // 限制数量
      suggestions
    };
    
    const reportPath = join(tmpDir, 'memory-leak-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 详细报告已保存到: ${reportPath.replace(projectRoot, '.')}`);
    console.log('\n✅ 内存泄漏检测分析完成!');
    console.log(`📊 分析了 ${processedFiles} 个文件，清洁度 ${cleanPercentage.toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行分析
analyzeMemoryLeaks();