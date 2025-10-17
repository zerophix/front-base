# 部署策略说明

## 概述

本项目采用**分离式CI/CD策略**，将代码质量检查和实际部署分开处理，避免在GitHub Actions中配置复杂的Vercel secrets。

## 架构设计

### 1. CI流程 (ci.yml)
- **目的**: 代码质量保证
- **触发**: 推送到main/develop分支，PR创建
- **内容**: 
  - ESLint检查
  - Stylelint检查
  - 单元测试
  - 代码覆盖率

### 2. 部署通知流程 (deploy.yml)
- **目的**: 主分支代码质量验证 + 部署通知
- **触发**: 推送到main分支
- **内容**:
  - 运行测试
  - 运行linting
  - 构建检查
  - 钉钉通知

### 3. 实际部署
- **平台**: Vercel自动部署
- **触发**: GitHub仓库推送
- **配置**: 在Vercel控制台中连接GitHub仓库

## 优势

1. **简化配置**: 无需在GitHub中配置复杂的Vercel secrets
2. **职责分离**: CI专注代码质量，部署由Vercel处理
3. **更可靠**: 减少因secrets配置错误导致的部署失败
4. **易维护**: 配置更简单，问题更容易排查

## Vercel配置步骤

### 1. 在Vercel控制台中
1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择从GitHub导入
4. 选择 `front-base` 仓库
5. 配置环境变量（参考 VERCEL_SETUP.md）

### 2. 环境变量配置
在Vercel项目设置中添加以下环境变量：
- `ENCRYPTION_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CSRF_SECRET`
- `SESSION_SECRET`

### 3. 自动部署设置
- **生产环境**: main分支自动部署
- **预览环境**: 其他分支和PR自动创建预览

## 通知机制

### GitHub Actions通知
- 代码质量检查结果
- 构建状态
- 钉钉机器人通知

### Vercel通知
- 部署开始/完成通知
- 可在Vercel控制台中配置

## 故障排除

### 常见问题
1. **CI失败**: 检查代码质量（linting、测试）
2. **部署失败**: 检查Vercel控制台和环境变量配置
3. **通知失败**: 检查钉钉webhook配置

### 调试步骤
1. 查看GitHub Actions日志
2. 查看Vercel部署日志
3. 检查环境变量配置
4. 验证钉钉webhook

## 最佳实践

1. **开发流程**:
   - 功能分支开发
   - 创建PR触发CI检查
   - 合并到main触发部署

2. **监控**:
   - 关注GitHub Actions状态
   - 监控Vercel部署状态
   - 配置钉钉通知

3. **安全**:
   - 环境变量只在Vercel中配置
   - 定期轮换密钥
   - 监控访问日志