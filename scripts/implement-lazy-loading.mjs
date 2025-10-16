#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('⚡ 开始实施路由懒加载优化...\n');

// 获取所有页面文件
function getAllPageFiles(dir) {
  const files = [];
  
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
        } else if (item === 'page.tsx' || item === 'page.ts' || item === 'page.jsx' || item === 'page.js') {
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

// 检查文件是否已经使用了懒加载
function isAlreadyLazyLoaded(content) {
  return content.includes('dynamic(') || 
         content.includes('React.lazy') || 
         content.includes('lazy(') ||
         content.includes('import(');
}

// 检查是否是简单的页面组件
function isSimplePageComponent(content) {
  // 如果文件很小且没有复杂逻辑，可能不需要懒加载
  return content.length < 500 && 
         !content.includes('useEffect') && 
         !content.includes('useState') &&
         !content.includes('fetch') &&
         !content.includes('axios') &&
         !content.includes('EditableTable') &&
         !content.includes('StandardFormPage');
}

// 检查是否是大型页面（需要优先优化）
function isLargePage(content) {
  return content.length > 5000 || 
         content.includes('EditableTable') ||
         content.includes('useTableData') ||
         (content.match(/import.*from/g) || []).length > 10;
}

// 优化页面文件以使用懒加载
function optimizePageFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 跳过已经优化的文件
    if (isAlreadyLazyLoaded(content)) {
      return { success: false, reason: 'already-optimized' };
    }
    
    // 跳过简单的页面
    if (isSimplePageComponent(content)) {
      return { success: false, reason: 'too-simple' };
    }
    
    // 检查是否是客户端组件
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
    
    // 提取组件名称
    const componentMatch = content.match(/export\s+default\s+function\s+(\w+)/);
    const componentName = componentMatch ? componentMatch[1] : 'PageComponent';
    
    // 检查是否是大型页面
    const isLarge = isLargePage(content);
    
    // 为大型页面使用更积极的优化策略
    if (isLarge && isClientComponent) {
      // 对于大型客户端组件，使用dynamic with loading
      const optimizedContent = `'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// 懒加载页面组件 - 大型页面优化
const ${componentName}Lazy = dynamic(() => import('./${componentName}Component'), {
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px' 
    }}>
      <Spin size="large" tip="页面加载中..." />
    </div>
  ),
  ssr: false
});

export default function ${componentName}() {
  return <${componentName}Lazy />;
}
`;
      
      // 创建实际的组件文件，移除'use client'指令
      const componentContent = content.replace(/['"]use client['"];?\s*\n?/, '');
      const componentFilePath = filePath.replace(/page\.(tsx|ts|jsx|js)$/, `${componentName}Component.tsx`);
      
      writeFileSync(componentFilePath, componentContent);
      writeFileSync(filePath, optimizedContent);
      
      return { success: true, componentName, isClientComponent: true, isLarge: true };
      
    } else if (isClientComponent) {
      // 对于普通客户端组件
      const optimizedContent = `'use client';

import dynamic from 'next/dynamic';

// 懒加载页面组件
const ${componentName}Lazy = dynamic(() => import('./${componentName}Component'), {
  loading: () => <div>加载中...</div>,
  ssr: false
});

export default function ${componentName}() {
  return <${componentName}Lazy />;
}
`;
      
      const componentContent = content.replace(/['"]use client['"];?\s*\n?/, '');
      const componentFilePath = filePath.replace(/page\.(tsx|ts|jsx|js)$/, `${componentName}Component.tsx`);
      
      writeFileSync(componentFilePath, componentContent);
      writeFileSync(filePath, optimizedContent);
      
      return { success: true, componentName, isClientComponent: true, isLarge: false };
      
    } else {
      // 对于服务器组件，使用React.lazy
      const optimizedContent = `import { Suspense, lazy } from 'react';

// 懒加载页面组件
const ${componentName}Lazy = lazy(() => import('./${componentName}Component'));

export default function ${componentName}() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <${componentName}Lazy />
    </Suspense>
  );
}
`;
      
      const componentFilePath = filePath.replace(/page\.(tsx|ts|jsx|js)$/, `${componentName}Component.tsx`);
      writeFileSync(componentFilePath, content);
      writeFileSync(filePath, optimizedContent);
      
      return { success: true, componentName, isClientComponent: false, isLarge };
    }
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
}

// 主函数
async function implementLazyLoading() {
  try {
    console.log('📊 扫描页面文件...');
    
    const appDir = join(projectRoot, 'app');
    const pageFiles = getAllPageFiles(appDir);
    
    console.log(`找到 ${pageFiles.length} 个页面文件\n`);
    
    let optimizedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const results = [];
    
    for (const filePath of pageFiles) {
      const relativePath = relative(projectRoot, filePath);
      console.log(`处理: ${relativePath}`);
      
      const result = optimizePageFile(filePath);
      
      if (result.success) {
        optimizedCount++;
        console.log(`  ✅ 已优化 (${result.isClientComponent ? '客户端' : '服务器'}组件)`);
        results.push({
          file: relativePath,
          status: 'optimized',
          componentName: result.componentName,
          type: result.isClientComponent ? 'client' : 'server'
        });
      } else {
        if (result.reason === 'already-optimized') {
          skippedCount++;
          console.log(`  ⏭️  已优化，跳过`);
        } else if (result.reason === 'too-simple') {
          skippedCount++;
          console.log(`  ⏭️  组件过于简单，跳过`);
        } else {
          errorCount++;
          console.log(`  ❌ 优化失败: ${result.error || result.reason}`);
        }
        
        results.push({
          file: relativePath,
          status: 'skipped',
          reason: result.reason
        });
      }
    }
    
    console.log('\n📈 懒加载优化结果:');
    console.log(`  总文件数: ${pageFiles.length}`);
    console.log(`  已优化: ${optimizedCount}`);
    console.log(`  跳过: ${skippedCount}`);
    console.log(`  错误: ${errorCount}`);
    console.log(`  优化率: ${((optimizedCount / pageFiles.length) * 100).toFixed(1)}%`);
    
    // 保存结果报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: pageFiles.length,
        optimized: optimizedCount,
        skipped: skippedCount,
        errors: errorCount,
        optimizationRate: Math.round((optimizedCount / pageFiles.length) * 100)
      },
      results
    };
    
    const reportPath = join(projectRoot, 'tmp', 'lazy-loading-optimization-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath.replace(projectRoot, '.')}`);
    console.log('\n✅ 路由懒加载优化完成!');
    
    if (optimizedCount > 0) {
      console.log('\n🔄 建议重新运行性能测试以查看改进效果');
    }
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行优化
implementLazyLoading();