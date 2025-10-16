# 钉钉机器人通知配置指南

## 📋 概述

本项目已集成钉钉机器人通知功能，可以在以下情况自动发送通知：
- ✅ CI检查完成（成功/失败）
- 🚀 部署完成（成功/失败）
- ⚠️ 构建过程中的重要状态变化

## 🔧 配置步骤

### 1. 创建钉钉机器人

1. **打开钉钉群聊**
   - 进入需要接收通知的钉钉群
   - 点击群设置 → 智能群助手 → 添加机器人

2. **选择自定义机器人**
   - 选择"自定义"机器人类型
   - 设置机器人名称（如：GitHub部署通知）
   - 设置机器人头像（可选）

3. **配置安全设置**
   - 推荐选择"加签"方式（更安全）
   - 或者选择"自定义关键词"，添加关键词如：部署、CI、GitHub
   - 复制生成的Webhook地址

### 2. 在GitHub仓库中配置Secret

1. **进入GitHub仓库设置**
   ```
   GitHub仓库 → Settings → Secrets and variables → Actions
   ```

2. **添加新的Secret**
   - 点击"New repository secret"
   - Name: `DINGTALK_WEBHOOK`
   - Value: 粘贴钉钉机器人的Webhook地址
   - 点击"Add secret"

### 3. 验证配置

配置完成后，下次推送代码到main分支时，钉钉群会收到通知消息。

## 📱 通知消息格式

### CI检查通知
```markdown
### ✅ CI检查完成

**项目**: front-base
**分支**: main
**提交**: a1b2c3d
**提交信息**: feat: 添加新功能

**检查结果**:
✅ lint: success
✅ test: success
✅ build: success
✅ security: success

**检查时间**: 2024-01-15 14:30:25
**查看详情**: [GitHub Actions](链接)
```

### 部署成功通知
```markdown
### 🚀 生产环境部署成功

**项目**: front-base
**分支**: main
**提交**: a1b2c3d
**提交信息**: feat: 添加新功能
**部署链接**: [点击访问](https://your-app.vercel.app)
**部署时间**: 2024-01-15 14:35:10
```

### 部署失败通知
```markdown
### ❌ 部署失败

**项目**: front-base
**分支**: main
**提交**: a1b2c3d
**提交信息**: fix: 修复bug
**失败时间**: 2024-01-15 14:35:10
**查看详情**: [GitHub Actions](链接)
```

## 🔍 故障排除

### 常见问题

1. **没有收到通知**
   - 检查GitHub Secret `DINGTALK_WEBHOOK` 是否正确配置
   - 确认钉钉机器人的安全设置（关键词/加签）
   - 查看GitHub Actions日志中的钉钉通知步骤

2. **通知格式异常**
   - 检查钉钉机器人是否支持Markdown格式
   - 确认Webhook地址是否正确

3. **部分通知缺失**
   - 检查GitHub Actions工作流是否正常执行
   - 确认相关步骤没有被跳过

### 调试方法

1. **查看GitHub Actions日志**
   ```
   GitHub仓库 → Actions → 选择具体的工作流运行 → 查看钉钉通知步骤的日志
   ```

2. **测试钉钉Webhook**
   ```bash
   curl -X POST "你的webhook地址" \
        -H "Content-Type: application/json" \
        -d '{
          "msgtype": "text",
          "text": {
            "content": "测试消息"
          }
        }'
   ```

## ⚙️ 自定义配置

### 修改通知内容

编辑以下文件来自定义通知内容：
- `.github/workflows/deploy.yml` - 部署通知
- `.github/workflows/ci.yml` - CI通知

### 添加更多触发条件

可以在工作流中添加更多的通知触发点：
```yaml
- name: Send custom notification
  if: steps.some_step.outcome == 'failure'
  # ... 钉钉通知配置
```

## 🔒 安全注意事项

1. **保护Webhook地址**
   - 不要在代码中硬编码Webhook地址
   - 使用GitHub Secrets存储敏感信息

2. **限制机器人权限**
   - 使用关键词或加签验证
   - 定期更换Webhook地址

3. **监控通知频率**
   - 避免过于频繁的通知
   - 合理设置通知触发条件

## 📚 相关文档

- [钉钉机器人开发文档](https://developers.dingtalk.com/document/app/custom-robot-access)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [GitHub Secrets管理](https://docs.github.com/en/actions/security-guides/encrypted-secrets)