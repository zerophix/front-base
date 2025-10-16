#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('⚡ 开始生成综合性能监控报告...\n');

// 确保tmp目录存在
const tmpDir = join(projectRoot, 'tmp');
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

// 读取之前生成的报告
function loadReport(filename) {
  const filePath = join(tmpDir, filename);
  if (existsSync(filePath)) {
    try {
      return JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.warn(`无法读取报告: ${filename}`);
      return null;
    }
  }
  return null;
}

// 分析package.json依赖
function analyzePackageJson() {
  const packagePath = join(projectRoot, 'package.json');
  if (!existsSync(packagePath)) {
    return null;
  }
  
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    
    return {
      name: packageJson.name || 'Unknown',
      version: packageJson.version || '0.0.0',
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      scripts: Object.keys(packageJson.scripts || {}),
      engines: packageJson.engines || {}
    };
  } catch (error) {
    return null;
  }
}

// 计算整体性能评分
function calculateOverallScore(reports) {
  const scores = [];
  
  // React组件优化评分 (权重: 25%)
  if (reports.react && reports.react.summary) {
    scores.push({ score: reports.react.summary.averageScore || 0, weight: 0.25 });
  }
  
  // Bundle分析评分 (权重: 20%)
  if (reports.bundle) {
    // 基于依赖数量和大小计算评分
    const depCount = reports.bundle.dependencies?.length || 0;
    const bundleScore = Math.max(0, 100 - depCount * 2); // 每个依赖扣2分
    scores.push({ score: bundleScore, weight: 0.20 });
  }
  
  // 路由优化评分 (权重: 20%)
  if (reports.route && reports.route.scores) {
    scores.push({ score: reports.route.scores.overall || 0, weight: 0.20 });
  }
  
  // 内存泄漏检测评分 (权重: 25%)
  if (reports.memory && reports.memory.summary) {
    scores.push({ score: reports.memory.summary.cleanPercentage || 0, weight: 0.25 });
  }
  
  // 代码质量评分 (权重: 10%)
  if (reports.performance) {
    const codeQualityScore = 100 - (reports.performance.largeFiles?.length || 0) * 2;
    scores.push({ score: Math.max(0, codeQualityScore), weight: 0.10 });
  }
  
  // 计算加权平均分
  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = scores.reduce((sum, item) => sum + item.score * item.weight, 0);
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// 生成性能等级
function getPerformanceGrade(score) {
  if (score >= 90) return { grade: 'A', emoji: '🟢', description: '优秀' };
  if (score >= 80) return { grade: 'B', emoji: '🟡', description: '良好' };
  if (score >= 70) return { grade: 'C', emoji: '🟠', description: '一般' };
  if (score >= 60) return { grade: 'D', emoji: '🔴', description: '需要改进' };
  return { grade: 'F', emoji: '⚫', description: '急需优化' };
}

// 生成优化优先级建议
function generatePriorityRecommendations(reports) {
  const recommendations = [];
  
  // 高优先级问题
  if (reports.route && reports.route.scores && reports.route.scores.overall < 50) {
    recommendations.push({
      priority: 'critical',
      category: '路由优化',
      title: '紧急：启用路由懒加载',
      description: '路由优化评分过低，严重影响应用性能',
      impact: 'high',
      effort: 'medium'
    });
  }
  
  if (reports.memory && reports.memory.summary && reports.memory.summary.cleanPercentage < 80) {
    recommendations.push({
      priority: 'high',
      category: '内存管理',
      title: '修复内存泄漏风险',
      description: '发现多个内存泄漏风险点',
      impact: 'high',
      effort: 'high'
    });
  }
  
  // 中优先级问题
  if (reports.react && reports.react.summary && reports.react.summary.averageScore < 85) {
    recommendations.push({
      priority: 'medium',
      category: 'React优化',
      title: '优化组件性能',
      description: '部分组件缺少性能优化',
      impact: 'medium',
      effort: 'medium'
    });
  }
  
  if (reports.bundle && reports.bundle.largeComponents && reports.bundle.largeComponents.length > 5) {
    recommendations.push({
      priority: 'medium',
      category: '代码分割',
      title: '实施代码分割',
      description: '发现多个大型组件可以进行代码分割',
      impact: 'medium',
      effort: 'low'
    });
  }
  
  // 低优先级问题
  if (reports.performance && reports.performance.largeFiles && reports.performance.largeFiles.length > 10) {
    recommendations.push({
      priority: 'low',
      category: '代码重构',
      title: '重构大型文件',
      description: '部分文件过大，建议拆分',
      impact: 'low',
      effort: 'high'
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// 生成性能趋势分析
function generatePerformanceTrends(reports) {
  const trends = {
    codebase: {
      totalFiles: 0,
      totalSize: 0,
      averageFileSize: 0
    },
    components: {
      total: 0,
      optimized: 0,
      optimizationRate: 0
    },
    dependencies: {
      production: 0,
      development: 0,
      total: 0
    },
    issues: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  // 从性能报告中提取数据
  if (reports.performance) {
    trends.codebase.totalFiles = reports.performance.totalFiles || 0;
    trends.codebase.totalSize = reports.performance.totalSize || 0;
    trends.codebase.averageFileSize = trends.codebase.totalFiles > 0 ? 
      trends.codebase.totalSize / trends.codebase.totalFiles : 0;
  }
  
  // 从React报告中提取数据
  if (reports.react && reports.react.summary) {
    trends.components.total = reports.react.summary.totalFiles || 0;
    trends.components.optimized = reports.react.summary.optimizedFiles || 0;
    trends.components.optimizationRate = trends.components.total > 0 ? 
      (trends.components.optimized / trends.components.total) * 100 : 0;
  }
  
  // 从Bundle报告中提取数据
  if (reports.bundle) {
    trends.dependencies.production = reports.bundle.dependencies?.filter(d => d.type === 'production').length || 0;
    trends.dependencies.development = reports.bundle.dependencies?.filter(d => d.type === 'development').length || 0;
    trends.dependencies.total = trends.dependencies.production + trends.dependencies.development;
  }
  
  return trends;
}

// 主函数
async function generatePerformanceReport() {
  try {
    console.log('📊 收集性能分析报告...');
    
    // 加载所有报告
    const reports = {
      performance: loadReport('performance-report.json'),
      bundle: loadReport('bundle-analysis-report.json'),
      react: loadReport('react-optimization-report.json'),
      route: loadReport('route-optimization-report.json'),
      memory: loadReport('memory-leak-report.json')
    };
    
    // 分析package.json
    const packageInfo = analyzePackageJson();
    
    // 计算整体评分
    const overallScore = calculateOverallScore(reports);
    const performanceGrade = getPerformanceGrade(overallScore);
    
    // 生成建议
    const recommendations = generatePriorityRecommendations(reports);
    
    // 生成趋势分析
    const trends = generatePerformanceTrends(reports);
    
    // 输出摘要
    console.log('📈 综合性能分析结果:');
    console.log(`  项目名称: ${packageInfo?.name || 'Unknown'}`);
    console.log(`  项目版本: ${packageInfo?.version || '0.0.0'}`);
    console.log(`  整体评分: ${overallScore}/100`);
    console.log(`  性能等级: ${performanceGrade.emoji} ${performanceGrade.grade} (${performanceGrade.description})`);
    console.log(`  总文件数: ${trends.codebase.totalFiles}`);
    console.log(`  组件优化率: ${trends.components.optimizationRate.toFixed(1)}%`);
    console.log(`  依赖总数: ${trends.dependencies.total}\n`);
    
    // 显示关键指标
    console.log('🎯 关键性能指标:');
    
    if (reports.react && reports.react.summary) {
      console.log(`  React组件优化: ${reports.react.summary.averageScore || 0}/100`);
    }
    
    if (reports.route && reports.route.scores) {
      console.log(`  路由懒加载: ${reports.route.scores.overall || 0}/100`);
    }
    
    if (reports.memory && reports.memory.summary) {
      console.log(`  内存清洁度: ${reports.memory.summary.cleanPercentage || 0}/100`);
    }
    
    if (reports.bundle) {
      const bundleScore = Math.max(0, 100 - (reports.bundle.dependencies?.length || 0) * 2);
      console.log(`  Bundle优化: ${bundleScore}/100`);
    }
    
    console.log('');
    
    // 显示优先级建议
    if (recommendations.length > 0) {
      console.log('🚀 优化建议 (按优先级排序):');
      recommendations.slice(0, 5).forEach((rec, index) => {
        const priorityEmoji = {
          critical: '🚨',
          high: '🔴',
          medium: '🟡',
          low: '🟢'
        };
        console.log(`  ${index + 1}. ${priorityEmoji[rec.priority]} ${rec.title}`);
        console.log(`     类别: ${rec.category}`);
        console.log(`     影响: ${rec.impact} | 工作量: ${rec.effort}`);
        console.log(`     ${rec.description}\n`);
      });
    }
    
    // 生成完整报告
    const fullReport = {
      timestamp: new Date().toISOString(),
      project: packageInfo,
      summary: {
        overallScore,
        grade: performanceGrade.grade,
        description: performanceGrade.description
      },
      metrics: {
        react: reports.react?.summary || null,
        route: reports.route?.scores || null,
        memory: reports.memory?.summary || null,
        bundle: reports.bundle ? {
          totalDependencies: reports.bundle.dependencies?.length || 0,
          largeComponents: reports.bundle.largeComponents?.length || 0
        } : null
      },
      trends,
      recommendations,
      detailedReports: {
        performance: !!reports.performance,
        bundle: !!reports.bundle,
        react: !!reports.react,
        route: !!reports.route,
        memory: !!reports.memory
      }
    };
    
    // 保存报告
    const reportPath = join(tmpDir, 'comprehensive-performance-report.json');
    writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
    
    // 生成HTML报告
    const htmlReport = generateHTMLReport(fullReport);
    const htmlPath = join(tmpDir, 'performance-report.html');
    writeFileSync(htmlPath, htmlReport);
    
    console.log(`📄 JSON报告已保存到: ${reportPath.replace(projectRoot, '.')}`);
    console.log(`🌐 HTML报告已保存到: ${htmlPath.replace(projectRoot, '.')}`);
    console.log('\n✅ 综合性能监控报告生成完成!');
    console.log(`📊 整体评分: ${overallScore}/100 (${performanceGrade.grade}级)`);
    
  } catch (error) {
    console.error('❌ 生成报告过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 生成HTML报告
function generateHTMLReport(report) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>性能分析报告 - ${report.project?.name || 'Unknown Project'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #007bff; }
        .score { font-size: 2em; font-weight: bold; color: #007bff; }
        .grade-a { color: #28a745; }
        .grade-b { color: #ffc107; }
        .grade-c { color: #fd7e14; }
        .grade-d { color: #dc3545; }
        .grade-f { color: #6c757d; }
        .recommendations { margin-top: 30px; }
        .rec-item { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 10px 0; }
        .priority-critical { border-left: 4px solid #dc3545; }
        .priority-high { border-left: 4px solid #fd7e14; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 性能分析报告</h1>
            <p>项目: ${report.project?.name || 'Unknown'} v${report.project?.version || '0.0.0'}</p>
            <p class="timestamp">生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="content">
            <div class="metric-grid">
                <div class="metric-card">
                    <h3>整体评分</h3>
                    <div class="score grade-${report.summary.grade.toLowerCase()}">${report.summary.overallScore}/100</div>
                    <p>等级: ${report.summary.grade} (${report.summary.description})</p>
                </div>
                
                ${report.metrics.react ? `
                <div class="metric-card">
                    <h3>React组件优化</h3>
                    <div class="score">${report.metrics.react.averageScore || 0}/100</div>
                    <p>优化文件: ${report.metrics.react.optimizedFiles || 0}/${report.metrics.react.totalFiles || 0}</p>
                </div>
                ` : ''}
                
                ${report.metrics.route ? `
                <div class="metric-card">
                    <h3>路由优化</h3>
                    <div class="score">${report.metrics.route.overall || 0}/100</div>
                    <p>懒加载: ${report.metrics.route.lazyLoading || 0}/100</p>
                </div>
                ` : ''}
                
                ${report.metrics.memory ? `
                <div class="metric-card">
                    <h3>内存清洁度</h3>
                    <div class="score">${report.metrics.memory.cleanPercentage || 0}/100</div>
                    <p>清洁文件: ${report.metrics.memory.cleanFiles || 0}/${report.metrics.memory.totalFiles || 0}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="recommendations">
                <h2>🎯 优化建议</h2>
                ${report.recommendations.map(rec => `
                    <div class="rec-item priority-${rec.priority}">
                        <h3>${rec.title}</h3>
                        <p><strong>类别:</strong> ${rec.category}</p>
                        <p><strong>优先级:</strong> ${rec.priority}</p>
                        <p><strong>影响:</strong> ${rec.impact} | <strong>工作量:</strong> ${rec.effort}</p>
                        <p>${rec.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
}

// 运行分析
generatePerformanceReport();