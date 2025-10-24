# E2E测试指南

## 概述

本项目使用Playwright进行端到端(E2E)测试，通过GitHub Actions实现自动化测试流水线。

## 测试架构

### 1. 测试分层

- **冒烟测试 (Smoke Tests)**: 在主CI流水线中运行，验证核心功能
- **完整E2E测试**: 在专门的E2E工作流中运行，覆盖所有功能
- **定时测试**: 每天凌晨2点自动运行完整测试套件

### 2. 工作流配置

#### 主CI流水线 (`.github/workflows/ci.yml`)
- 运行冒烟测试 (`@smoke`标签)
- 仅使用Chromium浏览器
- 快速反馈，适合PR检查

#### E2E专用流水线 (`.github/workflows/e2e.yml`)
- 运行完整测试套件
- 多浏览器测试 (Chromium, Firefox, WebKit)
- 生成详细测试报告
- 部署报告到GitHub Pages

## 本地开发

### 安装依赖

```bash
npm install
npx playwright install
```

### 运行测试

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行冒烟测试
npm run test:e2e -- --grep="@smoke"

# 使用UI模式运行
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 有头模式 (显示浏览器)
npm run test:e2e:headed

# 查看测试报告
npm run test:e2e:report
```

### 测试标签

使用标签来分类测试：

- `@smoke`: 冒烟测试，核心功能验证
- `@regression`: 回归测试
- `@slow`: 慢速测试
- `@flaky`: 不稳定测试

示例：
```typescript
test('登录功能正常 @smoke', async ({ page }) => {
  // 测试代码
});
```

## 测试结构

```
tests/e2e/
├── fixtures/          # 测试夹具和基础配置
├── pages/             # 页面对象模型
├── specs/             # 测试用例
├── utils/             # 测试工具函数
├── global-setup.ts   # 全局设置
└── global-teardown.ts # 全局清理
```

### 页面对象模型

每个页面都有对应的页面对象：

- `HomePage.ts` - 首页
- `AuthPage.ts` - 认证页面
- `FormPage.ts` - 表单页面
- `ListPage.ts` - 列表页面

### 测试用例组织

- `home.spec.ts` - 首页功能测试
- `auth.spec.ts` - 认证功能测试
- `form.spec.ts` - 表单功能测试
- `list.spec.ts` - 列表功能测试

## CI/CD集成

### 触发条件

#### 主CI流水线
- 推送到 `main` 分支
- 创建Pull Request

#### E2E专用流水线
- 推送到 `main`, `develop` 分支
- 创建Pull Request到 `main`, `develop`
- 每天凌晨2点定时运行

### 测试报告

1. **Artifacts**: 测试结果和报告自动上传到GitHub Actions
2. **GitHub Pages**: 完整测试报告部署到 `https://your-username.github.io/your-repo/e2e-reports/`
3. **钉钉通知**: 测试结果自动发送到钉钉群

### 环境配置

测试环境变量：
- `NODE_ENV=test`
- `DINGTALK_WEBHOOK` (GitHub Secrets)

## 最佳实践

### 1. 编写稳定的测试

```typescript
// ✅ 好的做法
await page.waitForSelector('[data-testid="submit-button"]');
await page.click('[data-testid="submit-button"]');

// ❌ 避免的做法
await page.click('button'); // 选择器太宽泛
await page.waitForTimeout(5000); // 硬编码等待时间
```

### 2. 使用数据属性

```html
<!-- 为测试添加专用属性 -->
<button data-testid="submit-button">提交</button>
```

### 3. 独立的测试

每个测试应该独立运行，不依赖其他测试的状态。

### 4. 适当的等待

```typescript
// 等待元素出现
await expect(page.locator('[data-testid="result"]')).toBeVisible();

// 等待网络请求完成
await page.waitForResponse(response => 
  response.url().includes('/api/data') && response.status() === 200
);
```

### 5. 错误处理

```typescript
test('处理错误情况', async ({ page }) => {
  // 模拟网络错误
  await page.route('**/api/login', route => 
    route.fulfill({ status: 500 })
  );
  
  // 验证错误处理
  await expect(page.locator('.error-message')).toBeVisible();
});
```

## 故障排除

### 常见问题

1. **测试超时**
   - 增加超时时间
   - 检查网络请求
   - 优化页面加载

2. **元素找不到**
   - 检查选择器
   - 等待元素加载
   - 使用更稳定的选择器

3. **测试不稳定**
   - 添加适当的等待
   - 检查异步操作
   - 使用重试机制

### 调试技巧

```bash
# 调试特定测试
npx playwright test auth.spec.ts --debug

# 生成测试代码
npx playwright codegen localhost:3000

# 查看测试追踪
npx playwright show-trace test-results/trace.zip
```

## 性能监控

测试中包含性能检查：

```typescript
test('页面加载性能', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
});
```

## 维护指南

### 定期维护

1. **更新依赖**: 定期更新Playwright版本
2. **清理测试**: 删除过时的测试用例
3. **优化性能**: 减少测试执行时间
4. **监控稳定性**: 跟踪测试失败率

### 添加新测试

1. 确定测试类型（冒烟/回归/功能）
2. 选择合适的页面对象
3. 编写清晰的测试用例
4. 添加适当的标签
5. 验证测试稳定性

## 相关文档

- [Playwright官方文档](https://playwright.dev/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [项目部署指南](./DEPLOYMENT.md)
- [安全测试指南](./SECURITY_GUIDE.md)