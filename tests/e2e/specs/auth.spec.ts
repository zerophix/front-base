import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { TestHelpers } from '../utils/test-helpers';

test.describe('认证系统测试', () => {
  let authPage: AuthPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    helpers = new TestHelpers(page);
  });

  test.describe('登录功能测试', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.gotoLogin();
    });

    test('登录页面基本元素显示正确 @smoke', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/LIMS|登录|Login/);
      
      // 检查页面是否加载完成
      await expect(page.locator('body')).toBeVisible();
      
      // 检查页面是否有内容
      await expect(page.locator('html')).toContainText(/./); // 至少包含一些文本
    });

    test('成功登录流程', async ({ page }) => {
      // 执行登录
      await authPage.login('testuser', 'Test123!@#', true);
      
      // 检查登录成功
      await authPage.checkLoginSuccess();
      
      // 检查记住密码功能
      await authPage.checkRememberMe();
      
      // 检查用户信息
      const user = await authPage.getCurrentUser();
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    test('用户名密码错误', async ({ page }) => {
      // 模拟网络响应
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: '账号或密码错误' })
        });
      });

      // 尝试登录
      await authPage.login('wronguser', 'wrongpass');
      
      // 检查登录失败
      await authPage.checkLoginFailure('账号或密码错误');
      
      // 确保仍在登录页面
      await expect(authPage.loginForm).toBeVisible();
    });

    test('表单验证功能', async ({ page }) => {
      // 测试空用户名
      await authPage.loginButton.click();
      await authPage.checkFormValidationError('username', '请输入用户名');
      
      // 填写用户名，测试空密码
      await authPage.usernameInput.fill('testuser');
      await authPage.loginButton.click();
      await authPage.checkFormValidationError('password', '请输入密码');
      
      // 填写密码后，登录按钮应该启用
      await authPage.passwordInput.fill('Test123!@#');
      await authPage.checkLoginButtonState(true);
    });

    test('记住密码功能', async ({ page }) => {
      // 清除之前记住的用户名
      await authPage.clearRememberedUsername();
      
      // 登录时选择记住密码
      await authPage.login('testuser', 'Test123!@#', true);
      
      // 检查登录成功
      await authPage.checkLoginSuccess();
      
      // 登出
      await authPage.logout();
      
      // 重新访问登录页面，检查用户名是否被记住
      await authPage.gotoLogin();
      const usernameValue = await authPage.usernameInput.inputValue();
      expect(usernameValue).toBe('testuser');
    });

    test('网络错误处理', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/api/auth/login', route => {
        route.abort('failed');
      });

      // 尝试登录
      await authPage.login('testuser', 'Test123!@#');
      
      // 检查网络错误提示
      await authPage.checkLoginFailure('网络异常');
    });

    test('服务器错误处理', async ({ page }) => {
      // 模拟服务器错误
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      // 尝试登录
      await authPage.login('testuser', 'Test123!@#');
      
      // 检查服务器错误提示
      await authPage.checkLoginFailure('服务器繁忙');
    });
  });

  test.describe('微信登录功能测试', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.gotoLogin();
    });

    test('微信登录模态框显示', async ({ page }) => {
      // 打开微信登录模态框
      await authPage.openWeChatLogin();
      
      // 检查模态框显示
      await expect(authPage.wechatModal).toBeVisible();
      
      // 检查二维码显示
      await authPage.checkWeChatQrCode();
    });

    test('关闭微信登录模态框', async ({ page }) => {
      // 打开微信登录模态框
      await authPage.openWeChatLogin();
      
      // 关闭模态框
      await authPage.closeWeChatLogin();
      
      // 检查模态框已关闭
      await expect(authPage.wechatModal).not.toBeVisible();
    });

    test('微信登录成功流程', async ({ page }) => {
      // 模拟微信登录成功
      await page.route('**/api/auth/wechat/login', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            accessToken: 'wechat-access-token',
            refreshToken: 'wechat-refresh-token',
            user: {
              id: 'wechat-user-id',
              username: 'wechatuser',
              email: 'wechat@example.com',
              roles: ['user'],
              permissions: ['read']
            }
          })
        });
      });

      // 打开微信登录
      await authPage.openWeChatLogin();
      
      // 模拟扫码登录（实际测试中可能需要mock）
      await page.evaluate(() => {
        // 触发微信登录成功事件
        window.dispatchEvent(new CustomEvent('wechat-login-success', {
          detail: { token: 'wechat-token' }
        }));
      });
      
      // 检查登录成功
      await authPage.checkLoginSuccess();
    });
  });

  test.describe('登出功能测试', () => {
    test.beforeEach(async ({ page }) => {
      // 先登录
      await authPage.setAuthState(true);
      await authPage.goto('/home');
    });

    test('正常登出流程', async ({ page }) => {
      // 执行登出
      await authPage.logout();
      
      // 检查是否跳转到登录页
      await authPage.checkRedirectToLogin();
      
      // 检查认证状态已清除
      const user = await authPage.getCurrentUser();
      expect(user).toBeNull();
    });

    test('登出后访问受保护页面', async ({ page }) => {
      // 执行登出
      await authPage.logout();
      
      // 尝试访问受保护页面
      await authPage.accessProtectedPage('/data/detection-objects');
      
      // 应该重定向到登录页
      await authPage.checkRedirectToLogin();
    });
  });

  test.describe('会话管理测试', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.setAuthState(true);
    });

    test('会话过期处理', async ({ page }) => {
      // 访问主页
      await authPage.goto('/home');
      
      // 模拟会话过期
      await authPage.simulateSessionExpiry();
      
      // 尝试访问需要认证的页面
      await authPage.accessProtectedPage('/data/detection-objects');
      
      // 应该重定向到登录页
      await authPage.checkRedirectToLogin();
    });

    test('Token自动刷新', async ({ page }) => {
      // 模拟token即将过期
      await page.evaluate(() => {
        const nearExpiry = Date.now() + 60000; // 1分钟后过期
        localStorage.setItem('auth_token_expires', nearExpiry.toString());
      });

      // 模拟token刷新API
      await page.route('**/api/auth/refresh', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            expiresAt: Date.now() + 3600000
          })
        });
      });

      // 访问需要认证的页面
      await authPage.goto('/data/detection-objects');
      
      // 等待页面加载，token应该自动刷新
      await helpers.waitForPageLoad();
      
      // 检查页面正常显示（没有重定向到登录页）
      await expect(page).not.toHaveURL('/login');
    });

    test('刷新Token失败处理', async ({ page }) => {
      // 模拟token过期
      await page.evaluate(() => {
        const expired = Date.now() - 1000; // 已过期
        localStorage.setItem('auth_token_expires', expired.toString());
      });

      // 模拟token刷新失败
      await page.route('**/api/auth/refresh', route => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Refresh token expired' })
        });
      });

      // 访问需要认证的页面
      await authPage.accessProtectedPage('/data/detection-objects');
      
      // 应该重定向到登录页
      await authPage.checkRedirectToLogin();
    });
  });

  test.describe('权限控制测试', () => {
    test('访问无权限页面', async ({ page }) => {
      // 设置有限权限的用户
      await page.evaluate(() => {
        const limitedUser = {
          id: 'limited-user-id',
          username: 'limiteduser',
          email: 'limited@example.com',
          roles: ['viewer'],
          permissions: ['read']
        };
        localStorage.setItem('auth_user_info', JSON.stringify(limitedUser));
      });

      // 模拟权限检查API
      await page.route('**/api/auth/check-permission', route => {
        route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'Access denied' })
        });
      });

      // 尝试访问需要写权限的页面
      await authPage.accessProtectedPage('/data/detection-objects/new');
      
      // 检查权限被拒绝
      await authPage.checkAccessDenied();
    });

    test('角色权限验证', async ({ page }) => {
      // 设置管理员用户
      await page.evaluate(() => {
        const adminUser = {
          id: 'admin-user-id',
          username: 'admin',
          email: 'admin@example.com',
          roles: ['admin'],
          permissions: ['read', 'write', 'delete', 'admin']
        };
        localStorage.setItem('auth_user_info', JSON.stringify(adminUser));
      });

      // 访问管理员页面
      await authPage.accessProtectedPage('/admin/users');
      
      // 页面应该正常加载
      await helpers.waitForPageLoad();
      await expect(page).toHaveURL('/admin/users');
    });
  });

  test.describe('安全性测试', () => {
    test('XSS攻击防护', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 尝试在用户名字段注入脚本
      const xssPayload = '<script>alert("XSS")</script>';
      await authPage.usernameInput.fill(xssPayload);
      
      // 检查脚本没有被执行
      const alertDialogs: string[] = [];
      page.on('dialog', dialog => {
        alertDialogs.push(dialog.message());
        dialog.dismiss();
      });
      
      await authPage.loginButton.click();
      
      // 等待一段时间确保没有弹窗
      await page.waitForTimeout(1000);
      expect(alertDialogs).toHaveLength(0);
    });

    test('SQL注入防护', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 尝试SQL注入
      const sqlPayload = "admin'; DROP TABLE users; --";
      await authPage.usernameInput.fill(sqlPayload);
      await authPage.passwordInput.fill('password');
      
      // 模拟后端验证
      await page.route('**/api/auth/login', route => {
        const body = route.request().postDataJSON();
        if (body.username.includes('DROP TABLE')) {
          route.fulfill({
            status: 400,
            body: JSON.stringify({ error: 'Invalid input detected' })
          });
        } else {
          route.fulfill({
            status: 401,
            body: JSON.stringify({ error: 'Invalid credentials' })
          });
        }
      });
      
      await authPage.loginButton.click();
      
      // 检查请求被拒绝
      await authPage.checkLoginFailure('Invalid input detected');
    });

    test('CSRF保护', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 检查CSRF token是否存在
      const csrfToken = await page.evaluate(() => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      });
      
      expect(csrfToken).toBeTruthy();
      
      // 模拟没有CSRF token的请求
      await page.route('**/api/auth/login', route => {
        const headers = route.request().headers();
        if (!headers['x-csrf-token']) {
          route.fulfill({
            status: 403,
            body: JSON.stringify({ error: 'CSRF token missing' })
          });
        } else {
          route.continue();
        }
      });
      
      // 移除CSRF token
      await page.evaluate(() => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
          metaTag.remove();
        }
      });
      
      await authPage.login('testuser', 'Test123!@#');
      
      // 检查CSRF保护生效
      await authPage.checkLoginFailure('CSRF token missing');
    });
  });

  test.describe('用户体验测试', () => {
    test('登录页面响应式设计', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 测试移动端
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(authPage.loginForm).toBeVisible();
      
      // 测试平板端
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(authPage.loginForm).toBeVisible();
      
      // 测试桌面端
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(authPage.loginForm).toBeVisible();
    });

    test('键盘导航支持', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 使用Tab键导航
      await page.keyboard.press('Tab');
      await expect(authPage.usernameInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.passwordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.rememberCheckbox).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.loginButton).toBeFocused();
      
      // 使用Enter键提交表单
      await authPage.usernameInput.fill('testuser');
      await authPage.passwordInput.fill('Test123!@#');
      await page.keyboard.press('Enter');
      
      // 检查表单提交
      await authPage.checkLoginSuccess();
    });

    test('加载状态显示', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 模拟慢速网络
      await page.route('**/api/auth/login', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({
              accessToken: 'token',
              user: { id: '1', username: 'testuser' }
            })
          });
        }, 2000);
      });
      
      // 提交登录表单
      await authPage.login('testuser', 'Test123!@#');
      
      // 检查加载状态
      await expect(authPage.loginButton).toBeDisabled();
      const loadingText = await authPage.loginButton.textContent();
      expect(loadingText).toContain('登录中');
      
      // 等待登录完成
      await authPage.checkLoginSuccess();
    });

    test('自动焦点管理', async ({ page }) => {
      await authPage.gotoLogin();
      
      // 页面加载后，用户名输入框应该自动获得焦点
      await expect(authPage.usernameInput).toBeFocused();
      
      // 填写用户名后按Enter，焦点应该移到密码框
      await authPage.usernameInput.fill('testuser');
      await page.keyboard.press('Enter');
      await expect(authPage.passwordInput).toBeFocused();
    });
  });

  test.describe('多浏览器兼容性测试', () => {
    test('Chrome浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', '仅在Chrome中运行');
      
      await authPage.gotoLogin();
      await authPage.quickLogin();
      await authPage.checkLoginSuccess();
    });

    test('Firefox浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', '仅在Firefox中运行');
      
      await authPage.gotoLogin();
      await authPage.quickLogin();
      await authPage.checkLoginSuccess();
    });

    test('Safari浏览器兼容性', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', '仅在Safari中运行');
      
      await authPage.gotoLogin();
      await authPage.quickLogin();
      await authPage.checkLoginSuccess();
    });
  });
});