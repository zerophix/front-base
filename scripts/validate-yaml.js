const fs = require('fs');

// 简单的YAML语法检查
function validateYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查基本的YAML语法问题
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // 跳过空行和注释
      if (!line.trim() || line.trim().startsWith('#')) continue;
      
      // 检查制表符
      if (line.includes('\t')) {
        throw new Error(`第${lineNum}行包含制表符，YAML应使用空格缩进`);
      }
      
      // 检查基本的冒号语法
      if (line.includes(':') && !line.includes('://')) {
        const colonIndex = line.indexOf(':');
        const afterColon = line.substring(colonIndex + 1);
        if (afterColon && !afterColon.startsWith(' ') && afterColon !== '') {
          console.warn(`警告: 第${lineNum}行冒号后可能缺少空格`);
        }
      }
    }
    
    console.log(`✅ ${filePath}: 基本语法检查通过`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

const files = [
  '.github/workflows/ci.yml',
  '.github/workflows/e2e.yml', 
  '.github/workflows/deploy.yml'
];

let allValid = true;
files.forEach(file => {
  if (fs.existsSync(file)) {
    if (!validateYaml(file)) {
      allValid = false;
    }
  } else {
    console.warn(`⚠️ ${file}: 文件不存在`);
  }
});

if (allValid) {
  console.log('🎉 所有YAML文件基本语法检查通过');
} else {
  process.exit(1);
}