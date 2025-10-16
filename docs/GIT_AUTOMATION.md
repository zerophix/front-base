# 🚀 Git 自动化提交指南

本文档介绍如何使用项目中的自动化Git提交功能，帮助你提高开发效率并保持代码质量。

## 📋 目录

- [功能概述](#功能概述)
- [快速开始](#快速开始)
- [使用方法](#使用方法)
- [配置说明](#配置说明)
- [提交规范](#提交规范)
- [故障排除](#故障排除)

## 🎯 功能概述

我们的自动化Git提交系统包含以下功能：

### ✨ 核心功能
- 🔍 **自动代码质量检查** - ESLint + StyleLint
- 🧪 **自动测试运行** - Jest测试套件
- 📝 **智能提交信息生成** - 基于文件变更自动生成
- 🎯 **提交信息格式验证** - 符合约定式提交规范
- 🚀 **一键提交推送** - 自动化整个提交流程

### 🛡️ 质量保障
- **Pre-commit钩子** - 提交前自动检查
- **Commit-msg钩子** - 提交信息格式验证
- **Lint-staged** - 只检查暂存的文件
- **测试覆盖率** - 确保代码质量

## 🚀 快速开始

### 1. 基础使用

```bash
# 最简单的使用方式
npm run commit
```

### 2. 跳过某些检查

```bash
# 跳过代码质量检查
npm run commit:skip-checks

# 跳过测试运行
npm run commit:skip-tests
```

### 3. 查看帮助

```bash
# 查看所有可用选项
npm run commit:help
```

## 📖 使用方法

### 方法一：使用npm脚本（推荐）

```bash
# 完整的自动化提交流程
npm run commit

# 跳过代码检查（快速提交）
npm run commit:skip-checks

# 跳过测试（适用于文档更新等）
npm run commit:skip-tests
```

### 方法二：直接运行脚本

```bash
# 完整流程
./scripts/auto-commit.sh

# 跳过检查
./scripts/auto-commit.sh --skip-checks

# 跳过测试
./scripts/auto-commit.sh --skip-tests
```

### 方法三：传统Git命令

```bash
# 仍然可以使用传统方式
git add .
git commit -m "feat: 添加新功能"
git push
```

## ⚙️ 配置说明

### Husky钩子配置

项目配置了以下Git钩子：

#### Pre-commit钩子 (`.husky/pre-commit`)
- 运行lint-staged检查暂存文件
- 执行测试套件
- 确保代码质量

#### Commit-msg钩子 (`.husky/commit-msg`)
- 验证提交信息格式
- 确保符合约定式提交规范

### Lint-staged配置

在`package.json`中配置：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix"
    ],
    "*.{css,scss}": [
      "stylelint --fix"
    ]
  }
}
```

### Git提交模板

项目使用`.gitmessage`模板文件，提供标准化的提交信息格式。

## 📝 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加用户登录功能` |
| `fix` | 修复bug | `fix(ui): 修复按钮样式问题` |
| `docs` | 文档更新 | `docs: 更新README文档` |
| `style` | 代码格式化 | `style: 修复代码缩进` |
| `refactor` | 代码重构 | `refactor(utils): 重构工具函数` |
| `test` | 测试相关 | `test: 添加用户登录测试` |
| `chore` | 构建/工具变动 | `chore: 更新依赖版本` |
| `perf` | 性能优化 | `perf: 优化列表渲染性能` |
| `ci` | CI配置 | `ci: 更新GitHub Actions` |
| `build` | 构建系统 | `build: 更新webpack配置` |
| `revert` | 回滚提交 | `revert: 回滚登录功能` |

### 作用域 (scope) - 可选

常用作用域：
- `components` - 组件相关
- `hooks` - Hook相关
- `services` - 服务层
- `utils` - 工具函数
- `app` - 应用层
- `auth` - 认证相关
- `ui` - UI相关

### 智能提交信息生成

自动化脚本会根据文件变更智能生成提交信息：

- **新增文件** → `feat: 添加新功能`
- **删除文件** → `chore: 删除文件`
- **修改组件** → `fix: 修复问题`
- **更新文档** → `docs: 更新文档`
- **样式文件** → `style: 样式更新`
- **测试文件** → `test: 更新测试`

## 🔧 自定义配置

### 修改检查规则

编辑`.husky/pre-commit`文件：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 运行提交前检查..."

# 可以注释掉不需要的检查
npx lint-staged

# 可以跳过测试
# npm test

echo "✅ 提交前检查完成！"
```

### 修改提交信息验证

编辑`.husky/commit-msg`文件中的正则表达式：

```bash
# 自定义提交信息格式
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'
```

### 自定义自动化脚本

编辑`scripts/auto-commit.sh`文件，可以：
- 修改智能提交信息生成逻辑
- 添加自定义检查步骤
- 调整用户交互流程

## 🛠️ 故障排除

### 常见问题

#### 1. 权限问题

```bash
# 确保脚本有执行权限
chmod +x scripts/auto-commit.sh
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

#### 2. Husky钩子不生效

```bash
# 重新安装husky
npm run prepare
```

#### 3. ESLint检查失败

```bash
# 手动修复ESLint问题
npm run lint -- --fix
```

#### 4. 测试失败

```bash
# 运行测试查看详细错误
npm test
```

#### 5. 提交信息格式错误

确保提交信息符合格式：`type(scope): description`

### 调试模式

```bash
# 查看详细的Git钩子执行日志
GIT_TRACE=1 git commit -m "test: 测试提交"
```

## 📚 最佳实践

### 1. 提交频率
- 小步快跑，频繁提交
- 每个提交只做一件事
- 保持提交历史清晰

### 2. 提交信息
- 使用现在时态："add" 而不是 "added"
- 首字母小写
- 不超过50个字符
- 详细描述放在body中

### 3. 代码质量
- 提交前确保代码通过所有检查
- 保持测试覆盖率
- 遵循项目代码规范

### 4. 团队协作
- 统一使用自动化提交工具
- 定期更新提交规范
- 及时修复CI/CD问题

## 🔗 相关链接

- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [Husky文档](https://typicode.github.io/husky/)
- [Lint-staged文档](https://github.com/okonet/lint-staged)
- [ESLint文档](https://eslint.org/)

---

## 💡 提示

使用自动化提交工具可以：
- ✅ 提高代码质量
- ✅ 统一提交规范
- ✅ 减少人为错误
- ✅ 提升开发效率
- ✅ 改善团队协作

开始使用：`npm run commit` 🚀