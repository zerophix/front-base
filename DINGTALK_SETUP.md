# 钉钉机器人通知配置指南

本项目已集成钉钉机器人通知功能，可以在CI检查和部署完成时自动发送通知到钉钉群。

## 功能概述

- **CI检查通知**: 代码检查、测试、构建、安全扫描完成后发送结果通知
- **部署通知**: Vercel部署成功或失败时发送通知
- **详细信息**: 包含项目、分支、提交信息、执行结果等详细信息

## 配置步骤

### 1. 创建钉钉机器人

1. 在钉钉群中，点击群设置 → 智能群助手 → 添加机器人
2. 选择"自定义"机器人
3. 设置机器人名称（如：GitHub通知机器人）
4. 安全设置选择"自定义关键词"，添加关键词：`CI`、`部署`、`GitHub`
5. 复制生成的Webhook地址

### 2. 在GitHub中配置Secret

1. 进入GitHub仓库页面
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. Name: `DINGTALK_WEBHOOK`
5. Secret: 粘贴钉钉机器人的Webhook地址
6. 点击 "Add secret"

### 3. 验证配置

推送代码到main分支或创建Pull Request，观察钉钉群是否收到通知。

## 通知消息格式

### CI检查通知示例
```
✅ CI检查完成

项目: front-base
分支: main
提交: a1b2c3d

检查结果:
- 代码检查: ✅ success
- 单元测试: ✅ success
- 构建测试: ✅ success
- 安全检查: ✅ success

总体状态: ✅ 所有检查通过
时间: 2024-01-15 14:30:25
详情: https://github.com/username/front-base/actions
```

### 部署通知示例
```
🚀 生产环境部署成功

项目: front-base
分支: main
提交: a1b2c3d
状态: success
时间: 2024-01-15 14:35:10
链接: https://your-app.vercel.app
详情: https://github.com/username/front-base/actions
```

## 故障排除

### 1. 通知未发送
- 检查GitHub Secrets中的`DINGTALK_WEBHOOK`是否正确设置
- 确认钉钉机器人未被禁用
- 查看GitHub Actions日志中的错误信息
- 使用测试脚本验证webhook连接

### 2. 使用测试脚本
项目中包含了一个测试脚本 `test-dingtalk.js`，可以用来验证钉钉webhook配置：

```bash
# 设置webhook地址并运行测试
DINGTALK_WEBHOOK=你的webhook地址 node test-dingtalk.js
```

测试脚本会：
- 验证webhook地址格式
- 发送测试消息到钉钉群
- 显示详细的调试信息
- 报告测试结果

### 3. 常见问题解决

#### 问题1: GitHub Actions中看不到通知步骤执行
**解决方案:**
- 确保推送了最新的workflow配置
- 检查workflow文件语法是否正确
- 查看Actions页面是否有错误

#### 问题2: 通知步骤执行但钉钉群无消息
**解决方案:**
- 检查DINGTALK_WEBHOOK Secret是否正确设置
- 确认webhook地址格式正确
- 验证钉钉机器人状态是否正常
- 使用测试脚本进行本地验证

#### 问题3: 消息格式显示异常
**解决方案:**
- 当前配置使用text格式，兼容性最好
- 如需markdown格式，可修改msgtype为"markdown"
- 检查特殊字符是否需要转义

### 4. 调试步骤
1. 首先使用测试脚本验证webhook基本功能
2. 检查GitHub Actions执行日志
3. 确认Secret配置正确
4. 验证钉钉机器人权限设置

## 自定义配置

### 修改通知内容
编辑以下文件来自定义通知内容：
- `.github/workflows/ci.yml` - CI检查通知
- `.github/workflows/deploy.yml` - 部署通知

### 添加更多触发条件
可以在workflow文件中添加更多的触发条件，如：
- 特定分支的推送
- 标签创建
- 定时任务

## 安全注意事项

1. **保护Webhook地址**: 不要在代码中硬编码webhook地址
2. **使用GitHub Secrets**: 始终通过Secrets管理敏感信息
3. **关键词验证**: 确保钉钉机器人设置了安全关键词
4. **权限控制**: 定期检查机器人权限和群组设置

## 支持的消息类型

当前配置支持以下消息类型：
- `text`: 纯文本消息（当前使用）
- `markdown`: Markdown格式消息
- `link`: 链接消息
- `actionCard`: 卡片消息

如需修改消息类型，请编辑workflow文件中的`msgtype`字段。