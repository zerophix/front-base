# GitHub Secrets 配置指南

## 🚨 CI/CD 失败原因

当前CI/CD流程失败是因为GitHub仓库中缺少必要的secrets配置。

## 📋 必需的GitHub Secrets

### 1. Vercel相关Secrets

#### `VERCEL_TOKEN`
- **描述**: Vercel API访问令牌
- **获取方式**: 
  1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
  2. 点击右上角头像 → Settings
  3. 左侧菜单选择 "Tokens"
  4. 点击 "Create" 创建新token
  5. 复制生成的token

#### `VERCEL_ORG_ID`
- **描述**: Vercel组织ID
- **获取方式**: 
  1. 在项目根目录运行: `vercel link`
  2. 按提示链接到Vercel项目
  3. 查看生成的 `.vercel/project.json` 文件中的 `orgId`

#### `VERCEL_PROJECT_ID`
- **描述**: Vercel项目ID
- **获取方式**: 
  1. 同上，查看 `.vercel/project.json` 文件中的 `projectId`
  2. 或在Vercel Dashboard项目设置中查看

### 2. 钉钉通知Secrets（可选）

#### `DINGTALK_WEBHOOK`
- **描述**: 钉钉机器人Webhook URL
- **获取方式**: 参考 `DINGTALK_SETUP.md` 文档

## 🛠️ 在GitHub中配置Secrets

### 步骤：
1. 打开GitHub仓库页面
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**
5. 输入Secret名称和值
6. 点击 **Add secret**

### 需要添加的Secrets：
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
DINGTALK_WEBHOOK=your_dingtalk_webhook_here (可选)
```

## 🔧 本地设置Vercel项目

如果还没有链接Vercel项目，请运行：

```bash
# 安装Vercel CLI (如果还没安装)
npm install -g vercel

# 链接项目到Vercel
vercel link

# 这将创建 .vercel/project.json 文件
# 从中获取 orgId 和 projectId
```

## ✅ 验证配置

配置完成后，推送代码到main分支将触发CI/CD流程：

```bash
git push origin main
```

检查GitHub Actions页面确认部署成功。

## 📚 相关文档

- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Vercel环境变量配置
- [DINGTALK_SETUP.md](./DINGTALK_SETUP.md) - 钉钉机器人配置
- [Vercel CLI文档](https://vercel.com/docs/cli)
- [GitHub Secrets文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)