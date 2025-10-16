#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('⚡ 开始路由懒加载优化分析...\n');

// 确保tmp目录存在
const tmpDir = join(projectRoot, 'tmp');
if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

// 获取所有文件
function getAllFiles(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过node_modules, .next, .git等目录
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

// 分析路由配置
function analyzeRoutes() {
  console.log('📊 分析路由配置...');
  
  const routeFiles = getAllFiles(join(projectRoot, 'app'));
  const pageFiles = routeFiles.filter(file => file.includes('page.'));
  const layoutFiles = routeFiles.filter(file => file.includes('layout.'));
  
  const routeAnalysis = {
    totalPages: pageFiles.length,
    totalLayouts: layoutFiles.length,
    lazyLoadedPages: 0,
    dynamicImports: 0,
    staticImports: 0,
    largePages: [],
    recommendations: []
  };
  
  console.log(`找到 ${pageFiles.length} 个页面文件`);
  console.log(`找到 ${layoutFiles.length} 个布局文件`);
  
  // 分析每个页面文件
  for (const file of pageFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const stat = statSync(file);
      const sizeKB = (stat.size / 1024).toFixed(2);
      
      // 检查是否使用动态导入
      const hasDynamicImport = content.includes('dynamic(') || content.includes('import(');
      const hasLazyImport = content.includes('React.lazy') || content.includes('lazy(');
      
      if (hasDynamicImport || hasLazyImport) {
        routeAnalysis.lazyLoadedPages++;
        routeAnalysis.dynamicImports++;
      } else {
        routeAnalysis.staticImports++;
      }
      
      // 检查大型页面（>10KB）
      if (stat.size > 10 * 1024) {
        routeAnalysis.largePages.push({
          file: file.replace(projectRoot, ''),
          size: sizeKB + ' KB',
          hasLazyLoading: hasDynamicImport || hasLazyImport
        });
      }
      
    } catch (error) {
      console.warn(`无法读取文件: ${file}`);
    }
  }
  
  return routeAnalysis;
}

// 分析Next.js配置
function analyzeNextConfig() {
  console.log('📊 分析Next.js配置...');
  
  const configPath = join(projectRoot, 'next.config.js');
  const configMjsPath = join(projectRoot, 'next.config.mjs');
  
  let config = {};
  let configExists = false;
  
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      configExists = true;
      
      // 简单解析配置（检查关键字）
      config.experimental = content.includes('experimental');
      config.bundleAnalyzer = content.includes('bundleAnalyzer');
      config.swcMinify = content.includes('swcMinify');
      config.compiler = content.includes('compiler');
      config.images = content.includes('images');
      config.webpack = content.includes('webpack');
      
    } catch (error) {
      console.warn('无法读取next.config.js');
    }
  } else if (existsSync(configMjsPath)) {
    try {
      const content = readFileSync(configMjsPath, 'utf-8');
      configExists = true;
      
      config.experimental = content.includes('experimental');
      config.bundleAnalyzer = content.includes('bundleAnalyzer');
      config.swcMinify = content.includes('swcMinify');
      config.compiler = content.includes('compiler');
      config.images = content.includes('images');
      config.webpack = content.includes('webpack');
      
    } catch (error) {
      console.warn('无法读取next.config.mjs');
    }
  }
  
  return { configExists, config };
}

// 检查代码分割机会
function analyzeCodeSplitting() {
  console.log('📊 分析代码分割机会...');
  
  const componentFiles = getAllFiles(join(projectRoot, 'src/components'));
  const appFiles = getAllFiles(join(projectRoot, 'app'));
  
  const allFiles = [...componentFiles, ...appFiles];
  const splittingOpportunities = [];
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const stat = statSync(file);
      const sizeKB = (stat.size / 1024).toFixed(2);
      
      // 检查大型组件（>5KB）
      if (stat.size > 5 * 1024) {
        const hasLazyLoading = content.includes('dynamic(') || 
                              content.includes('React.lazy') || 
                              content.includes('import(');
        
        if (!hasLazyLoading) {
          splittingOpportunities.push({
            file: file.replace(projectRoot, ''),
            size: sizeKB + ' KB',
            type: file.includes('page.') ? 'page' : 'component',
            recommendation: '建议使用动态导入进行代码分割'
          });
        }
      }
      
    } catch (error) {
      // 忽略读取错误
    }
  }
  
  return splittingOpportunities.sort((a, b) => 
    parseFloat(b.size) - parseFloat(a.size)
  );
}

// 生成优化建议
function generateOptimizationRecommendations(routeAnalysis, nextConfig, codeSplitting) {
  const recommendations = [];
  
  // 路由懒加载建议
  if (routeAnalysis.staticImports > routeAnalysis.dynamicImports) {
    recommendations.push({
      type: 'route-lazy-loading',
      priority: 'high',
      title: '启用路由懒加载',
      description: `发现 ${routeAnalysis.staticImports} 个静态导入的页面，建议使用动态导入`,
      action: '使用 Next.js dynamic() 或 React.lazy() 进行懒加载'
    });
  }
  
  // 大型页面优化建议
  if (routeAnalysis.largePages.length > 0) {
    recommendations.push({
      type: 'large-pages',
      priority: 'high',
      title: '优化大型页面',
      description: `发现 ${routeAnalysis.largePages.length} 个大型页面文件`,
      action: '考虑拆分组件或使用代码分割'
    });
  }
  
  // Next.js配置优化
  if (!nextConfig.configExists) {
    recommendations.push({
      type: 'next-config',
      priority: 'medium',
      title: '创建Next.js配置文件',
      description: '未找到next.config.js，建议创建以优化构建',
      action: '创建next.config.js并启用相关优化选项'
    });
  } else {
    if (!nextConfig.config.swcMinify) {
      recommendations.push({
        type: 'swc-minify',
        priority: 'medium',
        title: '启用SWC压缩',
        description: 'SWC压缩可以提高构建性能',
        action: '在next.config.js中设置 swcMinify: true'
      });
    }
    
    if (!nextConfig.config.images) {
      recommendations.push({
        type: 'image-optimization',
        priority: 'medium',
        title: '配置图片优化',
        description: '启用Next.js图片优化功能',
        action: '配置images选项以优化图片加载'
      });
    }
  }
  
  // 代码分割建议
  if (codeSplitting.length > 0) {
    recommendations.push({
      type: 'code-splitting',
      priority: 'high',
      title: '实施代码分割',
      description: `发现 ${codeSplitting.length} 个可以进行代码分割的文件`,
      action: '对大型组件使用动态导入'
    });
  }
  
  return recommendations;
}

// 主分析函数
async function analyzeRouteOptimization() {
  try {
    const routeAnalysis = analyzeRoutes();
    const nextConfig = analyzeNextConfig();
    const codeSplitting = analyzeCodeSplitting();
    
    const recommendations = generateOptimizationRecommendations(
      routeAnalysis, 
      nextConfig, 
      codeSplitting
    );
    
    // 计算优化评分
    const totalPages = routeAnalysis.totalPages;
    const lazyLoadedPages = routeAnalysis.lazyLoadedPages;
    const lazyLoadingScore = totalPages > 0 ? (lazyLoadedPages / totalPages) * 100 : 100;
    
    const configScore = nextConfig.configExists ? 80 : 40;
    const codeSplittingScore = codeSplitting.length === 0 ? 100 : Math.max(0, 100 - codeSplitting.length * 10);
    
    const overallScore = Math.round((lazyLoadingScore + configScore + codeSplittingScore) / 3);
    
    let grade = 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    
    const gradeEmoji = {
      'A': '🟢',
      'B': '🟡',
      'C': '🟠',
      'D': '🔴',
      'F': '⚫'
    };
    
    // 输出结果
    console.log('📈 路由优化分析结果:');
    console.log(`  总页面数: ${routeAnalysis.totalPages}`);
    console.log(`  懒加载页面: ${routeAnalysis.lazyLoadedPages} (${((routeAnalysis.lazyLoadedPages / routeAnalysis.totalPages) * 100).toFixed(1)}%)`);
    console.log(`  静态导入: ${routeAnalysis.staticImports}`);
    console.log(`  动态导入: ${routeAnalysis.dynamicImports}`);
    console.log(`  大型页面: ${routeAnalysis.largePages.length}`);
    console.log(`  代码分割机会: ${codeSplitting.length}`);
    console.log(`  整体评分: ${overallScore}/100`);
    console.log(`  评级: ${gradeEmoji[grade]} ${grade}\n`);
    
    if (routeAnalysis.largePages.length > 0) {
      console.log('🔧 大型页面文件 (前5个):');
      routeAnalysis.largePages.slice(0, 5).forEach(page => {
        const status = page.hasLazyLoading ? '✅' : '❌';
        console.log(`  ${status} ${page.file}: ${page.size}`);
      });
      console.log('');
    }
    
    if (codeSplitting.length > 0) {
      console.log('💡 代码分割机会 (前5个):');
      codeSplitting.slice(0, 5).forEach(opportunity => {
        console.log(`  📦 ${opportunity.file}: ${opportunity.size} (${opportunity.type})`);
      });
      console.log('');
    }
    
    if (recommendations.length > 0) {
      console.log('🎯 优化建议:');
      recommendations.forEach(rec => {
        const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priorityEmoji} ${rec.title}`);
        console.log(`    ${rec.description}`);
        console.log(`    💡 ${rec.action}\n`);
      });
    }
    
    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      routeAnalysis,
      nextConfig,
      codeSplitting: codeSplitting.slice(0, 20), // 限制数量
      recommendations,
      scores: {
        lazyLoading: Math.round(lazyLoadingScore),
        config: configScore,
        codeSplitting: Math.round(codeSplittingScore),
        overall: overallScore,
        grade
      }
    };
    
    const reportPath = join(tmpDir, 'route-optimization-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 详细报告已保存到: ${reportPath.replace(projectRoot, '.')}`);
    console.log('\n✅ 路由懒加载优化分析完成!');
    console.log(`📊 分析了 ${routeAnalysis.totalPages} 个页面，整体评分 ${overallScore}/100`);
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行分析
analyzeRouteOptimization();