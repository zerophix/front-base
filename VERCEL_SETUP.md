# Vercel 部署配置指南

## 🚀 概述

本文档提供了在 Vercel 上部署项目的完整配置指南，特别是环境变量的设置。

## 📋 必需的环境变量

以下环境变量是生产环境运行所必需的：

### 🔐 安全密钥

**重要提示**: 请使用 `scripts/generate-env-keys.js` 脚本生成您自己的安全密钥！

```bash
# 运行脚本生成密钥
node scripts/generate-env-keys.js
```

需要配置的环境变量：
- `ENCRYPTION_KEY` - 数据加密密钥（64字符十六进制）
- `JWT_SECRET` - JWT令牌签名密钥（128字符十六进制）
- `JWT_REFRESH_SECRET` - JWT刷新令牌密钥（128字符十六进制）
- `CSRF_SECRET` - CSRF保护密钥（64字符十六进制）
- `SESSION_SECRET` - 会话密钥（128字符十六进制）

### 🤖 钉钉机器人（可选）
```bash
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN_HERE
```

## 🛠️ 在 Vercel 中配置环境变量

### 1. 登录 Vercel
访问 [vercel.com](https://vercel.com) 并登录您的账户

### 2. 选择项目
在仪表板中找到并点击您的项目

### 3. 进入设置
点击项目页面顶部的 **Settings** 标签

### 4. 添加环境变量
1. 在左侧菜单中选择 **Environment Variables**
2. 在 **Name** 字段输入变量名（如 `ENCRYPTION_KEY`）
3. 在 **Value** 字段输入对应的值
4. 选择环境：**Production**, **Preview**, **Development**（建议全选）
5. 点击 **Save** 保存

### 5. 重新部署
- 返回项目主页
- 点击 **Deployments** 标签
- 点击最新部署右侧的三个点菜单
- 选择 **Redeploy** 重新部署

---

## 🚨 常见错误

### 1. `ENCRYPTION_KEY environment variable is required in production`
**原因**: 缺少 `ENCRYPTION_KEY` 环境变量
**解决方案**: 
- 确保在 Vercel 中添加了 `ENCRYPTION_KEY` 环境变量
- 检查变量名拼写是否正确
- 确保选择了 Production 环境

### 2. JWT 相关错误
**原因**: 缺少 JWT 密钥
**解决方案**: 添加 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`

### 3. CSRF 错误
**原因**: 缺少 CSRF 保护密钥
**解决方案**: 添加 `CSRF_SECRET`

---

## ✅ 验证配置

部署完成后，您可以通过以下方式验证配置：

1. 访问您的应用程序
2. 检查浏览器控制台是否有错误
3. 测试登录功能
4. 检查钉钉机器人通知（如果配置了）

---

## 🔄 自动化部署

Vercel 会在以下情况自动部署：
- 推送到 `main` 分支
- 创建 Pull Request（预览部署）
- 手动触发重新部署

---

## 🔒 安全最佳实践

1. **永远不要**将真实的密钥提交到 Git 仓库
2. **定期轮换**安全密钥
3. **使用强密钥**：确保密钥足够长且随机
4. **限制访问**：只给必要的人员访问 Vercel 项目
5. **监控部署**：定期检查部署日志

---

## 📚 相关链接

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [安全最佳实践](https://vercel.com/docs/security)

---

## 🆘 需要帮助？

如果遇到问题，请：
1. 检查 Vercel 部署日志
2. 确认所有环境变量都已正确设置
3. 运行 `scripts/generate-env-keys.js` 重新生成密钥
4. 联系开发团队获取支持