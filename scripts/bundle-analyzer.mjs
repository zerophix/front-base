#!/usr/bin/env node
/**
 * Bundle大小分析工具
 * 分析项目的打包大小和代码分割情况
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execSync } from 'node:child_process';

console.log('📦 开始Bundle大小分析...\n');

// 分析依赖大小
function analyzeDependencySize() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const deps = packageJson.dependencies || {};
    
    const dependencyAnalysis = [];
    
    for (const [name, version] of Object.entries(deps)) {
      try {
        // 尝试获取包的大小信息
        const packagePath = join('node_modules', name, 'package.json');
        if (existsSync(packagePath)) {
          const depPackageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
          
          // 估算包大小（基于文件数量和复杂度）
          let estimatedSize = 0;
          const depDir = join('node_modules', name);
          
          if (existsSync(depDir)) {
            const files = getAllFiles(depDir);
            estimatedSize = files.reduce((sum, file) => {
              try {
                return sum + statSync(file).size;
              } catch {
                return sum;
              }
            }, 0);
          }
          
          dependencyAnalysis.push({
            name,
            version,
            estimatedSizeKB: (estimatedSize / 1024).toFixed(2),
            description: depPackageJson.description || 'No description'
          });
        }
      } catch (error) {
        // 忽略单个依赖的错误
      }
    }
    
    return dependencyAnalysis.sort((a, b) => parseFloat(b.estimatedSizeKB) - parseFloat(a.estimatedSizeKB));
  } catch (error) {
    console.warn('无法分析依赖大小:', error.message);
    return [];
  }
}

// 获取目录下所有文件
function getAllFiles(dir, extensions = ['.js', '.ts', '.tsx', '.jsx']) {
  const files = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (item.isFile() && (extensions.length === 0 || extensions.includes(extname(item.name)))) {
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

// 分析代码分割机会
function analyzeCodeSplittingOpportunities() {
  const opportunities = [];
  
  // 检查路由文件
  const routeFiles = getAllFiles('app', ['.tsx', '.ts']);
  const largeRoutes = [];
  
  for (const file of routeFiles) {
    if (file.includes('page.tsx')) {
      try {
        const content = readFileSync(file, 'utf-8');
        const size = Buffer.byteLength(content, 'utf8');
        
        if (size > 5000) { // 大于5KB的页面
          largeRoutes.push({
            path: file,
            sizeKB: (size / 1024).toFixed(2),
            imports: (content.match(/^import\s+/gm) || []).length
          });
        }
      } catch (error) {
        // 忽略读取错误
      }
    }
  }
  
  if (largeRoutes.length > 0) {
    opportunities.push({
      type: 'large-pages',
      description: '大型页面组件可以进行代码分割',
      items: largeRoutes.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB))
    });
  }
  
  // 检查共享组件
  const componentFiles = getAllFiles('src/components', ['.tsx', '.ts']);
  const largeComponents = [];
  
  for (const file of componentFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const size = Buffer.byteLength(content, 'utf8');
      
      if (size > 3000) { // 大于3KB的组件
        largeComponents.push({
          path: file,
          sizeKB: (size / 1024).toFixed(2),
          exports: (content.match(/^export\s+/gm) || []).length
        });
      }
    } catch (error) {
      // 忽略读取错误
    }
  }
  
  if (largeComponents.length > 0) {
    opportunities.push({
      type: 'large-components',
      description: '大型组件可以考虑懒加载',
      items: largeComponents.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB))
    });
  }
  
  return opportunities;
}

// 分析静态资源
function analyzeStaticAssets() {
  const assets = [];
  
  if (existsSync('public')) {
    const publicFiles = getAllFiles('public', []);
    
    for (const file of publicFiles) {
      try {
        const stats = statSync(file);
        const ext = extname(file).toLowerCase();
        
        assets.push({
          path: file,
          sizeKB: (stats.size / 1024).toFixed(2),
          type: getAssetType(ext)
        });
      } catch (error) {
        // 忽略错误
      }
    }
  }
  
  return assets.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB));
}

function getAssetType(ext) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const fontExts = ['.woff', '.woff2', '.ttf', '.otf'];
  const videoExts = ['.mp4', '.webm', '.ogg'];
  
  if (imageExts.includes(ext)) return 'image';
  if (fontExts.includes(ext)) return 'font';
  if (videoExts.includes(ext)) return 'video';
  return 'other';
}

// 检查Next.js配置
function analyzeNextConfig() {
  const analysis = {
    hasOptimization: false,
    hasCompression: false,
    hasImageOptimization: false,
    hasBundleAnalyzer: false
  };
  
  try {
    if (existsSync('next.config.ts')) {
      const content = readFileSync('next.config.ts', 'utf-8');
      
      analysis.hasOptimization = content.includes('optimization') || content.includes('minimize');
      analysis.hasCompression = content.includes('compress') || content.includes('gzip');
      analysis.hasImageOptimization = content.includes('images') && content.includes('optimize');
      analysis.hasBundleAnalyzer = content.includes('bundle-analyzer') || content.includes('@next/bundle-analyzer');
    }
  } catch (error) {
    console.warn('无法分析Next.js配置:', error.message);
  }
  
  return analysis;
}

// 生成优化建议
function generateOptimizationSuggestions(dependencies, opportunities, assets, nextConfig) {
  const suggestions = [];
  
  // 依赖优化建议
  const largeDeps = dependencies.filter(dep => parseFloat(dep.estimatedSizeKB) > 100);
  if (largeDeps.length > 0) {
    suggestions.push({
      category: 'dependencies',
      priority: 'high',
      title: '大型依赖优化',
      description: `发现 ${largeDeps.length} 个大型依赖，考虑替换或按需导入`,
      items: largeDeps.slice(0, 5).map(dep => `${dep.name}: ${dep.estimatedSizeKB}KB`)
    });
  }
  
  // 代码分割建议
  if (opportunities.length > 0) {
    suggestions.push({
      category: 'code-splitting',
      priority: 'medium',
      title: '代码分割机会',
      description: '发现可以进行代码分割的组件和页面',
      items: opportunities.map(opp => `${opp.type}: ${opp.items.length} 个文件`)
    });
  }
  
  // 静态资源优化
  const largeAssets = assets.filter(asset => parseFloat(asset.sizeKB) > 100);
  if (largeAssets.length > 0) {
    suggestions.push({
      category: 'assets',
      priority: 'medium',
      title: '静态资源优化',
      description: `发现 ${largeAssets.length} 个大型静态资源`,
      items: largeAssets.slice(0, 5).map(asset => `${basename(asset.path)}: ${asset.sizeKB}KB`)
    });
  }
  
  // Next.js配置建议
  if (!nextConfig.hasBundleAnalyzer) {
    suggestions.push({
      category: 'config',
      priority: 'low',
      title: 'Bundle分析工具',
      description: '建议添加@next/bundle-analyzer进行详细的bundle分析',
      items: ['npm install @next/bundle-analyzer']
    });
  }
  
  if (!nextConfig.hasImageOptimization) {
    suggestions.push({
      category: 'config',
      priority: 'medium',
      title: '图片优化',
      description: '建议启用Next.js图片优化功能',
      items: ['配置next.config.ts中的images选项']
    });
  }
  
  return suggestions;
}

// 主分析函数
function performBundleAnalysis() {
  console.log('📊 分析依赖大小...');
  const dependencies = analyzeDependencySize();
  
  console.log('🔍 分析代码分割机会...');
  const opportunities = analyzeCodeSplittingOpportunities();
  
  console.log('🖼️  分析静态资源...');
  const assets = analyzeStaticAssets();
  
  console.log('⚙️  分析Next.js配置...');
  const nextConfig = analyzeNextConfig();
  
  // 显示结果
  console.log(`\n📦 依赖分析 (前10个最大的依赖):`);
  dependencies.slice(0, 10).forEach(dep => {
    console.log(`  ${dep.name}: ${dep.estimatedSizeKB}KB`);
  });
  
  console.log(`\n🔄 代码分割机会:`);
  if (opportunities.length === 0) {
    console.log('  ✅ 未发现明显的代码分割机会');
  } else {
    opportunities.forEach(opp => {
      console.log(`  ${opp.description}: ${opp.items.length} 个文件`);
    });
  }
  
  console.log(`\n🖼️  静态资源 (前5个最大的资源):`);
  if (assets.length === 0) {
    console.log('  📁 public目录为空或不存在');
  } else {
    assets.slice(0, 5).forEach(asset => {
      console.log(`  ${basename(asset.path)} (${asset.type}): ${asset.sizeKB}KB`);
    });
  }
  
  console.log(`\n⚙️  Next.js配置状态:`);
  console.log(`  Bundle分析器: ${nextConfig.hasBundleAnalyzer ? '✅' : '❌'}`);
  console.log(`  图片优化: ${nextConfig.hasImageOptimization ? '✅' : '❌'}`);
  console.log(`  压缩配置: ${nextConfig.hasCompression ? '✅' : '❌'}`);
  
  // 生成建议
  const suggestions = generateOptimizationSuggestions(dependencies, opportunities, assets, nextConfig);
  
  console.log(`\n💡 优化建议:`);
  suggestions.forEach(suggestion => {
    const priority = suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢';
    console.log(`  ${priority} ${suggestion.title}: ${suggestion.description}`);
    suggestion.items.forEach(item => {
      console.log(`    - ${item}`);
    });
  });
  
  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    dependencies: dependencies.slice(0, 20),
    codeSplittingOpportunities: opportunities,
    staticAssets: assets.slice(0, 20),
    nextConfig,
    suggestions
  };
  
  try {
    writeFileSync('tmp/bundle-analysis-report.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 Bundle分析报告已保存到: tmp/bundle-analysis-report.json`);
  } catch (error) {
    console.warn('无法保存报告文件:', error.message);
  }
  
  return report;
}

// 运行分析
const report = performBundleAnalysis();

console.log(`\n✅ Bundle分析完成!`);
console.log(`📊 分析了 ${report.dependencies.length} 个依赖, ${report.staticAssets.length} 个静态资源`);